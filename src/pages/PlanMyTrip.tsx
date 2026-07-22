import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { readTripContext, clearTripContext, TripContext } from "@/lib/tripContext";
import { formatInt } from "@/lib/milesCalculator";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const track = (event: string, payload: Record<string, unknown> = {}) => {
  try {
    const w = window as unknown as { datafast?: (e: string, p?: Record<string, unknown>) => void };
    if (typeof w.datafast === "function") w.datafast(event, payload);
  } catch {
    /* no-op */
  }
};

interface FormState {
  departureDate: string;
  returnDate: string;
  flexibility: string;
  travellers: number;
  cabin: string;
  destination: string;
  loyaltyProgramme: string;
  needsHotel: boolean;
  accessibility: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  consent: boolean;
}

const initialForm = (ctx: TripContext | null): FormState => ({
  departureDate: "",
  returnDate: "",
  flexibility: "flexible-few-days",
  travellers: ctx?.travellers ?? 1,
  cabin: ctx?.cabin ?? "",
  destination: ctx ? `${ctx.destinationName} (${ctx.destination})` : "",
  loyaltyProgramme: ctx?.loyaltyProgrammeName ?? "",
  needsHotel: false,
  accessibility: "",
  name: "",
  email: "",
  phone: "",
  notes: "",
  consent: false,
});

export default function PlanMyTrip() {
  const [ctx, setCtx] = useState<TripContext | null>(null);
  const [form, setForm] = useState<FormState>(() => initialForm(null));
  const [submitted, setSubmitted] = useState(false);
  const [startedTracked, setStartedTracked] = useState(false);

  useEffect(() => {
    document.title = "Plan a trip using your points | Samral";
    const c = readTripContext();
    setCtx(c);
    setForm(initialForm(c));
  }, []);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    if (!startedTracked) {
      track("trip_planning_form_started");
      setStartedTracked(true);
    }
    setForm((f) => ({ ...f, [key]: value }));
  };

  const canSubmit = useMemo(() =>
    form.consent && form.name.trim().length > 1 && /.+@.+\..+/.test(form.email) && form.destination.trim().length > 0,
  [form]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    track("trip_planning_form_submitted", {
      hasContext: !!ctx,
      cabin: form.cabin || undefined,
      programme: form.loyaltyProgramme || undefined,
    });
    setSubmitted(true);
    clearTripContext();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-5 py-5 sm:px-6 md:px-12 md:py-8">
          <Link to="/" className="font-display text-2xl text-ink">Samral</Link>
          <Link to="/miles-calculator" className="inline-flex items-center gap-1.5 text-[13px] text-ink/70 hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Back to calculator
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[880px] px-5 py-14 sm:px-6 md:py-20">
        <p className="eyebrow text-ink/60">Trip planning</p>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] text-ink md:text-6xl">
          Plan a trip using your points
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink/70">
          Tell us what you&rsquo;re thinking about. We&rsquo;ll come back with the transfer route, practical redemption options and a booking plan — before you move any points.
        </p>

        {ctx && !submitted && (
          <aside className="mt-8 rounded-sm border border-ink/25 bg-sand/50 p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink/60">Selected from calculator</p>
            <p className="mt-2 font-display text-2xl text-ink md:text-3xl">
              {ctx.destinationName} · {ctx.cabin}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-y-1.5 text-[13px]">
              <dt className="text-ink/60">Displayed target</dt>
              <dd className="text-right text-ink">{formatInt(ctx.requiredPoints)} {ctx.loyaltyProgrammeName}</dd>
              <dt className="text-ink/60">Your potential balance</dt>
              <dd className="text-right text-ink">{formatInt(ctx.potentialProgrammeBalance)} {ctx.loyaltyProgrammeName}</dd>
              <dt className="text-ink/60">Trip basis</dt>
              <dd className="text-right text-ink">{ctx.tripType === "return" ? "Return" : "One way"} · {ctx.travellers} traveller{ctx.travellers === 1 ? "" : "s"}</dd>
              {ctx.operatingAirline && (
                <>
                  <dt className="text-ink/60">Operating airline</dt>
                  <dd className="text-right text-ink">{ctx.operatingAirline}</dd>
                </>
              )}
            </dl>
            <p className="mt-3 text-[11px] text-ink/55">
              Points requirement shown does not indicate award-seat availability. Taxes, fees and surcharges may apply.
            </p>
          </aside>
        )}

        {submitted ? (
          <div className="mt-10 rounded-sm border border-ink/25 bg-background p-8">
            <h2 className="font-display text-3xl text-ink">Request received.</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-ink/75">
              Thanks — we&rsquo;ll be in touch by email with a plan tailored to what you shared. Nothing has been transferred and no booking has been made.
            </p>
            <Link to="/miles-calculator" className="mt-6 inline-flex items-center gap-1.5 text-[13px] text-ink underline underline-offset-4">
              Back to the calculator
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-8">
            <FormRow label="Destination">
              <input
                type="text"
                value={form.destination}
                onChange={(e) => update("destination", e.target.value)}
                placeholder="City or airport"
                className="input"
                required
              />
            </FormRow>

            <div className="grid gap-6 md:grid-cols-2">
              <FormRow label="Preferred departure date">
                <input type="date" value={form.departureDate} onChange={(e) => update("departureDate", e.target.value)} className="input" />
              </FormRow>
              <FormRow label="Preferred return date (optional)">
                <input type="date" value={form.returnDate} onChange={(e) => update("returnDate", e.target.value)} className="input" />
              </FormRow>
            </div>

            <FormRow label="Date flexibility">
              <select value={form.flexibility} onChange={(e) => update("flexibility", e.target.value)} className="input">
                <option value="exact">Exact dates only</option>
                <option value="flexible-few-days">Flexible by a few days</option>
                <option value="flexible-weeks">Flexible by a few weeks</option>
                <option value="flexible-months">Flexible by a few months</option>
              </select>
            </FormRow>

            <div className="grid gap-6 md:grid-cols-3">
              <FormRow label="Travellers">
                <input type="number" min={1} max={9} value={form.travellers} onChange={(e) => update("travellers", Math.max(1, Math.min(9, Math.floor(Number(e.target.value) || 1))))} className="input" />
              </FormRow>
              <FormRow label="Cabin">
                <select value={form.cabin} onChange={(e) => update("cabin", e.target.value)} className="input">
                  <option value="">No preference</option>
                  <option>Economy</option>
                  <option>Premium Economy</option>
                  <option>Business</option>
                  <option>First or Business Suite</option>
                </select>
              </FormRow>
              <FormRow label="Loyalty programme">
                <input type="text" value={form.loyaltyProgramme} onChange={(e) => update("loyaltyProgramme", e.target.value)} placeholder="e.g. Enrich" className="input" />
              </FormRow>
            </div>

            <FormRow label="Do you also need hotel planning?">
              <label className="inline-flex items-center gap-2 text-[13px] text-ink">
                <input type="checkbox" checked={form.needsHotel} onChange={(e) => update("needsHotel", e.target.checked)} />
                Yes, include hotel suggestions
              </label>
            </FormRow>

            <FormRow label="Accessibility or important travel requirements (optional)">
              <textarea value={form.accessibility} onChange={(e) => update("accessibility", e.target.value)} rows={2} className="input" />
            </FormRow>

            <div className="grid gap-6 md:grid-cols-2">
              <FormRow label="Your name">
                <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className="input" required />
              </FormRow>
              <FormRow label="Email">
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="input" required />
              </FormRow>
            </div>

            <FormRow label="Phone (optional)">
              <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="input" />
            </FormRow>

            <FormRow label="Notes">
              <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={4} className="input" />
            </FormRow>

            <label className="flex items-start gap-3 text-[12px] leading-relaxed text-ink/70">
              <input type="checkbox" checked={form.consent} onChange={(e) => update("consent", e.target.checked)} className="mt-0.5" />
              <span>
                I understand that Samral does not guarantee award availability or bookings, and that this request is for planning support only. Samral may contact me by email about this enquiry.
              </span>
            </label>

            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex w-full items-center justify-center rounded-sm bg-ink px-8 py-4 text-sm font-medium text-background transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 md:w-auto md:min-w-[320px]"
            >
              Submit my trip-planning request
            </button>
          </form>
        )}
      </main>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background));
          padding: 0.65rem 0.75rem;
          font-size: 14px;
          color: hsl(var(--ink));
          border-radius: 2px;
        }
        .input:focus { outline: none; border-color: hsl(var(--ink)); }
      `}</style>
    </div>
  );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-medium uppercase tracking-[0.14em] text-ink/70">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
