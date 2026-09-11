import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TravellersInput from "@/components/TravellersInput";
import { supabase } from "@/integrations/supabase/client";
import { CONTACT_EMAIL, DELIVERY_TIME, SHOW_DELIVERY_TIME, track } from "@/lib/commerce";

/* ---------- Options ---------- */

const FLEX_OPTIONS = ["Exact dates", "±3 days", "±1 week", "Very flexible"] as const;
const CABIN_OPTIONS = ["Economy", "Premium Economy", "Business", "First", "Open to options"] as const;
const PRIORITY_OPTIONS = [
  "Lowest points",
  "Lowest cash/taxes",
  "Best cabin",
  "Fastest routing",
  "Specific dates",
  "Specific airline",
] as const;
const CURRENCIES = ["MYR", "SGD", "HKD", "USD", "Other"] as const;

type PointsRow = { programme: string; balance: string };

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

export default function TripIntake() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id") ?? params.get("checkout_session_id") ?? "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
  const [foundCashFare, setFoundCashFare] = useState(false);
  const [cashAmount, setCashAmount] = useState("");
  const [cashCurrency, setCashCurrency] = useState<string>("MYR");
  const [airlinesToAvoid, setAirlinesToAvoid] = useState("");
  const [airlineStatus, setAirlineStatus] = useState("");
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [notes, setNotes] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Tell me about your trip | Samral";
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", "noindex, nofollow");
    track("trip_intake_viewed", { has_session: Boolean(sessionId) });
    return () => {
      robots?.setAttribute("content", "index, follow");
    };
  }, [sessionId]);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const togglePriority = (p: string) =>
    setPriorities((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const updatePoints = (i: number, patch: Partial<PointsRow>) =>
    setPoints((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
    if (foundCashFare && cashAmount.trim().length > 40) nextErrors.cash_fare_amount = "Too long";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !parsed.success) return;

    setSubmitting(true);
    const cleanPoints = points
      .map((r) => ({ programme: r.programme.trim().slice(0, 80), balance: r.balance.trim().slice(0, 40) }))
      .filter((r) => r.programme || r.balance);

    const d = parsed.data;
    const { error } = await supabase.from("trip_intake_submissions").insert({
      name: d.name,
      email: d.email,
      departure_airport: d.departure_airport,
      destination: d.destination,
      departure_date: d.departure_date,
      return_date: d.return_date,
      date_flexibility: d.date_flexibility,
      travellers: d.travellers,
      cabin_preference: d.cabin_preference,
      acknowledged: true,
      adults,
      children,
      points_balances: cleanPoints,
      priorities,
      found_cash_fare: foundCashFare,
      cash_fare_amount: foundCashFare ? cashAmount.trim().slice(0, 40) || null : null,
      cash_fare_currency: foundCashFare ? cashCurrency : null,
      airlines_to_avoid: airlinesToAvoid.trim().slice(0, 300) || null,
      airline_status: airlineStatus.trim().slice(0, 300) || null,
      special_requirements: specialRequirements.trim().slice(0, 1000) || null,
      notes: notes.trim().slice(0, 2000) || null,
      stripe_session_id: sessionId.slice(0, 200) || null,
      source: "trip_intake_page",
    });
    setSubmitting(false);
    if (error) {
      setSubmitError(
        `Something went wrong saving your details. Please try again, or email ${CONTACT_EMAIL} and I'll take it from there.`,
      );
      return;
    }
    track("trip_intake_submitted", { travellers, cabin, has_session: Boolean(sessionId) });
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-[920px] px-5 py-14 sm:px-6 md:py-20">
        {submitted ? (
          <ThankYou />
        ) : (
          <>
            <p className="eyebrow text-ink/60">Points Trip Planning</p>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] text-ink md:text-5xl">
              Thank you. Tell me about your trip.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink/70">
              Your payment has been received. The more accurate your balances and dates, the better
              the recommendation.
              {SHOW_DELIVERY_TIME && ` Your Trip Plan will be delivered within ${DELIVERY_TIME} of submitting this form.`}
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-12 space-y-14">
              {/* Contact */}
              <Fieldset title="About you">
                <Field label="Name" error={errors.name}>
                  <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" />
                </Field>
                <Field label="Email" error={errors.email}>
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
                  <Choices options={FLEX_OPTIONS} value={flex} onChange={setFlex} />
                </Field>
                <Field label="Travellers (max 2)" hint="Trip Plans cover up to 2 travellers.">
                  <TravellersInput
                    id="travellers"
                    value={travellers}
                    onChange={(n) => {
                      setTravellers(n);
                      setAdults(Math.min(adults, n));
                      setChildren(Math.max(0, Math.min(children, n - Math.min(adults, n))));
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
                  <Choices options={CABIN_OPTIONS} value={cabin} onChange={setCabin} />
                </Field>
              </Fieldset>

              {/* Points */}
              <Fieldset title="Your points" intro="List each programme and its approximate balance. Bank points and airline/hotel miles are both fine.">
                <div className="space-y-3 md:col-span-2">
                  {points.map((row, i) => (
                    <div key={i} className="grid grid-cols-[1fr_140px_auto] items-center gap-3">
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
              <Fieldset title="What matters most" intro="Pick all that apply.">
                <div className="flex flex-wrap gap-2 md:col-span-2">
                  {PRIORITY_OPTIONS.map((p) => {
                    const on = priorities.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        aria-pressed={on}
                        onClick={() => togglePriority(p)}
                        className={`rounded-sm border px-4 py-2 text-[13px] transition-colors ${on ? "border-ink bg-ink text-background" : "border-ink/30 text-ink hover:border-ink"}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </Fieldset>

              {/* Cash fare */}
              <Fieldset title="Cash comparison">
                <div className="md:col-span-2">
                  <label className="flex items-start gap-3 text-[14px] text-ink/80">
                    <input type="checkbox" className="mt-1" checked={foundCashFare} onChange={(e) => setFoundCashFare(e.target.checked)} />
                    <span>I&rsquo;ve already found a cash fare for this trip</span>
                  </label>
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
              <div className="border-t border-border pt-8">
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
                  <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4 hover:text-ink">
                    Email {CONTACT_EMAIL}
                  </a>
                  .
                </p>
              </div>
            </form>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

/* ---------- Pieces ---------- */

function ThankYou() {
  return (
    <div>
      <p className="eyebrow text-ink/60">Points Trip Planning</p>
      <h1 className="mt-4 font-display text-4xl leading-[1.05] text-ink md:text-5xl">Got it. I&rsquo;m on it.</h1>
      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink/70">
        Your trip details are with me.
        {SHOW_DELIVERY_TIME
          ? ` You'll receive your written Samral Trip Plan by email within ${DELIVERY_TIME}.`
          : " You'll receive your written Samral Trip Plan by email."}{" "}
        If I need anything else, I&rsquo;ll reach out on the email you provided.
      </p>
      <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-ink/60">
        Please don&rsquo;t transfer any points until you&rsquo;ve received the plan.
      </p>
      <div className="mt-12 border-t border-border pt-8">
        <Link to="/" className="text-[13px] text-ink/65 underline underline-offset-4 hover:text-ink">
          &larr; Back to Samral
        </Link>
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
    <label className={`block ${full ? "md:col-span-2" : ""}`}>
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
