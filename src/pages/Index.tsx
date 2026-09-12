import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

import travel1 from "@/assets/travel-1.jpg.asset.json";
import travel2 from "@/assets/travel-2.jpg.asset.json";
import travel3 from "@/assets/travel-3.jpg.asset.json";
import travel4 from "@/assets/travel-4.jpg.asset.json";
import svcAircraftAsset from "@/assets/svc-aircraft.jpg.asset.json";
import svcNotebookAsset from "@/assets/svc-notebook.jpg.asset.json";
import kyotoImage from "@/assets/kyoto.jpg";
import cabinImage from "@/assets/cabin.jpg";
import synapseLogo from "@/assets/synapse-logo.png.asset.json";
import cpfLogo from "@/assets/cpf-logo.png.asset.json";
import { PRICES, formatUsd, CURRENCY_NOTE, SHOW_DELIVERY_TIME, DELIVERY_COPY, TRIP_PLAN_FORM_URL, track } from "@/lib/commerce";

export default function Home() {
  useEffect(() => {
    document.title = "Samral | More Value From Money You Already Spend";
    const desc =
      "Samral helps individuals get more from their cards, points and travel — and helps business owners find value in how their company spends and pays.";
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
      <Nav />
      <Hero />

      <Promise />
      <ClientResults />
      <FounderTrustSignal />
      <Services />
      <BusinessPathway />
      <AboutSamral />
      <Inspiration />
      <Contact />
      <Footer />
    </div>
  );
}



/* ---------- Nav ---------- */

function Nav() {
  return <SiteHeader variant="transparent" />;
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="relative h-[92vh] min-h-[640px] w-full overflow-hidden">
      <img
        src={heroImage}
        alt="View from an airplane window at golden hour"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(30,20,10,0.55) 0%, rgba(30,20,10,0.15) 40%, rgba(30,20,10,0.75) 100%)",
        }}
      />
      <div className="relative z-10 mx-auto flex h-full max-w-[1440px] flex-col justify-end px-6 pb-20 md:px-12 md:pb-28">
        <p className="eyebrow mb-6" style={{ color: "rgba(253, 247, 235, 0.85)" }}>
          SMARTER REWARDS. BETTER TRAVEL.
        </p>
        <h1
          className="font-display max-w-[16ch] text-5xl leading-[1.02] md:text-7xl lg:text-[104px]"
          style={{ color: "#fdf7eb" }}
        >
          You have the points. <br />
          <em className="italic" style={{ color: "#f0d5b3" }}>
            Let&rsquo;s put them to good use.
          </em>
        </h1>
        <p
          className="mt-8 max-w-lg text-base leading-relaxed md:text-lg"
          style={{ color: "rgba(253, 247, 235, 0.85)" }}
        >
          I&rsquo;ll help you get 2-10x more value from your credit card points, so you can have
          more trips worth remembering.
        </p>
        <details className="group mt-5 max-w-lg">
          <summary
            className="cursor-pointer list-none text-sm underline underline-offset-4 transition-opacity hover:opacity-70"
            style={{ color: "rgba(253, 247, 235, 0.8)" }}
          >

          </summary>
          <p
            className="mt-3 text-sm leading-relaxed"
            style={{ color: "rgba(253, 247, 235, 0.75)" }}
          >
            The same points can be worth very different amounts depending on how they&rsquo;re used.
            Cashback, gift cards and vouchers usually sit at the bottom of that range. Transferring
            to an airline programme and booking a suitable flight award &mdash; particularly in a
            premium cabin on a longer route &mdash; usually sits at the top. The work is finding
            which end of that range your points can realistically reach.
          </p>
        </details>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <a
            href={TRIP_PLAN_FORM_URL}
            onClick={() => track("trip_plan_cta_clicked", { source: "home_hero", price_usd: PRICES.tripPlan })}
            className="inline-block rounded-sm bg-[#fdf7eb] px-8 py-4 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
          >
            Get my Points Trip Plan — US$79
          </a>
          <a
            href="#how-it-works"
            className="text-sm transition-opacity hover:opacity-100"
            style={{ color: "rgba(253, 247, 235, 0.85)" }}
          >
            See how it works
          </a>
        </div>
        <p className="mt-3 text-[12px]" style={{ color: "rgba(253, 247, 235, 0.7)" }}>
          One-time payment · Delivered within 2 business days
        </p>
      </div>
    </section>
  );
}


/* ---------- Promise strip ---------- */

function Promise() {

  const steps = [
    {
      n: "01",
      title: "Tell me your trip",
      body: "Destination, dates and the points you already have.",
    },
    {
      n: "02",
      title: "I compare every option",
      body: "Cash, miles, transfer partners and airlines.",
    },
    {
      n: "03",
      title: "Book knowing it's the best choice",
      body: "No second guessing. No wasted points.",
    },
  ];

  return (
    <section id="how-it-works" className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-14 md:px-12 md:py-20">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4 text-clay">Your strategy in three steps</p>
          <h2 className="font-display text-3xl leading-[1.1] text-ink md:text-5xl md:leading-[1.05]">
            Know the smartest way to use your points.
          </h2>
        </div>

        <div className="mt-10 grid gap-px bg-border md:mt-14 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="bg-background p-6 md:p-8">
              <p className="font-display text-sm text-clay">{s.n}</p>
              <h3 className="mt-5 font-display text-[26px] leading-tight text-ink md:text-[30px]">
                {s.title}
              </h3>
              <p className="mt-3 text-[15px] leading-snug text-ink/70">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- About Samral ---------- */

function AboutSamral() {
  return (
    <section id="about" className="bg-sand">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-6 py-24 md:grid-cols-12 md:gap-16 md:px-12 md:py-36">
        {/* Travel collage */}
        <div className="md:col-span-6">
          <div className="relative mx-auto aspect-[5/4] w-full">
            {/* Photo 1 — hero */}
            <div className="polaroid absolute left-0 top-0 z-30 w-[60%] -rotate-2 p-2 md:p-3">
              <img
                src={travel1.url}
                alt="A travel moment"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </div>
            {/* Photo 2 */}
            <div className="polaroid absolute right-0 top-0 z-10 w-[42%] rotate-3 p-2 md:p-3">
              <img
                src={travel2.url}
                alt="A travel moment"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </div>
            {/* Photo 3 */}
            <div className="polaroid absolute bottom-0 left-[2%] z-10 w-[45%] -rotate-3 p-2 md:p-3">
              <img
                src={travel3.url}
                alt="A travel moment"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </div>
            {/* Photo 4 */}
            <div className="polaroid absolute bottom-[5%] right-0 z-20 w-[48%] rotate-2 p-2 md:p-3">
              <img
                src={travel4.url}
                alt="A travel moment"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Story */}
        <div className="md:col-span-6">
          <p className="eyebrow mb-6 text-clay">About Samral</p>
          <h2 className="font-display text-3xl text-ink md:text-5xl">
            The points you have are worth more than you think.
          </h2>

          <div className="mt-10 space-y-5 text-[15px] leading-relaxed text-ink/85">
            <p>
              Samral is built around one idea: the points you already have are probably worth more than you think. Most people collect rewards for years, then redeem them in the easiest and fastest way rather than the smartest.
            </p>
            <p>
              The real problem is not lack of points, it is lack of a clear strategy. My job is to help you understand your options, compare them honestly, and book the trip you&apos;ll actually remember.
            </p>
          </div>

          <Link
            to="/about"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-ink underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            Read my story &nbsp;&rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}


/* ---------- Full-bleed inspiration ---------- */

function Inspiration() {
  return (
    <section className="relative h-[70vh] min-h-[520px] w-full overflow-hidden">
      <img
        src={kyotoImage}
        alt="A lantern-lit street at dusk in Kyoto"
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(20,14,8,0.65) 0%, rgba(20,14,8,0.15) 60%, rgba(20,14,8,0) 100%)",
        }}
      />
      <div className="relative z-10 mx-auto flex h-full max-w-[1440px] items-center px-6 md:px-12">
        <div className="max-w-2xl">
          <p className="eyebrow mb-6" style={{ color: "rgba(253, 247, 235, 0.85)" }}>
            The idea
          </p>
          <p
            className="font-display text-3xl leading-[1.15] md:text-5xl"
            style={{ color: "#fdf7eb" }}
          >
            A good redemption isn’t about squeezing every last point.&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;
            <br />
            <br />
            <br />
            It’s about the trip you’ll actually remember.
          </p>
          <p className="mt-6 text-sm" style={{ color: "rgba(253, 247, 235, 0.75)" }}>
            <br />
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Business pathway ---------- */

function BusinessPathway() {
  return (
    <section className="border-y border-border bg-sand/40">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-20 md:grid-cols-12 md:items-center md:px-12 md:py-28">
        <div className="md:col-span-7">
          <p className="eyebrow mb-6 text-clay">Also for business owners</p>
          <h2 className="font-display text-3xl leading-tight text-ink md:text-5xl">
            Get more value from the money your business already spends.
          </h2>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
             Most companies scrutinise what they buy, but not so much on how they pay for it.

             Samral looks at cards, recurring expenses, supplier payments, foreign-currency spend and business travel to find better ways to pay, taking into account rewards, fees, FX, discounts and payment timing.


             More value from money your business already spends.
          </p>
          <div className="mt-8">
            <Link
              to="/business"
              className="inline-flex items-center justify-center rounded-sm bg-ink px-8 py-4 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
            >
              Explore the business service
            </Link>
          </div>
        </div>
        <ul className="md:col-span-4 md:col-start-9">
          {["Understand", "Identify", "Underwrite", "Implement", "Measure"].map((s, i) => (
            <li key={s} className="flex items-baseline gap-4 border-b border-ink/12 py-3">
              <span className="font-display text-lg text-ink/35">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[15px] text-ink/80">{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Services ---------- */

function Services() {
  return (
    <section id="services" className="bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-12 md:py-36">
        <div className="mb-16 flex flex-col justify-between gap-6 md:mb-24 md:flex-row md:items-end">
          <div>
            <p className="eyebrow mb-6 text-clay">What I offer</p>
            <h2 className="font-display max-w-2xl text-4xl text-ink md:text-6xl">
              Two ways to work together.
            </h2>
          </div>
          <p className="max-w-sm text-[15px] leading-relaxed text-muted-foreground">
            Every engagement is one-to-one and tailored
          </p>
        </div>

        <div className="grid gap-14 md:grid-cols-2 md:gap-10">
          <ServiceCard
            index="01"
            tag="For a specific trip"
            title="Points Trip Planning"
            price={formatUsd(PRICES.tripPlan)}
            image={svcAircraftAsset.url}
            imageAlt="Wide-body aircraft at the gate at golden hour"
            copy="You have a trip in mind. I compare the realistic options and give you a written recommendation for the smartest way to get there with the points you already have."
            bullets={[
              "The programme and routing I&rsquo;d book through",
              "Points required, estimated taxes and what to transfer",
              "Whether transferring or paying cash is smarter",
              "A clear sequence for what to check and book",
            ]}
            best={SHOW_DELIVERY_TIME ? `One round-trip, up to 2 travellers. ${DELIVERY_COPY}` : "One round-trip, up to 2 travellers."}
            ctaHref={TRIP_PLAN_FORM_URL}
            ctaLabel="Get my Points Trip Plan — US$79"
            ctaSupport="One-time payment · Delivered within 2 business days"
          />
          <ServiceCard
            index="02"
            tag="For your overall setup"
            title="Personal Card Strategy"
            price={formatUsd(PRICES.cardStrategy)}
            image={svcNotebookAsset.url}
            imageAlt="Handwritten planning notes in a notebook"
            copy="No trip in mind yet, just a sense you could be doing this better. A one-to-one call and a written strategy for your cards, spending and points."
            bullets={[
              "A review of your current cards and balances",
              "Which currencies to earn, and which to ignore",
              "What to keep, change or reconsider, and why",
              "A written Samral Card Strategy to refer back to",
            ]}
            best="Personal cards only. Payment and scheduling in one step."
            ctaHref="/points-strategy"
            ctaLabel="Book my Card Strategy"
          />
        </div>

        <div className="mt-16 flex flex-col items-start gap-6 border-t border-border pt-10 md:flex-row md:items-center md:justify-between">
          <p className="max-w-lg text-[15px] italic text-muted-foreground">
            Booking Support is available as an optional add-on from {formatUsd(PRICES.bookingSupportFrom)} if
            you&rsquo;d prefer help executing your Trip Plan. {CURRENCY_NOTE}
          </p>
          <a
            href={TRIP_PLAN_FORM_URL}
            onClick={() => track("trip_plan_cta_clicked", { source: "home_services_footer", price_usd: PRICES.tripPlan })}
            className="inline-block rounded-sm bg-ink px-8 py-4 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
          >
            Get my Points Trip Plan — US$79
          </a>
          <p className="text-[12px] text-muted-foreground">
            One-time payment · Delivered within 2 business days
          </p>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  index,
  tag,
  title,
  price,
  image,
  imageAlt,
  copy,
  bullets,
  best,
  ctaHref,
  ctaLabel,
  ctaSupport,
}: {
  index: string;
  tag: string;
  title: string;
  price: string;
  image: string;
  imageAlt: string;
  copy: string;
  bullets: string[];
  best: string;
  ctaHref: string;
  ctaLabel: string;
  ctaSupport?: string;
}) {
  return (
    <article className="group flex flex-col">
      <div className="relative mb-8 overflow-hidden">
        <img
          src={image}
          alt={imageAlt}
          className="h-[320px] w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.02] md:h-[380px]"
          loading="lazy"
        />
        <span className="absolute left-5 top-5 bg-background/90 px-3 py-1 text-[11px] font-medium tracking-widest text-ink">
          {tag.toUpperCase()}
        </span>
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="flex items-baseline gap-4">
          <span className="font-display text-2xl text-clay">{index}</span>
          <h3 className="font-display text-3xl text-ink md:text-4xl">{title}</h3>
        </div>
        <span className="font-display text-3xl text-ink md:text-4xl">{price}</span>
      </div>
      <p className="mt-5 text-[17px] leading-relaxed text-ink/85">{copy}</p>
      <ul className="mt-6 space-y-3">
        {bullets.map((b) => (
          <li
            key={b}
            className="flex gap-3 text-[15px] text-ink/80"
            dangerouslySetInnerHTML={{
              __html: `<span class="text-clay">&mdash;</span><span>${b}</span>`,
            }}
          />
        ))}
      </ul>
      <p className="mt-8 border-t border-border pt-5 text-[13px] italic text-muted-foreground">
        {best}
      </p>
      <div className="mt-6">
        <a
          href={ctaHref}
          className="inline-block rounded-sm bg-ink px-6 py-3 text-sm font-medium text-background transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
        >
          {ctaLabel}{!ctaSupport && <>&nbsp;&rarr;</>}
        </a>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {ctaSupport ?? CURRENCY_NOTE}
        </p>
      </div>
    </article>
  );
}

/* ---------- Contact ---------- */


function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden bg-ink text-background">
      <img
        src={cabinImage}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-25"
        loading="lazy"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,14,8,0.6) 0%, rgba(20,14,8,0.85) 100%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-[1440px] px-6 py-28 md:px-12 md:py-44">
        <div className="max-w-3xl">
          <p className="eyebrow mb-6" style={{ color: "rgba(253, 247, 235, 0.7)" }}>
            Get started
          </p>
          <h2
            className="font-display text-5xl leading-[1.02] md:text-7xl lg:text-[96px]"
            style={{ color: "#fdf7eb" }}
          >
            Ready to use your points <br />
            <em className="italic" style={{ color: "#f0d5b3" }}>
              properly?
            </em>
          </h2>
          <div
            className="mt-8 max-w-xl text-lg leading-relaxed"
            style={{ color: "rgba(253, 247, 235, 0.8)" }}
          >
            Start with the free Miles Calculator to see what your points can reach. When you&rsquo;re
            ready, get a written plan for one specific trip, or a strategy for your whole setup.
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-4">
            <a
              href={TRIP_PLAN_FORM_URL}
              onClick={() => track("trip_plan_cta_clicked", { source: "home_final", price_usd: PRICES.tripPlan })}
              className="rounded-sm bg-[#fdf7eb] px-8 py-4 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
            >
              Get my Points Trip Plan — US$79
            </a>
            <a
              href="/points-strategy"
              className="rounded-sm border px-8 py-4 text-sm font-medium transition-colors hover:bg-[#fdf7eb] hover:text-ink"
              style={{ borderColor: "rgba(253, 247, 235, 0.6)", color: "#fdf7eb" }}
            >
              Book my Card Strategy &mdash; {formatUsd(PRICES.cardStrategy)}
            </a>
          </div>
          <p className="mt-5 text-[12px]" style={{ color: "rgba(253, 247, 235, 0.55)" }}>
            One-time payment · Delivered within 2 business days. {CURRENCY_NOTE}{" "}
            <Link to="/miles-calculator" className="underline underline-offset-4">
              Not sure yet? Try the free Miles Calculator.
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

function Footer() {
  return <SiteFooter />;
}

/* ---------- Founder trust signal ---------- */

function FounderTrustSignal() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-10 md:px-12 md:py-14">
        <p className="max-w-2xl text-[15px] leading-relaxed text-ink/80">
          Every Samral engagement is personally reviewed by{" "}
          <Link
            to="/about"
            className="font-medium text-ink underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            Samuel
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

/* ---------- Client results ---------- */

interface ClientResult {
  id: string;
  client: {
    name: string;
    title: string;
    org: string;
  };
  logo: { url: string };
  logoAlt: string;
  headline: string;
  body: string;
  outcomeLabel: string;
  outcomeLines: string[];
  metrics?: { label: string; value: string }[];
}

const clientResults: ClientResult[] = [
  {
    id: "synapse-seoul",
    client: {
      name: "Thomas Mathew",
      title: "Executive Director",
      org: "Synapse Physiotherapy",
    },
    logo: synapseLogo,
    logoAlt: "Synapse Physiotherapy",
    headline: "From unused points to two Business Class return tickets to Seoul.",
    body:
      "Thomas had accumulated a substantial points balance without a clear strategy for using it. Samral reviewed his existing points and credit cards, identified the best way to put them to work, and built a redemption strategy around a trip he actually wanted to take.",
    outcomeLabel: "The outcome",
    outcomeLines: ["2× RETURN BUSINESS CLASS TICKETS", "Kuala Lumpur ↔ Seoul, South Korea"],
  },
  {
    id: "cpf-taiwan",
    client: {
      name: "Dr Wasu Kasimani",
      title: "Senior General Manager",
      org: "Chau Yang Farm (Owned by Charoen Pokphand Foods)",
    },
    logo: cpfLogo,
    logoAlt: "Charoen Pokphand Foods",
    headline: "Two return flights to Taiwan — without using any points.",
    body:
      "Samral reviewed Dr. Wasu's existing credit-card benefits and identified an unused travel benefit that could be put toward his upcoming trip.",
    outcomeLabel: "The outcome",
    outcomeLines: ["2× RETURN FLIGHTS TO TAIWAN", "0 POINTS REQUIRED"],
  },
];

function ClientResults() {
  return (
    <section id="client-results" className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-28">
        <div className="max-w-3xl">
          <p className="eyebrow mb-5 text-clay">Client results</p>
          <h2 className="font-display text-3xl leading-[1.1] text-ink md:text-5xl md:leading-[1.05]">
            Points are only valuable when you know what to do with them.
          </h2>
        </div>

        <div className="mt-12 grid gap-8 md:mt-16 md:grid-cols-2 md:gap-10">
          {clientResults.map((result) => (
            <article
              key={result.id}
              className="flex flex-col border border-border bg-sand p-8 md:p-10"
            >
              {/* Top: credibility */}
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-[15px] text-ink">{result.client.name}</p>
                  <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
                    {result.client.title}
                  </p>
                  <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
                    {result.client.org}
                  </p>
                </div>
                <img
                  src={result.logo.url}
                  alt={result.logoAlt}
                  className="h-10 w-auto max-w-[120px] object-contain opacity-80"
                  loading="lazy"
                />
              </div>

              {/* Problem → judgment → outcome narrative */}
              <div className="mt-10">
                <h3 className="font-display text-[26px] leading-[1.15] text-ink md:text-[32px]">
                  {result.headline}
                </h3>
                <p className="mt-5 text-[16px] leading-relaxed text-ink/80">{result.body}</p>
              </div>

              {/* Quantified outcome */}
              <div className="mt-auto pt-12">
                <p className="text-[11px] font-medium tracking-[0.15em] text-clay">
                  {result.outcomeLabel.toUpperCase()}
                </p>
                <div className="mt-4 space-y-1">
                  {result.outcomeLines.map((line, i) => (
                    <p
                      key={line}
                      className={`font-display leading-[1.05] text-ink ${
                        i === 0
                          ? "text-[32px] md:text-[40px]"
                          : "text-[18px] md:text-[22px] text-ink/75"
                      }`}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              {/* Reserved for future metrics — do not render until supplied */}
              {result.metrics && result.metrics.length > 0 && (
                <dl className="mt-10 grid grid-cols-2 gap-4 border-t border-border pt-8 md:grid-cols-3">
                  {result.metrics.map((m) => (
                    <div key={m.label}>
                      <dt className="text-[11px] tracking-widest text-clay">{m.label}</dt>
                      <dd className="mt-1 font-display text-[18px] text-ink">{m.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


