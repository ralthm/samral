import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const BUSINESS_CALL_URL = "https://cal.com/samral/business-spend-discovery-call";

const track = (event: string, payload: Record<string, unknown> = {}) => {
  try {
    const w = window as unknown as { datafast?: (e: string, p?: Record<string, unknown>) => void };
    if (typeof w.datafast === "function") w.datafast(event, payload);
  } catch {
    /* no-op */
  }
};

function bookCall(source: string) {
  track("business_call_clicked", { source });
  window.open(BUSINESS_CALL_URL, "_blank", "noopener,noreferrer");
}

function CTAButton({ source, label = "Discuss Your Business Spend" }: { source: string; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => bookCall(source)}
      className="inline-flex items-center justify-center rounded-sm bg-ink px-8 py-4 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
    >
      {label}
    </button>
  );
}

export default function Business() {
  useEffect(() => {
    document.title = "Business Spend & Payment Optimization | Samral";
    const desc =
      "Samral reviews how your business pays — cards, recurring spend, FX, travel and supplier payments — to find value that is leaking or going unused.";
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
      <Problem />
      <Method />
      <Philosophy />
      <WhatWeLookAt />
      <WhoThisIsFor />
      <ConsumerBridge />
      <Scope />
      <FinalCTA />
      <SiteFooter />
    </div>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-5 py-16 sm:px-6 md:grid-cols-12 md:items-end md:gap-16 md:px-12 md:py-24">
        <div className="md:col-span-7">
          <p className="eyebrow text-ink/60">For business owners</p>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] text-ink md:text-6xl">
            Get more value from the money your business already spends.
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink/70">
            Samral examines how relevant business spending is paid &mdash; across cards, recurring
            expenses, foreign-currency payments, travel and other eligible expenditure &mdash; to
            identify opportunities to reduce leakage and capture more value.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <CTAButton source="hero" />
            <span className="text-[12px] text-ink/55">
              Starts with a conversation. No fixed package, no price list.
            </span>
          </div>
        </div>

        <div className="md:col-span-5 md:pl-8">
          <div className="border border-ink/15 p-6">
            <p className="eyebrow text-ink/50">The short version</p>
            <p className="mt-4 font-display text-2xl leading-snug text-ink">
              Most businesses scrutinise <em>what</em> they buy. Far fewer look at <em>how</em> the
              money is actually paid.
            </p>
            <p className="mt-4 text-[14px] leading-relaxed text-ink/65">
              That gap is usually where the value sits &mdash; in payment methods, card economics,
              fees, FX spreads, timing and unused rewards.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Problem ---------- */

const EXAMPLES = [
  {
    n: "01",
    text: "A company spends heavily every month on advertising but has never assessed whether its payment method is economically optimal.",
  },
  {
    n: "02",
    text: "A business paying foreign-currency SaaS bills focuses on the subscription price while overlooking FX and payment costs.",
  },
  {
    n: "03",
    text: "A supplier accepts cards &mdash; but a bank-transfer discount could be worth more than the rewards earned.",
  },
  {
    n: "04",
    text: "A company earns large quantities of points without any strategy for extracting useful value from them.",
  },
  {
    n: "05",
    text: "A card can improve payment timing and working capital &mdash; but only if its total benefit exceeds fees, lost discounts and operational complexity.",
  },
];

function Problem() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-6 md:px-12 md:py-24">
        <div className="max-w-2xl">
          <p className="eyebrow text-ink/60">Where value leaks</p>
          <h2 className="mt-4 font-display text-3xl leading-tight text-ink md:text-5xl">
            Five situations we see repeatedly.
          </h2>
        </div>
        <ul className="mt-12 grid gap-px border border-ink/12 bg-ink/12 md:grid-cols-2">
          {EXAMPLES.map((e) => (
            <li key={e.n} className="bg-background p-7 md:p-9">
              <p className="font-display text-2xl text-ink/35">{e.n}</p>
              <p
                className="mt-3 text-[15px] leading-relaxed text-ink/75"
                dangerouslySetInnerHTML={{ __html: e.text }}
              />
            </li>
          ))}
          <li className="hidden bg-background md:block" />
        </ul>
      </div>
    </section>
  );
}

/* ---------- Method ---------- */

const STEPS = [
  { k: "Understand", d: "Map the relevant spending and the current payment arrangements." },
  { k: "Identify", d: "Find areas where value may be leaking or going unused." },
  {
    k: "Underwrite",
    d: "Compare realistic economic benefits, costs, trade-offs and implementation difficulty.",
  },
  { k: "Implement", d: "Help the business execute approved, practical changes within Samral's scope." },
  {
    k: "Measure",
    d: "Where reasonably measurable, compare expected value with value actually captured.",
  },
];

function Method() {
  return (
    <section className="border-b border-border bg-ink text-background">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-6 md:px-12 md:py-24">
        <p className="eyebrow text-background/50">How the work runs</p>
        <h2 className="mt-4 font-display text-3xl text-background md:text-5xl">
          Understand &rarr; Identify &rarr; Underwrite &rarr; Implement &rarr; Measure
        </h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-5 md:gap-6">
          {STEPS.map((s, i) => (
            <li key={s.k} className="border-t border-background/20 pt-5">
              <p className="font-display text-xl text-background/40">{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-2 font-display text-2xl text-background">{s.k}</p>
              <p className="mt-3 text-[14px] leading-relaxed text-background/65">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- Philosophy ---------- */

function Philosophy() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 py-16 sm:px-6 md:grid-cols-12 md:px-12 md:py-24">
        <div className="md:col-span-6">
          <h2 className="font-display text-3xl leading-tight text-ink md:text-5xl">
            We don&rsquo;t just optimize points. <em>We optimize value.</em>
          </h2>
        </div>
        <div className="space-y-5 text-[15px] leading-relaxed text-ink/70 md:col-span-5 md:col-start-8">
          <p>
            Rewards are only one input. A card fee, an FX spread or a forgone supplier discount can
            easily be worth more than the points earned.
          </p>
          <p>
            So the honest answer is sometimes a bank transfer, sometimes a different card, sometimes
            a different payment method &mdash; and sometimes doing nothing at all.
          </p>
          <p className="text-ink">
            The objective is not to maximise rewards. It is to improve the overall economic result.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- What we look at ---------- */

const AREAS = [
  "Business cards and rewards",
  "Recurring business spend",
  "Payment methods",
  "Eligible supplier payments",
  "Foreign-currency payment economics",
  "Business travel",
  "Employee expenses, where relevant",
  "Fees and payment costs",
  "Payment timing and working-capital implications",
  "Other directly related spend and payment opportunities",
];

function WhatWeLookAt() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-6 md:px-12 md:py-24">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-ink/60">Scope</p>
            <h2 className="mt-4 font-display text-3xl text-ink md:text-5xl">What we look at.</h2>
          </div>
          <p className="max-w-sm text-[14px] leading-relaxed text-ink/60">
            Not every engagement covers every category. What is worth reviewing depends entirely on
            how the business actually spends.
          </p>
        </div>
        <ul className="mt-12 grid gap-x-10 gap-y-0 md:grid-cols-2">
          {AREAS.map((a) => (
            <li key={a} className="border-b border-ink/12 py-4 text-[15px] text-ink/80">
              {a}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Who this is for ---------- */

function WhoThisIsFor() {
  const kinds = [
    "Professional-services firms",
    "Clinics",
    "Agencies",
    "E-commerce and digital businesses",
    "Distributors",
    "Education and training companies",
    "Travel and hospitality businesses",
  ];
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 py-16 sm:px-6 md:grid-cols-12 md:px-12 md:py-24">
        <div className="md:col-span-5">
          <p className="eyebrow text-ink/60">Fit</p>
          <h2 className="mt-4 font-display text-3xl leading-tight text-ink md:text-5xl">
            Who this is for.
          </h2>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <p className="text-[15px] leading-relaxed text-ink/75">
            Samral&rsquo;s business service is designed primarily for owner-led SMEs where the
            founder, owner or MD still has meaningful visibility over how the company spends and
            pays.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink/70">
            It tends to be most useful for companies with meaningful recurring or cross-border spend
            &mdash; for example:
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {kinds.map((k) => (
              <li key={k} className="border border-ink/20 px-3 py-1.5 text-[13px] text-ink/75">
                {k}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[14px] leading-relaxed text-ink/55">
            If a business has little optimizable spend, this service probably isn&rsquo;t worth your
            time &mdash; and Samral will say so early rather than late.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Bridge from consumer side ---------- */

function ConsumerBridge() {
  return (
    <section className="border-b border-border bg-sand/40">
      <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-5 py-14 sm:px-6 md:grid-cols-12 md:items-center md:px-12 md:py-20">
        <div className="md:col-span-7">
          <h2 className="font-display text-2xl text-ink md:text-4xl">Already a Samral client?</h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink/70">
            For many business owners, the relationship starts with their own cards, points or
            travel. If you also run a business with meaningful recurring spend, Samral can assess
            whether similar opportunities exist within the business.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 md:col-span-5 md:justify-end">
          <Link
            to="/miles-calculator"
            className="inline-flex items-center justify-center rounded-sm border border-ink/70 px-6 py-3 text-sm text-ink transition-colors hover:bg-ink hover:text-background"
          >
            Miles Calculator
          </Link>
          <Link
            to="/points-strategy"
            className="inline-flex items-center justify-center rounded-sm border border-ink/70 px-6 py-3 text-sm text-ink transition-colors hover:bg-ink hover:text-background"
          >
            Cards Strategy
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- Scope note ---------- */

function Scope() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-12 sm:px-6 md:px-12 md:py-16">
        <p className="eyebrow text-ink/50">What this is not</p>
        <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-ink/60">
          Samral is a specialist, founder-led advisory focused on business spending and payments. It
          does not provide treasury management, investment advice, regulated financial planning, tax
          advice, legal advice, enterprise risk consulting or corporate strategy consulting. Any
          savings depend entirely on a company&rsquo;s own spending profile and are never guaranteed.
        </p>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */

function FinalCTA() {
  return (
    <section className="bg-ink text-background">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-6 md:px-12 md:py-24">
        <h2 className="max-w-3xl font-display text-3xl leading-tight text-background md:text-5xl">
          Start with a conversation, not a proposal.
        </h2>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-background/70">
          Scope and usefulness depend on how your company spends. The first step is a short
          conversation to see whether there is anything worth reviewing at all.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => bookCall("footer")}
            className="inline-flex items-center justify-center rounded-sm bg-background px-8 py-4 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
          >
            Discuss Your Business Spend
          </button>
          <a
            href="mailto:samuel@samral.com?subject=Business%20spend%20review"
            className="inline-flex items-center justify-center rounded-sm border border-background/60 px-8 py-4 text-sm text-background transition-colors hover:bg-background hover:text-ink"
          >
            Email Samuel
          </a>
        </div>
      </div>
    </section>
  );
}
