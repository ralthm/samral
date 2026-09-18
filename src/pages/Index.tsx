import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero.jpg";
import cabinImage from "@/assets/cabin.jpg";
import cpfLogo from "@/assets/cpf-logo.png.asset.json";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  COUNTRIES,
  type CountryCode,
  getBanksByCountry,
  getCardGroupsByBank,
  getPublicRulesForCardGroup,
  summaryCounters,
} from "@/data/milesCalculator";
import { calculateEntry, formatInt, parseIntSafe } from "@/lib/milesCalculator";
import {
  PRICES,
  formatUsd,
  SHOW_DELIVERY_TIME,
  DELIVERY_COPY,
  TRIP_PLAN_FORM_URL,
  track,
} from "@/lib/commerce";

export default function Home() {
  useEffect(() => {
    document.title = "Samral | Smarter Rewards. Better Travel.";
    const description =
      "Personal points trip planning, card strategy and a free miles calculator from Samral.";
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
      <SiteHeader variant="transparent" />
      <main>
        <Hero />
        <HowItWorks />
        <ClientResults />
        <Services />
        <CalculatorPreview />
        <BusinessPathway />
        <AboutSamuel />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-[680px] h-[92vh] w-full items-end overflow-hidden">
      <img
        src={heroImage}
        alt="View from an airplane window at golden hour"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/15 to-ink/80" />
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 pb-16 md:px-12 md:pb-24">
        <p className="eyebrow mb-5 text-background/85">SMARTER REWARDS. BETTER TRAVEL.</p>
        <h1 className="font-display max-w-[15ch] text-5xl leading-[1.02] text-background md:text-7xl lg:text-[96px]">
          You have the points.<br />
          <em className="italic text-secondary">Let&rsquo;s put them to good use.</em>
        </h1>
        <p className="mt-7 max-w-lg text-base leading-relaxed text-background/85 md:text-lg">
          I&rsquo;ll help you work out the smartest way to use your credit card points for the trips you actually want to take.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
          <a
            href={TRIP_PLAN_FORM_URL}
            onClick={() => track("trip_plan_cta_clicked", { source: "home_hero", price_usd: PRICES.tripPlan })}
            className="inline-flex min-h-12 items-center rounded-sm bg-background px-7 py-3 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
          >
            Get my Points Trip Plan — US$99
          </a>
          <a href="#how-it-works" className="py-3 text-sm text-background/85 underline underline-offset-4 transition-opacity hover:opacity-70">
            See how it works
          </a>
        </div>
        <p className="mt-3 text-xs text-background/70">One-time payment · Delivered within 2 business days</p>
      </div>
    </section>
  );
}

const steps = [
  { number: "01", title: "Tell me your trip", body: "Destination, dates and the points you already have." },
  { number: "02", title: "I compare the realistic options", body: "Cash fares, miles, transfer partners and airlines." },
  { number: "03", title: "Know what I’d do", body: "You get a clear recommendation and the steps to book it." },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-12 md:py-24">
        <p className="eyebrow text-clay">Your strategy in three steps</p>
        <ol className="mt-9 border-t border-border md:grid md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.number} className={`grid grid-cols-[3rem_1fr] gap-3 border-b border-border py-7 md:block md:border-b-0 md:px-8 md:py-9 ${index === 0 ? "md:pl-0" : "md:border-l"}`}>
              <p className="font-display text-lg text-clay">{step.number}</p>
              <div>
                <h2 className="font-display text-2xl leading-tight text-ink md:text-3xl">{step.title}</h2>
                <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

interface ClientResult {
  id: string;
  name: string;
  title: string;
  organisation: string;
  logo: { url: string };
  logoAlt: string;
  headline: string;
  body: string;
  outcome: string;
  detail: string;
}

const clientResults: ClientResult[] = [
  {
    id: "synapse-seoul",
    name: "",
    title: "Executive Director",
    organisation: "Synapse Physiotherapy",
    logo: synapseLogo,
    logoAlt: "Synapse Physiotherapy",
    headline: "From unused points to two Business Class return tickets to Seoul.",
    body: "He had accumulated a substantial points balance without a plan for using it. I reviewed his points and cards and worked out how to use them for a trip he wanted to take.",
    outcome: "2× RETURN BUSINESS CLASS TICKETS",
    detail: "Kuala Lumpur ↔ Seoul",
  },
  {
    id: "cpf-taiwan",
    name: "Dr Wasu Kasimani",
    title: "Senior General Manager",
    organisation: "Chau Yang Farm / Charoen Pokphand Foods",
    logo: cpfLogo,
    logoAlt: "Charoen Pokphand Foods",
    headline: "Two return flights to Taiwan — without using any points.",
    body: "I reviewed Dr Wasu’s existing card benefits and found an unused travel benefit that could be put toward his upcoming trip.",
    outcome: "2× RETURN FLIGHTS TO TAIWAN",
    detail: "0 POINTS REQUIRED",
  },
];

function ClientResults() {
  return (
    <section id="client-results" className="border-b border-border bg-sand">
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-28">
        <p className="eyebrow text-clay">Client results</p>
        <div className="mt-10 divide-y divide-border border-y border-border">
          {clientResults.map((result, index) => (
            <article key={result.id} className="grid gap-9 py-12 md:grid-cols-12 md:gap-12 md:py-16">
              <div className="md:col-span-3">
                <div className="flex items-start justify-between gap-5 md:block">
                  <div>
                    {result.name && <p className="text-[15px] font-medium text-ink">{result.name}</p>}
                    <p className={`${result.name ? "mt-1" : ""} text-sm text-muted-foreground`}>{result.title}</p>
                    <p className="mt-1 max-w-[18rem] text-sm leading-snug text-muted-foreground">{result.organisation}</p>
                  </div>
                  <img src={result.logo.url} alt={result.logoAlt} className="h-10 w-auto max-w-[120px] object-contain opacity-80 md:mt-7" loading="lazy" />
                </div>
              </div>
              <div className="md:col-span-4">
                <h2 className="font-display text-3xl leading-[1.08] text-ink md:text-4xl">{result.headline}</h2>
                <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink/75">{result.body}</p>
              </div>
              <div className="md:col-span-5 md:pl-8">
                <p className="eyebrow text-clay">The outcome</p>
                <p className="mt-5 font-display text-4xl leading-[1.02] text-ink md:text-5xl lg:text-6xl">{result.outcome}</p>
                <p className={`mt-4 font-display text-xl ${index === 1 ? "text-clay" : "text-ink/65"}`}>{result.detail}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-8 text-[15px] text-ink/75">
          Every Samral engagement is personally reviewed by{" "}
          <Link to="/about" className="font-medium text-ink underline underline-offset-4">Samuel</Link>.
        </p>
      </div>
    </section>
  );
}

const services = [
  {
    tag: "For a specific trip",
    title: "Points Trip Planning",
    price: formatUsd(PRICES.tripPlan),
    copy: "You have a trip in mind. I’ll research the realistic ways to use your points, compare the trade-offs and give you a clear recommendation for what I’d do.",
    bullets: [
      "Best overall option: programme, airline and routing",
      "Up to 2 realistic alternatives where useful",
      "Cash vs points and any transfers required",
      "Clear booking steps + personalised video walkthrough",
    ],
    scope: SHOW_DELIVERY_TIME ? `One round-trip, up to 2 travellers. ${DELIVERY_COPY}` : "One round-trip, up to 2 travellers.",
    href: TRIP_PLAN_FORM_URL,
    label: "Get my Points Trip Plan — US$99",
    support: "One-time payment · Delivered within 2 business days",
    source: "home_services",
  },
  {
    tag: "For your overall setup",
    title: "Personal Card Strategy",
    price: formatUsd(PRICES.cardStrategy),
    copy: "A personalized system for what cards to use, where to put your spending and what points to build toward.",
    bullets: [
      "Review of current cards, points balances, fees and benefits",
      "Spending-by-category card strategy",
      "Points currencies to prioritize based on goals",
      "One-page card guide and sequenced written action plan",
    ],
    scope: "Personal cards only. Payment and scheduling in one step.",
    href: "/points-strategy",
    label: "Book my Card Strategy — US$149",
    support: "Personal cards only · Payment and scheduling in one step",
  },
];

function Services() {
  return (
    <section id="services" className="bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-28">
        <p className="eyebrow text-clay">Services</p>
        <h2 className="mt-5 font-display text-4xl text-ink md:text-6xl">Two ways to work together.</h2>
        <div className="mt-14 divide-y divide-border border-y border-border md:grid md:grid-cols-2 md:divide-x md:divide-y-0">
          {services.map((service, index) => (
            <article key={service.title} className={`py-10 md:py-14 ${index === 0 ? "md:pr-12" : "md:pl-12"}`}>
              <p className="eyebrow text-clay">{service.tag}</p>
              <div className="mt-5 flex flex-wrap items-baseline justify-between gap-4">
                <h3 className="font-display text-3xl text-ink md:text-4xl">{service.title}</h3>
                <p className="font-display text-3xl text-ink md:text-4xl">{service.price}</p>
              </div>
              <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-ink/80">{service.copy}</p>
              <ul className="mt-7 space-y-3 border-t border-border pt-6">
                {service.bullets.map((bullet) => (
                  <li key={bullet} className="grid grid-cols-[1rem_1fr] gap-2 text-[15px] leading-relaxed text-ink/75">
                    <span aria-hidden className="text-clay">—</span><span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-7 text-sm italic text-muted-foreground">{service.scope}</p>
              <a
                href={service.href}
                onClick={service.source ? () => track("trip_plan_cta_clicked", { source: service.source, price_usd: PRICES.tripPlan }) : undefined}
                className="mt-7 inline-flex min-h-12 items-center rounded-sm bg-ink px-6 py-3 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
              >
                {service.label}
              </a>
              <p className="mt-2 text-xs text-muted-foreground">{service.support}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CalculatorPreview() {
  const [country, setCountry] = useState<CountryCode>("MY");
  const [bankId, setBankId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [rawPoints, setRawPoints] = useState("100000");

  const banks = useMemo(
    () => getBanksByCountry(country).filter((bank) => getCardGroupsByBank(bank.id).some((group) => getPublicRulesForCardGroup(group.id).length > 0)),
    [country],
  );
  const selectedBankId = banks.some((bank) => bank.id === bankId) ? bankId : banks[0]?.id ?? "";
  const groups = useMemo(
    () => getCardGroupsByBank(selectedBankId).filter((group) => getPublicRulesForCardGroup(group.id).length > 0),
    [selectedBankId],
  );
  const selectedGroupId = groups.some((group) => group.id === groupId) ? groupId : groups[0]?.id ?? "";
  const points = parseIntSafe(rawPoints);
  const results = Number.isFinite(points) && selectedGroupId
    ? calculateEntry({ entryId: "home-preview", cardGroupId: selectedGroupId, bankPoints: points })
        .sort((a, b) => b.partnerPointsReceived - a.partnerPointsReceived)
        .slice(0, 3)
    : [];
  const counters = summaryCounters(country);

  return (
    <section className="border-y border-border bg-sand">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 py-20 md:grid-cols-12 md:px-12 md:py-28">
        <div className="md:col-span-4">
          <p className="eyebrow text-clay">Free Miles Calculator</p>
          <h2 className="mt-5 font-display text-4xl leading-[1.08] text-ink md:text-5xl">See what your bank points can become.</h2>
          <p className="mt-6 max-w-sm text-[16px] leading-relaxed text-muted-foreground">
            Enter your points balance and compare available airline transfer options.
          </p>
          <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-border pt-7">
            <DataPoint value={counters.issuers} label="Issuers covered" />
            <DataPoint value={counters.routes} label="Verified routes" />
            <DataPoint value={counters.cardProgrammes} label="Rewards programmes" />
            <DataPoint value={counters.partners} label="Transfer partners" />
          </dl>
          <Link to="/miles-calculator" className="mt-9 inline-flex min-h-12 items-center rounded-sm bg-ink px-6 py-3 text-sm font-medium text-background">
            Try the free Miles Calculator
          </Link>
        </div>

        <div className="border-t border-ink pt-8 md:col-span-7 md:col-start-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Market
              <select
                value={country}
                onChange={(event) => { setCountry(event.target.value as CountryCode); setBankId(""); setGroupId(""); }}
                className="mt-2 h-12 w-full border border-border bg-background px-3 text-sm normal-case tracking-normal text-ink outline-none focus:border-clay"
              >
                {COUNTRIES.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
              </select>
            </label>
            <label className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Issuer
              <select
                value={selectedBankId}
                onChange={(event) => { setBankId(event.target.value); setGroupId(""); }}
                className="mt-2 h-12 w-full border border-border bg-background px-3 text-sm normal-case tracking-normal text-ink outline-none focus:border-clay"
              >
                {banks.map((bank) => <option key={bank.id} value={bank.id}>{bank.name}</option>)}
              </select>
            </label>
            <label className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground sm:col-span-2">
              Card or rewards programme
              <select
                value={selectedGroupId}
                onChange={(event) => setGroupId(event.target.value)}
                className="mt-2 h-12 w-full border border-border bg-background px-3 text-sm normal-case tracking-normal text-ink outline-none focus:border-clay"
              >
                {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
              </select>
            </label>
            <label className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground sm:col-span-2">
              Points balance
              <input
                inputMode="numeric"
                value={rawPoints}
                onChange={(event) => setRawPoints(event.target.value.replace(/[^0-9,]/g, ""))}
                className="mt-2 h-14 w-full border border-border bg-background px-4 font-display text-2xl text-ink outline-none focus:border-clay"
                aria-label="Points balance"
              />
            </label>
          </div>

          <div className="mt-8 border-t border-border">
            <p className="py-4 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Available transfer results</p>
            {results.length > 0 ? (
              <div className="divide-y divide-border border-y border-border">
                {results.map((result) => (
                  <div key={result.programmeId} className="flex items-end justify-between gap-5 py-5">
                    <div>
                      <p className="font-display text-xl text-ink">{result.programmeName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatInt(result.bankPointsUsed)} {result.rewardCurrencyName} used
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-3xl text-ink">{formatInt(result.partnerPointsReceived)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">miles or points</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="border-y border-border py-7 text-sm text-muted-foreground">Enter a valid points balance to see verified options.</p>
            )}
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Preview uses the same verified conversion data as the full calculator.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function DataPoint({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <dd className="font-display text-3xl text-ink">{formatInt(value)}</dd>
      <dt className="mt-1 text-xs leading-snug text-muted-foreground">{label}</dt>
    </div>
  );
}

function BusinessPathway() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-6 py-20 md:grid-cols-12 md:px-12 md:py-28">
        <p className="eyebrow text-clay md:col-span-3">For business owners</p>
        <div className="md:col-span-7 md:col-start-5">
          <h2 className="font-display text-4xl leading-[1.08] text-ink md:text-5xl">Get more value from the money your business already spends.</h2>
          <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
            I review cards, recurring spend, supplier payments, foreign-currency payments and business travel to find value being lost or left unused.
          </p>
          <Link to="/business" className="mt-8 inline-flex min-h-12 items-center rounded-sm border border-ink px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-background">
            Explore Samral for Business
          </Link>
        </div>
      </div>
    </section>
  );
}

function AboutSamuel() {
  return (
    <section className="bg-sand">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-6 py-20 md:grid-cols-12 md:px-12 md:py-28">
        <div className="md:col-span-7 md:col-start-2">
          <p className="eyebrow text-clay">Who&rsquo;s behind Samral</p>
          <h2 className="mt-5 font-display text-4xl text-ink md:text-6xl">Hi, I&rsquo;m Samuel.</h2>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink/80">
            I research credit-card rewards, loyalty programmes and the economics behind how we spend and travel. Every Samral recommendation is personally reviewed by me.
          </p>
          <Link to="/about" className="mt-8 inline-block text-sm font-medium text-ink underline underline-offset-4">
            About Samuel &amp; Samral →
          </Link>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-ink text-background">
      <img src={cabinImage} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-20" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/65 to-ink/90" />
      <div className="relative z-10 mx-auto max-w-[1440px] px-6 py-24 md:px-12 md:py-36">
        <p className="eyebrow text-background/65">Get started</p>
        <h2 className="mt-5 font-display max-w-3xl text-5xl leading-[1.02] text-background md:text-7xl">
          Have the points?<br />Let&rsquo;s work out what to do with them.
        </h2>
        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href={TRIP_PLAN_FORM_URL}
            onClick={() => track("trip_plan_cta_clicked", { source: "home_final", price_usd: PRICES.tripPlan })}
            className="inline-flex min-h-12 items-center rounded-sm bg-background px-7 py-3 text-sm font-medium text-ink"
          >
            Get my Points Trip Plan — US$99
          </a>
          <Link to="/points-strategy" className="inline-flex min-h-12 items-center rounded-sm border border-background/60 px-7 py-3 text-sm font-medium text-background transition-colors hover:bg-background hover:text-ink">
            Book my Card Strategy — US$149
          </Link>
        </div>
        <Link to="/miles-calculator" className="mt-6 inline-block text-sm text-background/70 underline underline-offset-4">
          Not ready? Try the free Miles Calculator →
        </Link>
      </div>
    </section>
  );
}
