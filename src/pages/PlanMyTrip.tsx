import { useEffect } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  CONTACT_EMAIL,
  PRICES,
  TRIP_PLAN_FORM_URL,
  track,
} from "@/lib/commerce";

const DELIVERABLES = [
  "The strongest redemption options for your trip",
  "Points required and estimated taxes/fees",
  "Which points to transfer — and where",
  "Cash vs points comparison",
  "My recommended booking strategy",
  "Key transfer and booking steps",
];

const STEPS = [
  {
    number: "01",
    title: "Get your Trip Plan",
    copy: "Purchase the service securely online.",
  },
  {
    number: "02",
    title: "Tell me about your trip",
    copy: "After payment, you’ll complete a short questionnaire covering your destination, dates, points and travel preferences.",
  },
  {
    number: "03",
    title: "Get your recommendation",
    copy: "I’ll review the relevant redemption options and give you a clear strategy for how to use your points for the trip.",
  },
];

function PurchaseButton({ source, light = false }: { source: string; light?: boolean }) {
  return (
    <a
      href={TRIP_PLAN_FORM_URL}
      onClick={() => track("trip_plan_cta_clicked", { source, price_usd: PRICES.tripPlan })}
      className={`inline-flex min-h-12 items-center justify-center rounded-sm px-7 py-3.5 text-center text-sm font-medium transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 ${
        light ? "bg-background text-ink" : "bg-ink text-background"
      }`}
    >
      Get my Points Trip Plan — US$79
    </a>
  );
}

export default function PlanMyTrip() {
  useEffect(() => {
    document.title = "Points Trip Plan | Samral";
    const description =
      "A personalised Points Trip Plan with redemption options, points requirements, estimated fees and a clear booking strategy. US$79.";
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", description);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-background">
          <div className="mx-auto grid w-full max-w-[1200px] gap-14 px-5 py-14 sm:px-6 md:grid-cols-12 md:gap-20 md:px-12 md:py-24">
            <div className="md:col-span-7">
              <p className="eyebrow text-clay">Points Trip Plan</p>
              <h1 className="mt-5 max-w-[760px] font-display text-4xl leading-[1.05] text-ink md:text-6xl">
                You know where you want to go. I&rsquo;ll work out how to use your points.
              </h1>
              <p className="mt-7 max-w-[650px] text-[16px] leading-relaxed text-ink/75 md:text-lg">
                Tell me where you want to travel and what points you have. I&rsquo;ll compare the relevant
                programmes and redemption options and give you a clear plan for how to book.
              </p>
            </div>

            <div className="md:col-span-5 md:pt-10">
              <h2 className="font-display text-2xl text-ink md:text-3xl">What you&rsquo;ll get</h2>
              <ul className="mt-5 border-t border-border">
                {DELIVERABLES.map((item) => (
                  <li key={item} className="flex gap-3 border-b border-border py-3.5 text-[14px] leading-relaxed text-ink/80">
                    <span aria-hidden className="text-clay">&mdash;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-9">
                <p className="font-display text-5xl leading-none text-ink md:text-6xl">US$79</p>
                <p className="mt-2 text-[13px] text-ink/60">One-time payment.</p>
                <div className="mt-6">
                  <PurchaseButton source="trip_plan_primary" />
                  <p className="mt-3 text-[12px] leading-relaxed text-ink/55">
                    One short form · secure Stripe payment included
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-sand/40">
          <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-6 md:px-12 md:py-24">
            <p className="eyebrow text-clay">How it works</p>
            <div className="mt-8 grid gap-10 md:grid-cols-3 md:gap-12">
              {STEPS.map((step) => (
                <article key={step.number} className="border-t border-ink/20 pt-5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-clay">{step.number}</p>
                  <h2 className="mt-4 font-display text-2xl text-ink">{step.title}</h2>
                  <p className="mt-3 text-[14px] leading-relaxed text-ink/70">{step.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-background">
          <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-16 sm:px-6 md:grid-cols-12 md:px-12 md:py-20">
            <h2 className="font-display text-3xl leading-[1.1] text-ink md:col-span-4 md:text-4xl">
              Expert analysis for one trip.
            </h2>
            <div className="space-y-5 text-[14px] leading-relaxed text-ink/70 md:col-span-7 md:col-start-6">
              <p>
                Your plan is a personalised analysis and recommendation based on your trip, points and
                the available redemption options at the time of research.
              </p>
              <p>
                Samral does not book or issue airline tickets, transfer points on your behalf, or guarantee
                award-seat availability or savings. Programme pricing and availability can change.
              </p>
              <p>
                Questions before purchasing?{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4 hover:text-ink">
                  Email Samral
                </a>.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-ink text-background">
          <div className="mx-auto max-w-[920px] px-5 py-16 text-center sm:px-6 md:py-24">
            <p className="eyebrow text-background/60">Points Trip Plan</p>
            <h2 className="mt-5 font-display text-3xl leading-[1.1] md:text-5xl">Ready for a clear way forward?</h2>
            <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-background/70">
              Complete one five-minute form — secure Stripe payment is built in.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <PurchaseButton source="trip_plan_final" light />
              <p className="text-[12px] text-background/55">
                One short form · secure Stripe payment included
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
