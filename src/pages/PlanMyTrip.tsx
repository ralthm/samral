import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import destMaldivesAsset from "@/assets/dest-maldives.jpg.asset.json";
import destItalyAsset from "@/assets/dest-italy.jpg.asset.json";
import destKyotoAsset from "@/assets/dest-kyoto.jpg.asset.json";
import destAlpsAsset from "@/assets/dest-swiss-alps.jpg.asset.json";
import {
  PRICES,
  formatUsd,
  CURRENCY_NOTE,
  BOOKING_SUPPORT_CONTACT_URL,
  CONTACT_EMAIL,
  SHOW_DELIVERY_TIME,
  DELIVERY_COPY,
  DELIVERY_TIME,
  startTripPlanCheckout,
  track,
} from "@/lib/commerce";

const MILES_CALCULATOR_PATH = "/miles-calculator";
const PRICE = formatUsd(PRICES.tripPlan);

/* ---------- Shared CTA ---------- */

function BuyButton({
  source,
  label = `Get my Trip Plan — ${PRICE}`,
  variant = "dark",
  className = "",
}: {
  source: string;
  label?: string;
  variant?: "dark" | "light";
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const styles =
    variant === "dark"
      ? "bg-ink text-background"
      : "bg-background text-ink";

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await startTripPlanCheckout(source);
    if (result.ok === false) {
      setError(result.message);
      setBusy(false);
    }
    // On success the browser navigates to Stripe; keep the button disabled.
  };

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-busy={busy}
        className={`inline-flex items-center justify-center rounded-sm px-8 py-4 text-sm font-medium transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0 ${styles}`}
      >
        {busy ? "Opening secure checkout…" : <>{label} &nbsp;&rarr;</>}
      </button>
      {error && (
        <p role="alert" className={`mt-3 max-w-xs text-[12px] leading-relaxed ${variant === "dark" ? "text-destructive" : "text-background/80"}`}>
          {error}
        </p>
      )}
    </div>
  );
}

/* ---------- Returned from Stripe without paying ---------- */

function CancelledNotice() {
  const [params, setParams] = useSearchParams();
  const cancelled = params.get("checkout") === "cancelled";

  useEffect(() => {
    if (cancelled) track("checkout_cancelled");
  }, [cancelled]);

  if (!cancelled) return null;
  return (
    <div className="border-b border-border bg-sand">
      <div className="mx-auto flex w-full max-w-[1440px] items-start justify-between gap-6 px-5 py-4 sm:px-6 md:px-12">
        <p className="text-[13px] leading-relaxed text-ink/75">
          No payment was taken. Whenever you&rsquo;re ready, the button below takes you back to secure checkout
          {" "}&mdash; or email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4 hover:text-ink">
            {CONTACT_EMAIL}
          </a>{" "}
          with any questions first.
        </p>
        <button
          type="button"
          onClick={() => {
            params.delete("checkout");
            setParams(params, { replace: true });
          }}
          className="shrink-0 text-[12px] text-ink/50 underline underline-offset-4 hover:text-ink"
          aria-label="Dismiss"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default function PlanMyTrip() {
  useEffect(() => {
    document.title = "Points Trip Planning | Samral";
    const desc =
      "A personalised Samral Trip Plan for one specific trip: the programme, points requirement, estimated taxes and recommended next steps. USD $79.";
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", desc);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <Hero />
      <HowItWorks />
      <WhatYouReceive />
      <RecommendationExample />
      <IncludedNotIncluded />
      <RiskReversal />
      <BookingSupport />
      <Destinations />
      <FinalCTA />
      <SiteFooter />
    </div>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-5 py-14 sm:px-6 md:grid-cols-12 md:items-center md:gap-16 md:px-12 md:py-24">
        <div className="md:col-span-7">
          <p className="eyebrow text-ink/60">Points Trip Planning</p>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] text-ink md:text-6xl">
            You have the points. Let&rsquo;s figure out the best way to use them for your trip.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink/70">
            Tell me where you want to go, when you want to travel and what points you already have.
            I&rsquo;ll compare the practical options and give you a clear recommendation for what
            I&rsquo;d do.
          </p>

          <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-4">
            <div>
              <p className="font-display text-5xl leading-none text-ink md:text-6xl">{PRICE}</p>
              <p className="mt-2 text-[12px] text-ink/55">{CURRENCY_NOTE}</p>
            </div>
            <BuyButton source="hero" label="Get my Trip Plan" />
          </div>

          <p className="mt-6 max-w-xl text-[13px] leading-relaxed text-ink/65">
            One specific round-trip journey &bull; Up to 2 travellers &bull; Personalised research and
            written recommendation
          </p>
          {SHOW_DELIVERY_TIME && (
            <p className="mt-2 text-[13px] font-medium text-ink/80">{DELIVERY_COPY}</p>
          )}
        </div>

        <div className="md:col-span-5">
          <TripPlanPreview />
        </div>
      </div>
    </section>
  );
}

/* ---------- Illustrative Trip Plan preview ---------- */

function TripPlanPreview() {
  const row = (label: string, value: string) => (
    <div key={label} className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-2 text-[13px]">
      <span className="text-ink/55">{label}</span>
      <span className="text-right text-ink">{value}</span>
    </div>
  );
  return (
    <div className="polaroid border border-ink/10 p-6 md:p-8" aria-label="Illustrative Trip Plan preview">
      <div className="flex items-start justify-between gap-4">
        <p className="eyebrow text-clay">Samral Trip Plan</p>
        <span className="border border-ink/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-ink/60">
          Illustrative example
        </span>
      </div>
      <p className="mt-4 font-display text-2xl text-ink md:text-3xl">Kuala Lumpur &rarr; Tokyo</p>
      <p className="mt-1 text-[13px] text-ink/60">2 adults &middot; Economy &middot; &plusmn;3 days</p>

      <p className="eyebrow mt-7 text-ink/50">Recommended</p>
      <div className="mt-2">
        {row("Programme", "[Example programme]")}
        {row("Points", "XX,XXX")}
        {row("Taxes", "approx. $XXX")}
        {row("Routing", "KUL → NRT")}
      </div>

      <p className="eyebrow mt-7 text-ink/50">Why this option</p>
      <p className="mt-2 text-[14px] leading-relaxed text-ink/80">
        Best overall combination of availability, points and cash.
      </p>

      <p className="eyebrow mt-6 text-ink/50">Next step</p>
      <p className="mt-2 text-[14px] leading-relaxed text-ink/80">
        Reconfirm award space before transferring any points.
      </p>

      <p className="mt-6 text-[11px] leading-relaxed text-ink/45">
        Illustrative layout only. Not a real customer result. Your plan is based on your own dates,
        balances and programmes.
      </p>
    </div>
  );
}

/* ---------- How it works ---------- */

const HOW_STEPS = [
  {
    n: "01",
    title: "Tell me about your trip",
    body: "After payment, you\u2019ll complete a short intake covering your destination, dates, flexibility, travellers, cabin preference and points balances.",
  },
  {
    n: "02",
    title: "I research the realistic options",
    body: "I\u2019ll compare the relevant loyalty programmes, transfer routes, points requirements, taxes, cash fares and practical alternatives available to you.",
  },
  {
    n: "03",
    title: "You receive my recommendation",
    body: "You\u2019ll receive a written Samral Trip Plan showing the option I\u2019d choose, why I\u2019d choose it, and what to do next.",
  },
  {
    n: "04",
    title: "Book with clarity",
    body: "Follow the steps yourself, ask one clarification question if needed, or add Booking Support if you\u2019d prefer help with execution.",
  },
];

function HowItWorks() {
  return (
    <section className="bg-sand/40">
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-6 md:px-12 md:py-24">
        <p className="eyebrow text-clay">How it works</p>
        <h2 className="mt-4 max-w-2xl font-display text-3xl leading-[1.1] text-ink md:text-4xl">
          From payment to a plan you can act on.
        </h2>
        <div className="mt-10 grid gap-10 md:grid-cols-4 md:gap-8">
          {HOW_STEPS.map((s) => (
            <div key={s.n} className="border-t border-ink/20 pt-5">
              <p className="font-display text-4xl text-ink/30">{s.n}</p>
              <p className="mt-3 font-display text-xl text-ink">{s.title}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink/70">{s.body}</p>
            </div>
          ))}
        </div>
        {SHOW_DELIVERY_TIME && (
          <p className="mt-10 text-[13px] text-ink/65">{DELIVERY_COPY}</p>
        )}
      </div>
    </section>
  );
}

/* ---------- What you'll receive ---------- */

const DELIVERABLES = [
  { title: "Your recommended redemption", body: "The programme, routing and approach I\u2019d use for your trip." },
  {
    title: "Points & cash breakdown",
    body: "Approximate points required, estimated taxes/fees and how many bank points need to be transferred.",
  },
  {
    title: "Alternatives compared",
    body: "The most relevant alternatives \u2014 including paying cash where that makes more sense.",
  },
  { title: "Why I chose it", body: "A concise explanation of the trade-offs behind the recommendation." },
  {
    title: "Your next steps",
    body: "A clear sequence for checking availability, transferring points and making the booking.",
  },
  { title: "One clarification", body: "One follow-up clarification by email within 7 days of receiving your plan." },
];

function WhatYouReceive() {
  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-6 md:px-12 md:py-24">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-4">
            <p className="eyebrow text-clay">What you&rsquo;ll receive</p>
            <h2 className="mt-4 font-display text-3xl leading-[1.1] text-ink md:text-4xl">
              A written plan, not a list of options.
            </h2>
            <div className="mt-8">
              <BuyButton source="deliverables" />
              <p className="mt-3 text-[12px] text-ink/55">{CURRENCY_NOTE}</p>
            </div>
          </div>
          <div className="md:col-span-8">
            <ul className="grid gap-px bg-border sm:grid-cols-2">
              {DELIVERABLES.map((d) => (
                <li key={d.title} className="bg-background p-6">
                  <p className="font-display text-xl text-ink">{d.title}</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink/70">{d.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Illustrative recommendation example ---------- */

function RecommendationExample() {
  const blocks = [
    {
      n: "01",
      title: "The trip",
      items: ["Kuala Lumpur \u2192 Tokyo", "2 travellers \u00b7 Economy \u00b7 flexible dates"],
    },
    {
      n: "02",
      title: "What I compare",
      items: ["Relevant programmes", "Transfer options", "Points + taxes", "Cash fares", "Routing and availability"],
    },
    {
      n: "03",
      title: "The decision",
      items: ["One recommended strategy + one backup."],
    },
    {
      n: "04",
      title: "The next step",
      items: ["A clear sequence for what to check, transfer and book."],
    },
  ];

  return (
    <section id="case-study" className="border-t border-border bg-sand/40">
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-6 md:px-12 md:py-24">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-clay">A Samral recommendation</p>
            <h2 className="mt-4 font-display text-3xl leading-[1.1] text-ink md:text-5xl md:leading-[1.05]">
              See what a Samral recommendation looks like.
            </h2>
          </div>
          <span className="inline-block w-fit border border-ink/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-ink/60">
            Illustrative example
          </span>
        </div>

        <div className="mt-10 grid gap-px bg-border md:mt-14 md:grid-cols-4">
          {blocks.map((b) => (
            <div key={b.n} className="bg-background p-6 md:p-8">
              <p className="font-display text-sm text-clay">{b.n}</p>
              <h3 className="mt-4 font-display text-[22px] leading-tight text-ink">{b.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {b.items.map((i) => (
                  <li key={i} className="flex gap-2 text-[14px] leading-snug text-ink/75">
                    <span className="text-clay">&mdash;</span>
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[12px] text-ink/50">
          Example structure only. Real customer outcomes appear in Client Results on the homepage.
        </p>
      </div>
    </section>
  );
}

/* ---------- Included / Not included ---------- */

const INCLUDED = [
  "One round-trip journey",
  "One origin/destination pair",
  "Up to 2 travellers",
  "Reasonable date-flexibility comparison",
  "Relevant programmes available from the customer\u2019s points balances",
  "Written personalised recommendation",
  "One clarification by email within 7 days",
];

const NOT_INCLUDED = [
  "Ticket booking on the customer\u2019s behalf",
  "Logging into bank or loyalty accounts",
  "Transferring points for the customer",
  "Unlimited itinerary revisions",
  "Multi-city or highly complex itineraries",
  "Ongoing award-availability monitoring",
  "Post-booking changes",
];

function IncludedNotIncluded() {
  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-6 md:px-12 md:py-24">
        <h2 className="font-display text-3xl leading-[1.1] text-ink md:text-4xl">
          What&rsquo;s included, and what isn&rsquo;t.
        </h2>
        <div className="mt-10 grid gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <p className="eyebrow text-clay">Included</p>
            <ul className="mt-4">
              {INCLUDED.map((i) => (
                <li key={i} className="flex gap-3 border-b border-border py-3 text-[14px] text-ink/80">
                  <span className="text-clay">&mdash;</span>
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow text-ink/50">Not included</p>
            <ul className="mt-4">
              {NOT_INCLUDED.map((i) => (
                <li key={i} className="flex gap-3 border-b border-border py-3 text-[14px] text-ink/65">
                  <span className="text-ink/35">&mdash;</span>
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-8 text-[13px] text-ink/65">
          Complex itinerary?{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Complex itinerary — Trip Plan")}`}
            className="underline underline-offset-4 hover:text-ink"
          >
            Contact Samral before purchasing.
          </a>
        </p>
      </div>
    </section>
  );
}

/* ---------- Risk reversal ---------- */

function RiskReversal() {
  return (
    <section className="border-t border-border bg-sand/40">
      <div className="mx-auto max-w-[920px] px-5 py-16 sm:px-6 md:py-24">
        <h2 className="font-display text-3xl leading-[1.1] text-ink md:text-4xl">
          If I can&rsquo;t provide a useful recommendation, you won&rsquo;t pay for an unusable plan.
        </h2>
        <p className="mt-6 text-[15px] leading-relaxed text-ink/75">
          If, after reviewing the information you submit, I determine that I can&rsquo;t provide a
          meaningful personalised recommendation for the trip you purchased, I&rsquo;ll refund the
          planning fee.
        </p>
        <p className="mt-6 border-t border-ink/15 pt-5 text-[13px] leading-relaxed text-ink/60">
          Award availability and programme pricing can change at any time. Samral does not guarantee
          that a particular award seat or fare will remain available.
        </p>
      </div>
    </section>
  );
}

/* ---------- Booking Support add-on ---------- */

function BookingSupport() {
  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 py-12 sm:px-6 md:flex-row md:items-center md:justify-between md:px-12 md:py-16">
        <div className="max-w-xl">
          <p className="eyebrow text-ink/50">Optional add-on</p>
          <p className="mt-3 font-display text-2xl text-ink">
            Booking Support &mdash; from {formatUsd(PRICES.bookingSupportFrom)}
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-ink/70">
            If you&rsquo;d prefer help executing the plan once you have it, ask about Booking Support
            after receiving your Trip Plan.
          </p>
        </div>
        <a
          href={BOOKING_SUPPORT_CONTACT_URL}
          onClick={() => track("booking_support_enquiry_clicked", { source: "trip_planning" })}
          className="inline-flex w-fit items-center justify-center rounded-sm border border-ink/70 px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-background"
        >
          Ask about Booking Support &nbsp;&rarr;
        </a>
      </div>
    </section>
  );
}

/* ---------- Destinations ---------- */

function Destinations() {
  const dests = [
    {
      img: destMaldivesAsset.url,
      name: "The Maldives",
      note: "A long-haul trip where the right combination of bank points, airline miles and cash can make a meaningful difference.",
    },
    {
      img: destItalyAsset.url,
      name: "The Italian coast",
      note: "Long summer evenings on the Amalfi coast, booked with a mix of two flexible currencies.",
    },
    {
      img: destKyotoAsset.url,
      name: "Kyoto in autumn",
      note: "Traditional ryokan stays and premium-cabin ANA seats, some of the best value in miles.",
    },
    {
      img: destAlpsAsset.url,
      name: "The Swiss Alps",
      note: "Slow train journeys through alpine valleys, paired with a mountainside stay booked on hotel points.",
    },
  ];

  return (
    <section id="destinations" className="border-t border-border bg-sand">
      <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-12 md:py-36">
        <div className="mb-14 max-w-2xl md:mb-20">
          <p className="eyebrow mb-6 text-clay">Destination inspiration</p>
          <h2 className="font-display text-4xl text-ink md:text-6xl">Where could your points take you?</h2>
          <p className="mt-6 text-[16px] leading-relaxed text-muted-foreground">
            A few examples of the kinds of trips points can help unlock when the programmes, routes
            and timing line up.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-2">
          {dests.map((d) => (
            <article key={d.name} className="flex flex-col">
              <img src={d.img} alt={d.name} className="aspect-[4/3] w-full object-cover" loading="lazy" />
              <h3 className="mt-5 font-display text-2xl text-ink">{d.name}</h3>
              <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-muted-foreground">{d.note}</p>
            </article>
          ))}
        </div>
        <p className="mt-10 text-[12px] text-ink/50">
          Illustrative destinations, not Samral customer outcomes.
        </p>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */

function FinalCTA() {
  return (
    <section className="border-t border-border bg-ink text-background">
      <div className="mx-auto max-w-[920px] px-5 py-20 text-center sm:px-6 md:py-28">
        <h2 className="font-display text-3xl leading-[1.1] md:text-4xl">Ready to plan the trip?</h2>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-background/70">
          One specific trip, researched properly, with a written recommendation for what I&rsquo;d do
          {SHOW_DELIVERY_TIME ? ` — delivered within ${DELIVERY_TIME}.` : "."}
        </p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <BuyButton source="final_cta" variant="light" />
          <p className="text-[12px] text-background/55">{CURRENCY_NOTE}</p>
          <Link
            to={MILES_CALCULATOR_PATH}
            onClick={() => track("plan_trip_calculator_clicked", { source: "final_cta" })}
            className="text-[13px] text-background/70 underline underline-offset-4 hover:text-background"
          >
            Not sure what your points can do yet? Try the free Miles Calculator &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
