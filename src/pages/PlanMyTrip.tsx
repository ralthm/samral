import { useEffect } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  CONTACT_EMAIL,
  PRICES,
  TRIP_PLAN_FORM_URL,
  track,
} from "@/lib/commerce";
import cabinImg from "@/assets/cabin.jpg";
import kyotoImg from "@/assets/kyoto.jpg";
import italyImg from "@/assets/italy.jpg";

const DELIVERABLES = [
  "Best overall recommendation (the programme, airline and routing I’d choose)",
  "Up to 2 realistic alternatives where useful",
  "Cash vs points comparison",
  "Points required, estimated taxes and transfer requirements",
  "What I’d transfer and what I’d leave untouched",
  "Clear sequence of what to verify, transfer and book",
  "Short personalized video walkthrough explaining the recommendation and trade-offs",
];

const QUALIFIERS = [
  "you have a meaningful points or miles balance",
  "you are travelling long-haul",
  "you are booking for two or more travellers",
  "you are considering Business or First Class",
  "you have points across multiple programmes",
  "you are unsure whether transferring points or paying cash is smarter",
  "you would rather delegate the research",
];

const STEPS = [
  {
    number: "01",
    title: "Tell me about your trip",
    copy: "Complete a short form covering your destination, dates, points and travel preferences.",
  },
  {
    number: "02",
    title: "Complete your details & payment",
    copy: "Secure payment of US$99 is handled by Stripe inside the same form. The whole form takes about five minutes.",
  },
  {
    number: "03",
    title: "Get your recommendation",
    copy: "I’ll review the relevant redemption options and deliver your personalised Trip Plan within 2 business days.",
  },
];

const OUTCOMES = [
  {
    destination: "Seoul",
    outcome: "Two return business-class tickets",
    copy: "A strategy using previously underused points and an improved card/rewards approach helped identify a path to two return business-class tickets to Seoul.",
  },
  {
    destination: "Taiwan",
    outcome: "Two return flights",
    copy: "A rewards strategy identified a way to cover two return flights to Taiwan using available points and redemption opportunities.",
  },
];

const FAQ = [
  {
    question: "What if using cash is better than using points?",
    answer: "I’ll tell you. The goal is the best overall economic outcome, not using points for the sake of using them.",
  },
  {
    question: "What if my points are spread across several banks or programmes?",
    answer: "Include them all in the form. I’ll assess which are relevant and how they can potentially be used for the trip.",
  },
  {
    question: "Do you book the flights for me?",
    answer: "No. Samral provides the analysis, recommendation and booking strategy through a video walkthrough. Samral does not issue tickets, transfer points on your behalf or make bookings for you.",
  },
  {
    question: "What if award availability changes?",
    answer: "Award availability and programme pricing can change. Your Trip Plan will reflect the options available at the time of research, and you should reconfirm availability before transferring points.",
  },
  {
    question: "What if there isn’t a good redemption available?",
    answer: "I’ll tell you that too. The recommendation may be to pay cash, save your points, or use them differently.",
  },
];

const COLLAGE = [
  {
    src: cabinImg,
    alt: "Business-class airline seat beside an aircraft window at dusk",
    label: "Business Class",
    note: "Know when the premium is actually worth the points.",
  },
  {
    src: kyotoImg,
    alt: "Lantern-lit street in Kyoto at dusk",
    label: "Tokyo · Kyoto",
    note: "Use points more intelligently.",
  },
  {
    src: italyImg,
    alt: "Evening dining on a coastal street in Italy",
    label: "Europe",
    note: "Compare cash vs redemption value.",
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
      Get my Points Trip Plan
    </a>
  );
}

export default function PlanMyTrip() {
  useEffect(() => {
    document.title = "Points Trip Plan | Samral";
    const description =
      "A personalized Points Trip Plan with a clear recommendation, realistic alternatives and booking sequence. US$99.";
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
                You have a trip in mind. I&rsquo;ll research the realistic ways to use your points, compare
                the trade-offs and give you a clear recommendation for what I&rsquo;d do.
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
              <div className="mt-5 border-l-2 border-clay pl-4">
                <p className="text-[13px] font-medium text-ink">
                  {"\n"}
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-ink/60">
                  {"\n"}
                </p>
              </div>

              <div className="mt-9">
                <p className="font-display text-5xl leading-none text-ink md:text-6xl">US$99</p>
                <p className="mt-2 text-[13px] text-ink/60">
                  One-time payment · Delivered within 2 business days
                </p>
                <p className="mt-2 text-[12px] text-ink/55">Standard scope: one round-trip for up to 2 travellers.</p>
                <div className="mt-6">
                  <PurchaseButton source="trip_plan_primary" />
                  <p className="mt-3 text-[12px] leading-relaxed text-ink/55">
                    One short form · secure Stripe payment included
                  </p>
                  <p className="mt-4 text-[12px] leading-relaxed text-ink/60">
                    <span className="font-medium text-clay">Clear-Plan Guarantee.</span> If, after receiving your Trip Plan, you’re unclear about which option I recommend or what the next steps are, send me your questions within 7 days. I’ll clarify the recommendation or revise it once at no additional charge.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[1200px] px-5 pb-14 sm:px-6 md:px-12 md:pb-20">
            <p className="max-w-md text-[13px] leading-relaxed text-ink/55">
              This is what your points can turn into.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {COLLAGE.map((image) => (
                <figure key={image.label} className="group">
                  <div className="overflow-hidden rounded-sm">
                    <img
                      src={image.src}
                      alt={image.alt}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                  <figcaption className="mt-3">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-clay">
                      {image.label}
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink/60">{image.note}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-background">
          <div className="mx-auto grid max-w-[1200px] gap-8 px-5 py-14 sm:px-6 md:grid-cols-12 md:px-12 md:py-20">
            <div className="md:col-span-4">
              <p className="eyebrow text-clay">Who this is for</p>
              <h2 className="mt-4 font-display text-3xl leading-[1.1] text-ink md:text-4xl">A Trip Plan is particularly useful if:</h2>
            </div>
            <div className="md:col-span-7 md:col-start-6">
              <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {QUALIFIERS.map((item) => (
                  <li key={item} className="flex gap-3 text-[14px] leading-relaxed text-ink/75">
                    <span aria-hidden className="text-clay">&mdash;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-7 border-t border-border pt-6 text-[14px] leading-relaxed text-ink/65">
                Points Trip Planning is best suited to travelers with a meaningful points or miles balance,
                particularly for long-haul travel, couples or families, premium-cabin trips, multiple points
                programmes, or situations where you would rather delegate the research.
              </p>
              <p className="mt-4 text-[14px] leading-relaxed text-ink/65">
                You probably don&rsquo;t need a paid Trip Plan if your trip is inexpensive and straightforward,
                you have only a small points balance, or you already know exactly how you want to book. The{" "}
                <a href="/miles-calculator" className="underline underline-offset-4 hover:text-ink">free Miles Calculator</a>{" "}
                may be enough.
              </p>
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
          <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-6 md:px-12 md:py-24">
            <p className="eyebrow text-clay">Real outcomes</p>
            <div className="mt-8 grid gap-6 md:grid-cols-2 md:gap-10">
              {OUTCOMES.map((item) => (
                <article key={item.destination} className="border border-border bg-background p-7 md:p-9">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-clay">
                    {item.destination}
                  </p>
                  <h3 className="mt-3 font-display text-2xl leading-snug text-ink md:text-3xl">
                    {item.outcome}
                  </h3>
                  <p className="mt-4 text-[14px] leading-relaxed text-ink/70">{item.copy}</p>
                </article>
              ))}
            </div>
            <p className="mt-8 max-w-2xl text-[12px] leading-relaxed text-ink/55">
              Individual results depend on your points, dates and award availability. These examples are
              illustrative of the analysis, not a guarantee of a specific outcome.
            </p>
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
              <p>{"\n"}</p>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-sand/40">
          <div className="mx-auto max-w-[800px] px-5 py-16 sm:px-6 md:px-12 md:py-24">
            <h2 className="font-display text-2xl text-ink md:text-3xl">Frequently asked questions</h2>
            <div className="mt-8 space-y-6">
              {FAQ.map((item) => (
                <details key={item.question} className="group border-b border-border pb-6">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-display text-lg text-ink">
                    {item.question}
                    <span aria-hidden className="text-clay transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-[14px] leading-relaxed text-ink/70">{item.answer}</p>
                </details>
              ))}
            </div>
            <p className="mt-8 text-[13px] leading-relaxed text-ink/55">
              Planning to book soon? Award availability and programme pricing can change, so earlier research usually gives you more options.
            </p>
          </div>
        </section>

        <section className="bg-ink text-background">
          <div className="mx-auto max-w-[920px] px-5 py-16 text-center sm:px-6 md:py-24">
            <p className="eyebrow text-background/60">Points Trip Plan</p>
            <h2 className="mt-5 font-display text-3xl leading-[1.1] md:text-5xl">Ready for a clear way forward?</h2>
            <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-background/70">
              Complete one five-minute form and I’ll work out how to use your points for the trip.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <PurchaseButton source="trip_plan_final" light />
              <p className="text-[12px] text-background/55">
                One short form · secure Stripe payment included · delivered within 2 business days
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
