import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { FunctionsHttpError } from "@supabase/supabase-js";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TravellersInput from "@/components/TravellersInput";
import { supabase } from "@/integrations/supabase/client";
import { CONTACT_EMAIL, DELIVERY_TIME, SHOW_DELIVERY_TIME, track } from "@/lib/commerce";

/* ---------- Options ---------- */

const FLEX_OPTIONS = ["Exact dates", "± 1–2 days", "± 3–5 days", "Flexible within the month"] as const;
const CABIN_OPTIONS = ["Economy", "Premium Economy", "Business", "First", "Best value regardless of cabin"] as const;
const PRIORITY_OPTIONS = [
  "Lowest points",
  "Lowest taxes/fees",
  "Best cabin",
  "Fastest routing",
  "Specific dates",
  "Specific airline",
] as const;
const MAX_PRIORITIES = 2;
const CURRENCIES = ["MYR", "SGD", "HKD", "USD", "Other"] as const;

type PointsRow = { programme: string; balance: string };

type PublicOrder = {
  order_number: string;
  customer_name: string | null;
  customer_email: string | null;
  status: string;
  intake_status: string;
  intake_submitted_at: string | null;
  delivery_deadline: string | null;
  livemode: boolean;
};

type Gate =
  | { kind: "loading" }
  | { kind: "ready"; order: PublicOrder }
  | { kind: "done"; order: PublicOrder; justSubmitted: boolean }
  | { kind: "unpaid" }
  | { kind: "missing" }
  | { kind: "invalid" }
  | { kind: "error"; retry: boolean };

/* ---------- Validation ---------- */

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(120),
  email: z.string().trim().email("Please enter a valid email").max(255),
  departure_airport: z.string().trim().min(1, "Please enter your departure city or airport").max(120),
  destination: z.string().trim().min(1, "Please enter your destination").max(200),
  departure_date: z.string().min(1, "Please choose a departure date"),
  return_date: z.string().min(1, "Please choose a return date"),
  date_flexibility: z.string().min(1, "Please choose your flexibility"),
  travellers: z.number().int().min(1).max(2),
  cabin_preference: z.string().min(1, "Please choose a cabin preference"),
  acknowledged: z.literal(true, { errorMap: () => ({ message: "Please confirm the scope before submitting" }) }),
});

const inputCls =
  "w-full rounded-sm border border-input bg-background px-3.5 py-3 text-[14px] text-ink placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-clay/40";
const labelCls = "block text-[12px] font-medium uppercase tracking-[0.14em] text-ink/60";

const errorDetail = async (error: unknown): Promise<{ status: number; code: string }> => {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      return { status: error.context.status, code: String(body?.error ?? "") };
    } catch {
      return { status: error.context.status, code: "" };
    }
  }
  return { status: 0, code: "" };
};

const formatDeadline = (iso: string | null) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  } catch {
    return null;
  }
};

export default function TripIntake() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id") ?? "";

  const [gate, setGate] = useState<Gate>({ kind: sessionId ? "loading" : "missing" });

  useEffect(() => {
    document.title = "Tell me about your trip | Samral";
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", "noindex, nofollow");
    return () => {
      robots?.setAttribute("content", "index, follow");
    };
  }, []);

  const verify = useCallback(async () => {
    if (!sessionId) return;
    setGate({ kind: "loading" });
    const { data, error } = await supabase.functions.invoke("trip-plan-intake", {
      body: { action: "verify", session_id: sessionId },
    });
    if (error) {
      const { status, code } = await errorDetail(error);
      if (status === 404 || status === 400) setGate({ kind: "invalid" });
      else if (status === 403) setGate({ kind: "invalid" });
      else if (status === 402) setGate({ kind: "unpaid" });
      else setGate({ kind: "error", retry: status === 0 || status >= 500 || code === "stripe_unavailable" });
      track("trip_intake_verify_failed", { status });
      return;
    }
    const order = data.order as PublicOrder;
    const seenKey = `samral.purchase_completed.${sessionId}`;
    if (!sessionStorage.getItem(seenKey)) {
      track("purchase_completed", { order_number: order.order_number, livemode: order.livemode });
      sessionStorage.setItem(seenKey, "1");
    }
    if (order.intake_status === "received") setGate({ kind: "done", order, justSubmitted: false });
    else setGate({ kind: "ready", order });
  }, [sessionId]);

  useEffect(() => {
    void verify();
  }, [verify]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-[920px] px-5 py-14 sm:px-6 md:py-20">
        {gate.kind === "loading" && <Status title="Confirming your payment…" body="This usually takes a second or two." />}
        {gate.kind === "missing" && (
          <Status
            title="This page is for paid Trip Plan customers."
            body="The trip form opens automatically right after checkout. If you've already paid, use the link on your Stripe receipt or from your original checkout, or email me and I'll send you a fresh one."
            back
          />
        )}
        {gate.kind === "invalid" && (
          <Status
            title="I couldn't find a Trip Plan purchase for this link."
            body={`The link may be incomplete or belong to a different purchase. If you have paid, email ${CONTACT_EMAIL} and I'll sort it out straight away — no need to pay again.`}
            back
          />
        )}
        {gate.kind === "unpaid" && (
          <Status
            title="Your payment hasn't completed yet."
            body="Some payment methods take a little while to confirm. Refresh this page in a few minutes; once Stripe confirms the payment the trip form will open here. If your payment was declined or cancelled, no charge was made."
            action={{ label: "Check again", onClick: verify }}
            back
          />
        )}
        {gate.kind === "error" && (
          <Status
            title="Something went wrong confirming your payment."
            body={`Your payment is safe. Please try again in a moment${gate.retry ? "" : ""}, or email ${CONTACT_EMAIL} with your Stripe receipt and I'll take it from there.`}
            action={{ label: "Try again", onClick: verify }}
            back
          />
        )}
        {gate.kind === "done" && <ThankYou order={gate.order} justSubmitted={gate.justSubmitted} />}
        {gate.kind === "ready" && (
          <IntakeForm
            sessionId={sessionId}
            order={gate.order}
            onDone={(order) => {
              setGate({ kind: "done", order, justSubmitted: true });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

/* ---------- Form ---------- */

function IntakeForm({
  sessionId,
  order,
  onDone,
}: {
  sessionId: string;
  order: PublicOrder;
  onDone: (order: PublicOrder) => void;
}) {
  const [name, setName] = useState(order.customer_name ?? "");
  const [email, setEmail] = useState(order.customer_email ?? "");
  const [departureAirport, setDepartureAirport] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [flex, setFlex] = useState<string>("");
  const [travellers, setTravellers] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [cabin, setCabin] = useState<string>("");
  const [points, setPoints] = useState<PointsRow[]>([{ programme: "", balance: "" }]);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [foundCashFare, setFoundCashFare] = useState<boolean | null>(null);
  const [cashAmount, setCashAmount] = useState("");
  const [cashCurrency, setCashCurrency] = useState<string>("MYR");
  const [airlinesToAvoid, setAirlinesToAvoid] = useState("");
  const [airlineStatus, setAirlineStatus] = useState("");
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [notes, setNotes] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const started = useRef(false);

  const markStarted = () => {
    if (started.current) return;
    started.current = true;
    track("trip_intake_started", { order_number: order.order_number });
  };

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const togglePriority = (p: string) =>
    setPriorities((prev) => {
      if (prev.includes(p)) return prev.filter((x) => x !== p);
      if (prev.length >= MAX_PRIORITIES) return prev;
      return [...prev, p];
    });

  const updatePoints = (i: number, patch: Partial<PointsRow>) =>
    setPoints((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitError(null);
    const parsed = schema.safeParse({
      name,
      email,
      departure_airport: departureAirport,
      destination,
      departure_date: departureDate,
      return_date: returnDate,
      date_flexibility: flex,
      travellers,
      cabin_preference: cabin,
      acknowledged,
    });
    const nextErrors: Record<string, string> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) nextErrors[String(issue.path[0])] = issue.message;
    }
    if (departureDate && returnDate && returnDate < departureDate) {
      nextErrors.return_date = "Return date must be on or after departure";
    }
    if (foundCashFare === null) nextErrors.found_cash_fare = "Please choose yes or no";
    if (foundCashFare && cashAmount.trim().length > 40) nextErrors.cash_fare_amount = "Too long";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !parsed.success) {
      const first = document.querySelector("[data-error='true']");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    const d = parsed.data;
    const cleanPoints = points
      .map((r) => ({ programme: r.programme.trim().slice(0, 80), balance: r.balance.trim().slice(0, 40) }))
      .filter((r) => r.programme || r.balance);

    const { data, error } = await supabase.functions.invoke("trip-plan-intake", {
      body: {
        action: "submit",
        session_id: sessionId,
        intake: {
          name: d.name,
          email: d.email,
          departure_airport: d.departure_airport,
          destination: d.destination,
          departure_date: d.departure_date,
          return_date: d.return_date,
          date_flexibility: d.date_flexibility,
          travellers: d.travellers,
          adults,
          children,
          cabin_preference: d.cabin_preference,
          points_balances: cleanPoints,
          priorities: priorities.slice(0, MAX_PRIORITIES),
          found_cash_fare: Boolean(foundCashFare),
          cash_fare_amount: foundCashFare ? cashAmount.trim().slice(0, 40) || null : null,
          cash_fare_currency: foundCashFare ? cashCurrency : null,
          airlines_to_avoid: airlinesToAvoid.trim().slice(0, 300) || null,
          airline_status: airlineStatus.trim().slice(0, 300) || null,
          special_requirements: specialRequirements.trim().slice(0, 1000) || null,
          notes: notes.trim().slice(0, 2000) || null,
          acknowledged: true,
        },
      },
    });
    setSubmitting(false);
    if (error) {
      const { status } = await errorDetail(error);
      track("trip_intake_submit_failed", { status });
      setSubmitError(
        `Something went wrong saving your details. Your payment is safe — please try again, or email ${CONTACT_EMAIL} quoting ${order.order_number} and I'll take it from there.`,
      );
      return;
    }
    track("trip_intake_completed", { order_number: order.order_number, travellers, cabin });
    onDone(data.order as PublicOrder);
  };

  return (
    <>
      <p className="eyebrow text-ink/60">Points Trip Planning</p>
      <h1 className="mt-4 font-display text-4xl leading-[1.05] text-ink md:text-5xl">
        Thank you. Tell me about your trip.
      </h1>
      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink/70">
        Your payment has been received. The more accurate your balances and dates, the better the
        recommendation.
        {SHOW_DELIVERY_TIME && ` Your Trip Plan will be delivered within ${DELIVERY_TIME} of submitting this form.`}
      </p>
      <p className="mt-4 inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-[12px] text-ink/70">
        <span className="uppercase tracking-[0.14em] text-ink/50">Order</span>
        <span className="font-medium text-ink">{order.order_number}</span>
      </p>

      <form onSubmit={handleSubmit} noValidate onChange={markStarted} className="mt-12 space-y-14">
        {/* Contact */}
        <Fieldset title="About you" intro="Pre-filled from your payment. Correct anything that isn't right.">
          <Field label="Name" error={errors.name}>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" />
          </Field>
          <Field label="Email (where the plan is sent)" error={errors.email}>
            <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} autoComplete="email" />
          </Field>
        </Fieldset>

        {/* Trip */}
        <Fieldset title="The trip">
          <Field label="Departure city / airport" error={errors.departure_airport}>
            <input className={inputCls} value={departureAirport} onChange={(e) => setDepartureAirport(e.target.value)} placeholder="e.g. Kuala Lumpur (KUL)" maxLength={120} />
          </Field>
          <Field label="Destination" error={errors.destination}>
            <input className={inputCls} value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Tokyo" maxLength={200} />
          </Field>
          <Field label="Departure date" error={errors.departure_date}>
            <input className={inputCls} type="date" min={today} value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
          </Field>
          <Field label="Return date" error={errors.return_date}>
            <input className={inputCls} type="date" min={departureDate || today} value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
          </Field>
          <Field label="Date flexibility" error={errors.date_flexibility} full>
            <Choices options={FLEX_OPTIONS} value={flex} onChange={(v) => { setFlex(v); markStarted(); }} />
          </Field>
          <Field label="Travellers (max 2)" hint="Trip Plans cover up to 2 travellers.">
            <TravellersInput
              id="travellers"
              value={travellers}
              onChange={(n) => {
                setTravellers(n);
                const a = Math.min(adults, n);
                setAdults(a);
                setChildren(Math.max(0, Math.min(children, n - a)));
              }}
              min={1}
              max={2}
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Adults">
              <input className={inputCls} type="number" min={0} max={travellers} value={adults} onChange={(e) => setAdults(Math.max(0, Math.min(travellers, Number(e.target.value) || 0)))} />
            </Field>
            <Field label="Children">
              <input className={inputCls} type="number" min={0} max={travellers} value={children} onChange={(e) => setChildren(Math.max(0, Math.min(travellers, Number(e.target.value) || 0)))} />
            </Field>
          </div>
          <Field label="Cabin preference" error={errors.cabin_preference} full>
            <Choices options={CABIN_OPTIONS} value={cabin} onChange={(v) => { setCabin(v); markStarted(); }} />
          </Field>
        </Fieldset>

        {/* Points */}
        <Fieldset title="Your points" intro="List each programme and its approximate balance. Bank points and airline/hotel miles are both fine.">
          <div className="space-y-3 md:col-span-2">
            {points.map((row, i) => (
              <div key={i} className="grid grid-cols-[1fr_120px_auto] items-center gap-3 sm:grid-cols-[1fr_140px_auto]">
                <input className={inputCls} placeholder="Programme (e.g. Maybank TreatsPoints)" value={row.programme} onChange={(e) => updatePoints(i, { programme: e.target.value })} maxLength={80} aria-label={`Programme ${i + 1}`} />
                <input className={inputCls} placeholder="Balance" inputMode="numeric" value={row.balance} onChange={(e) => updatePoints(i, { balance: e.target.value })} maxLength={40} aria-label={`Balance ${i + 1}`} />
                <button
                  type="button"
                  onClick={() => setPoints((p) => (p.length > 1 ? p.filter((_, idx) => idx !== i) : [{ programme: "", balance: "" }]))}
                  className="px-2 text-[12px] text-ink/50 hover:text-ink"
                  aria-label={`Remove row ${i + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
            {points.length < 12 && (
              <button
                type="button"
                onClick={() => setPoints((p) => [...p, { programme: "", balance: "" }])}
                className="text-[13px] text-ink underline underline-offset-4"
              >
                + Add another programme
              </button>
            )}
          </div>
        </Fieldset>

        {/* Priorities */}
        <Fieldset title="What matters most" intro={`Pick up to ${MAX_PRIORITIES}.`}>
          <div className="flex flex-wrap gap-2 md:col-span-2">
            {PRIORITY_OPTIONS.map((p) => {
              const on = priorities.includes(p);
              const full = !on && priorities.length >= MAX_PRIORITIES;
              return (
                <button
                  key={p}
                  type="button"
                  aria-pressed={on}
                  disabled={full}
                  onClick={() => { togglePriority(p); markStarted(); }}
                  className={`rounded-sm border px-4 py-2 text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${on ? "border-ink bg-ink text-background" : "border-ink/30 text-ink hover:border-ink"}`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </Fieldset>

        {/* Cash fare */}
        <Fieldset title="Cash comparison">
          <div className="md:col-span-2" data-error={Boolean(errors.found_cash_fare)}>
            <span className={labelCls}>Have you already found a cash fare for this trip?</span>
            <div className="mt-2">
              <Choices
                options={["Yes", "No"] as const}
                value={foundCashFare === null ? "" : foundCashFare ? "Yes" : "No"}
                onChange={(v) => { setFoundCashFare(v === "Yes"); markStarted(); }}
              />
            </div>
            {errors.found_cash_fare && <span className="mt-1.5 block text-[12px] text-destructive">{errors.found_cash_fare}</span>}
          </div>
          {foundCashFare && (
            <>
              <Field label="Cash fare amount" error={errors.cash_fare_amount}>
                <input className={inputCls} inputMode="decimal" value={cashAmount} onChange={(e) => setCashAmount(e.target.value)} maxLength={40} placeholder="e.g. 3,200" />
              </Field>
              <Field label="Currency">
                <select className={inputCls} value={cashCurrency} onChange={(e) => setCashCurrency(e.target.value)}>
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </>
          )}
        </Fieldset>

        {/* Preferences */}
        <Fieldset title="Preferences & context" intro="All optional.">
          <Field label="Airlines to avoid">
            <input className={inputCls} value={airlinesToAvoid} onChange={(e) => setAirlinesToAvoid(e.target.value)} maxLength={300} />
          </Field>
          <Field label="Airline status (if any)">
            <input className={inputCls} value={airlineStatus} onChange={(e) => setAirlineStatus(e.target.value)} maxLength={300} placeholder="e.g. Enrich Gold" />
          </Field>
          <Field label="Special requirements" full>
            <textarea className={`${inputCls} min-h-[88px]`} value={specialRequirements} onChange={(e) => setSpecialRequirements(e.target.value)} maxLength={1000} placeholder="Accessibility needs, infants, stopover preferences…" />
          </Field>
          <Field label="Anything else I should know?" full>
            <textarea className={`${inputCls} min-h-[120px]`} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} />
          </Field>
        </Fieldset>

        {/* Acknowledgement */}
        <div className="border-t border-border pt-8" data-error={Boolean(errors.acknowledged)}>
          <label className="flex items-start gap-3 text-[14px] leading-relaxed text-ink/80">
            <input type="checkbox" className="mt-1" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} />
            <span>
              I understand this Trip Plan covers one round-trip journey for up to 2 travellers, that award
              availability can change, and that Samral does not book tickets or transfer points on my behalf.
            </span>
          </label>
          {errors.acknowledged && <p className="mt-2 text-[12px] text-destructive">{errors.acknowledged}</p>}

          {submitError && (
            <p role="alert" className="mt-6 border border-destructive/40 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-8 inline-flex items-center justify-center rounded-sm bg-ink px-8 py-4 text-sm font-medium text-background transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {submitting ? "Sending…" : "Submit my trip details"}
          </button>
          <p className="mt-4 text-[12px] text-ink/50">
            Paid but can&rsquo;t complete this form?{" "}
            <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Trip Plan ${order.order_number}`)}`} className="underline underline-offset-4 hover:text-ink">
              Email {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
      </form>
    </>
  );
}

/* ---------- Pieces ---------- */

function ThankYou({ order, justSubmitted }: { order: PublicOrder; justSubmitted: boolean }) {
  const deadline = formatDeadline(order.delivery_deadline);
  return (
    <div>
      <p className="eyebrow text-ink/60">Points Trip Planning</p>
      <h1 className="mt-4 font-display text-4xl leading-[1.05] text-ink md:text-5xl">
        {justSubmitted ? <>Got it. I&rsquo;m on it.</> : <>Your trip details are already with me.</>}
      </h1>
      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink/70">
        {justSubmitted ? "Your trip details are with me." : "Nothing more to do here — this form has already been submitted for this order."}
        {SHOW_DELIVERY_TIME
          ? ` You'll receive your written Samral Trip Plan by email within ${DELIVERY_TIME}${deadline ? ` (by ${deadline})` : ""}.`
          : " You'll receive your written Samral Trip Plan by email."}{" "}
        If I need anything else, I&rsquo;ll reach out on the email you provided.
      </p>
      <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-ink/60">
        Please don&rsquo;t transfer any points until you&rsquo;ve received the plan.
      </p>
      <p className="mt-6 inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-[12px] text-ink/70">
        <span className="uppercase tracking-[0.14em] text-ink/50">Order</span>
        <span className="font-medium text-ink">{order.order_number}</span>
      </p>
      <p className="mt-4 max-w-xl text-[12px] leading-relaxed text-ink/50">
        Your payment receipt comes separately from Stripe. Questions? Email{" "}
        <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Trip Plan ${order.order_number}`)}`} className="underline underline-offset-4 hover:text-ink">
          {CONTACT_EMAIL}
        </a>{" "}
        quoting your order number.
      </p>
      <div className="mt-12 border-t border-border pt-8">
        <Link to="/" className="text-[13px] text-ink/65 underline underline-offset-4 hover:text-ink">
          &larr; Back to Samral
        </Link>
      </div>
    </div>
  );
}

function Status({
  title,
  body,
  action,
  back,
}: {
  title: string;
  body: string;
  action?: { label: string; onClick: () => void };
  back?: boolean;
}) {
  return (
    <div>
      <p className="eyebrow text-ink/60">Points Trip Planning</p>
      <h1 className="mt-4 font-display text-4xl leading-[1.05] text-ink md:text-5xl">{title}</h1>
      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink/70">{body}</p>
      <div className="mt-8 flex flex-wrap items-center gap-6">
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center justify-center rounded-sm bg-ink px-6 py-3 text-sm font-medium text-background"
          >
            {action.label}
          </button>
        )}
        {back && (
          <Link to="/trip-planning" className="text-[13px] text-ink/65 underline underline-offset-4 hover:text-ink">
            &larr; Back to Points Trip Planning
          </Link>
        )}
      </div>
    </div>
  );
}

function Fieldset({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-ink/20 pt-6">
      <legend className="sr-only">{title}</legend>
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      {intro && <p className="mt-2 text-[13px] text-ink/60">{intro}</p>}
      <div className="mt-6 grid gap-5 md:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  error,
  hint,
  full,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${full ? "md:col-span-2" : ""}`} data-error={Boolean(error)}>
      <span className={labelCls}>{label}</span>
      <div className="mt-2">{children}</div>
      {hint && !error && <span className="mt-1.5 block text-[12px] text-ink/50">{hint}</span>}
      {error && <span className="mt-1.5 block text-[12px] text-destructive">{error}</span>}
    </label>
  );
}

function Choices<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: string;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value === o;
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o)}
            className={`rounded-sm border px-4 py-2 text-[13px] transition-colors ${on ? "border-ink bg-ink text-background" : "border-ink/30 text-ink hover:border-ink"}`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
