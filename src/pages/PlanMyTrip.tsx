import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const DISCOVERY_CALL_URL = "https://cal.com/samral/discovery-call";
const MILES_CALCULATOR_PATH = "/miles-calculator";

const track = (event: string, payload: Record<string, unknown> = {}) => {
  try {
    const w = window as unknown as { datafast?: (e: string, p?: Record<string, unknown>) => void };
    if (typeof w.datafast === "function") w.datafast(event, payload);
  } catch {
    /* no-op */
  }
};

const bookCall = (source: string) => {
  track("plan_trip_book_call_clicked", { source });
  const params = new URLSearchParams({ source: `plan_my_trip_${source}` });
  window.open(`${DISCOVERY_CALL_URL}?${params.toString()}`, "_blank", "noopener,noreferrer");
};

const goCalculator = (source: string) => {
  track("plan_trip_calculator_clicked", { source });
};

export default function PlanMyTrip() {
  useEffect(() => {
    document.title = "Points Trip Planning | Samral";
    const desc =
      "Used the Samral Miles Calculator? Book a free 20-minute discovery call to talk through how to turn your points into the trip you want.";
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
      <StartWithCalculator />
      <WhenToBook />
      <WhatHappens />
      <MoreWork />
      <ImportantInfo />
      <FinalCTA />
      <SiteFooter />
    </div>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-5 py-16 sm:px-6 md:grid-cols-2 md:items-center md:gap-16 md:px-12 md:py-24">
        <div>
          <p className="eyebrow text-ink/60">Points Trip Planning</p>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] text-ink md:text-6xl">
            You have the points. Now let&rsquo;s figure out the trip.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink/70">
            Already checked your points with the Samral Miles Calculator? If you&rsquo;re still unsure how to turn
            them into the trip you want, book a free 20-minute discovery call with Samral.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => bookCall("hero")}
              className="inline-flex items-center justify-center rounded-sm bg-ink px-8 py-4 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
            >
              Book a free 20-minute call
            </button>
            <Link
              to={MILES_CALCULATOR_PATH}
              onClick={() => goCalculator("hero")}
              className="inline-flex items-center justify-center rounded-sm border border-ink/70 px-8 py-4 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-background"
            >
              Check my points first
            </Link>
          </div>

          <p className="mt-4 text-[12px] text-ink/55">
            Please use the Miles Calculator before booking your call.
          </p>
        </div>

        {/* Flow visual */}
        <div className="md:pl-8">
          <FlowDiagram />
        </div>
      </div>
    </section>
  );
}

function FlowDiagram() {
  const steps = [
    { n: "1", title: "Calculate", sub: "Check your points with the Miles Calculator" },
    { n: "2", title: "Discover", sub: "See what your points can potentially unlock" },
    { n: "3", title: "Talk", sub: "Book a free 20-minute discovery call" },
  ];
  return (
    <ol className="relative space-y-5">
      {steps.map((s, i) => (
        <li key={s.n} className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-sm border border-ink/25 font-display text-2xl text-ink">
            {s.n}
          </div>
          <div className="pt-1.5">
            <p className="font-display text-xl text-ink">{s.title}</p>
            <p className="mt-0.5 text-[13px] text-ink/65">{s.sub}</p>
          </div>
          {i < steps.length - 1 && (
            <span aria-hidden className="absolute left-6 top-12 h-5 w-px bg-ink/15" style={{ top: `${48 + i * 76}px` }} />
          )}
        </li>
      ))}
    </ol>
  );
}

/* ---------- Section 2 — Start with the calculator ---------- */

function StartWithCalculator() {
  return (
    <section className="bg-sand/40">
      <div className="mx-auto max-w-[920px] px-5 py-16 sm:px-6 md:py-24">
        <h2 className="font-display text-3xl leading-[1.1] text-ink md:text-4xl">
          First, see what your points can already unlock
        </h2>
        <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink/75">
          <p>
            The Samral Miles Calculator is designed to answer the first questions for you &mdash; including what your
            bank points can convert into and the destinations your available miles may potentially cover.
          </p>
          <p>
            If the calculator gives you everything you need, there&rsquo;s no reason to book a call.
          </p>
          <p>
            But if you have the points and are still unsure how to actually use them for the trip you want, that&rsquo;s
            where the discovery call comes in.
          </p>
        </div>
        <Link
          to={MILES_CALCULATOR_PATH}
          onClick={() => goCalculator("start_section")}
          className="mt-8 inline-flex items-center justify-center rounded-sm border border-ink/70 px-8 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-background"
        >
          Use the Miles Calculator
        </Link>
      </div>
    </section>
  );
}

/* ---------- Section 3 — When to book a call ---------- */

const WHEN_EXAMPLES = [
  "I have enough points, but I can\u2019t find suitable award seats",
  "I\u2019m not sure which loyalty programme or transfer route to use",
  "I found several options and don\u2019t know which makes the most sense",
  "I\u2019m unsure whether I should transfer my bank points yet",
  "I understand the points requirement, but I\u2019m struggling with the actual redemption process",
  "My dates, routing or number of travellers make the booking complicated",
];

function WhenToBook() {
  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-6 md:px-12 md:py-24">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <h2 className="font-display text-3xl leading-[1.1] text-ink md:text-4xl">
              The calculator says it&rsquo;s possible. But you&rsquo;re not sure what to do next.
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-ink/70">
              If that sounds familiar, let&rsquo;s talk through it.
            </p>
            <button
              type="button"
              onClick={() => bookCall("when_section")}
              className="mt-6 inline-flex items-center justify-center rounded-sm bg-ink px-8 py-3.5 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
            >
              Book my discovery call
            </button>
          </div>

          <ul className="md:col-span-7 md:pt-2">
            {WHEN_EXAMPLES.map((ex) => (
              <li
                key={ex}
                className="flex items-start gap-3 border-b border-border py-4 text-[14px] text-ink/80 first:pt-0"
              >
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ink/40" />
                <span>{ex}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- Section 4 — What happens on the call ---------- */

const CALL_STEPS = [
  {
    n: "1",
    title: "You check your points first",
    body: "Use the Samral Miles Calculator before the call so you already understand your potential balances and travel options.",
  },
  {
    n: "2",
    title: "Tell us where you\u2019re stuck",
    body: "Your booking form gives Samral the basic context &mdash; where you want to go, when you want to travel, how many people are travelling, what points or miles you have, and what you are having difficulty with.",
  },
  {
    n: "3",
    title: "We talk it through",
    body: "During the 20-minute call, we\u2019ll discuss your situation, what is preventing you from making the redemption yourself, and what your practical next step may be.",
  },
];

function WhatHappens() {
  return (
    <section className="bg-sand/40">
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-6 md:px-12 md:py-24">
        <h2 className="max-w-2xl font-display text-3xl leading-[1.1] text-ink md:text-4xl">
          20 minutes. Your trip, your points, your roadblock.
        </h2>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {CALL_STEPS.map((s) => (
            <div key={s.n} className="border-t border-ink/20 pt-5">
              <p className="font-display text-5xl text-ink/30">{s.n}</p>
              <p className="mt-3 font-display text-xl text-ink">{s.title}</p>
              <p
                className="mt-2 text-[13px] leading-relaxed text-ink/70"
                dangerouslySetInnerHTML={{ __html: s.body }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Section 5 — If your trip needs more work ---------- */

function MoreWork() {
  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-[920px] px-5 py-16 sm:px-6 md:py-24">
        <h2 className="font-display text-3xl leading-[1.1] text-ink md:text-4xl">
          Some bookings need more than 20 minutes.
        </h2>
        <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink/75">
          <p>
            Award travel can become complicated quickly &mdash; especially when availability is limited, dates are
            fixed, several travellers are involved, multiple loyalty programmes need to be compared, or alternative
            routings need to be researched.
          </p>
          <p>
            The discovery call helps us understand where you&rsquo;re stuck. If your trip requires deeper research or
            hands-on booking support, we can discuss whether additional Samral assistance would be useful.
          </p>
        </div>
        <button
          type="button"
          onClick={() => bookCall("more_work_section")}
          className="mt-8 inline-flex items-center justify-center rounded-sm border border-ink/70 px-8 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-background"
        >
          Start with a free discovery call
        </button>
      </div>
    </section>
  );
}

/* ---------- Section 6 — Important information ---------- */

const IMPORTANT_ITEMS = [
  "Points requirements shown by the Samral Miles Calculator do not indicate live award-seat availability.",
  "Award availability can change.",
  "Taxes, fees and carrier surcharges may apply to award bookings.",
  "Do not transfer points solely because a calculator result shows a possible redemption. Transfers may be irreversible and availability should be considered first.",
  "The free 20-minute call does not include pre-call or post-call itinerary research, a written redemption plan or guaranteed booking assistance.",
  "Samral does not guarantee award availability or successful bookings.",
];

function ImportantInfo() {
  return (
    <section className="bg-sand/40">
      <div className="mx-auto max-w-[920px] px-5 py-14 sm:px-6 md:py-20">
        <h2 className="font-display text-2xl text-ink md:text-3xl">Before you book</h2>
        <ul className="mt-6 space-y-3">
          {IMPORTANT_ITEMS.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 border-t border-border pt-3 text-[13px] leading-relaxed text-ink/65"
            >
              <span aria-hidden className="mt-1.5 h-1 w-3 flex-shrink-0 bg-ink/30" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */

function FinalCTA() {
  return (
    <section className="border-t border-border bg-ink text-background">
      <div className="mx-auto max-w-[920px] px-5 py-20 text-center sm:px-6 md:py-28">
        <h2 className="font-display text-3xl leading-[1.1] md:text-4xl">Already checked your points?</h2>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-background/70">
          If you know what your points can potentially unlock but still need help figuring out how to make the trip
          happen, book a 20-minute discovery call.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={() => bookCall("final_cta")}
            className="inline-flex items-center justify-center rounded-sm bg-background px-8 py-4 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
          >
            Book a free 20-minute call
          </button>
          <Link
            to={MILES_CALCULATOR_PATH}
            onClick={() => goCalculator("final_cta")}
            className="text-[13px] text-background/70 underline underline-offset-4 hover:text-background"
          >
            Haven&rsquo;t checked yet? Use the Miles Calculator &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
