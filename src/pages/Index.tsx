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
import notebookImage from "@/assets/notebook.jpg";
import kyotoImage from "@/assets/kyoto.jpg";
import cabinImage from "@/assets/cabin.jpg";
import maldivesImage from "@/assets/maldives.jpg";
import italyImage from "@/assets/italy.jpg";
import founderImage from "@/assets/samral-founder-v2.png.asset.json";
import alpsAsset from "@/assets/swiss-alps.jpg.asset.json";
const alpsImage = alpsAsset.url;

export default function Home() {
  useEffect(() => {
    document.title = "Samral | Smarter Rewards, Better Travel";
    const desc =
      "Samral helps people make better use of credit card rewards through personalised trip planning and points strategy research.";
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
      <Founder />
      <ClientExperiences />
      <Services />
      <CaseStudy />
      <AboutSamral />
      <Inspiration />
      <Destinations />
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
            How can points be worth that much more?
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
            href="/trip-planning"
            className="inline-block rounded-sm bg-[#fdf7eb] px-8 py-4 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
          >
            Plan my trip &nbsp;&rarr;
          </a>
          <a
            href="#how-it-works"
            className="text-sm transition-opacity hover:opacity-100"
            style={{ color: "rgba(253, 247, 235, 0.85)" }}
          >
            See how it works
          </a>
        </div>
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
              Samral is built around one idea: the points you already have are probably worth more than you think. Most people collect rewards for years, then redeem them in the easiest way rather than the smartest.
            </p>
            <p>
              The real problem is not lack of points; it is lack of a clear strategy. My job is to help you understand your options, compare them honestly, and book the trip you&apos;ll actually remember.
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
            Every engagement is one-to-one and tailored. No subscriptions, no dashboards, no software.
          </p>
        </div>

        <div className="grid gap-14 md:grid-cols-2 md:gap-10">
          <ServiceCard
            index="01"
            tag="Flagship"
            title="Points Trip Planning"
            image={cabinImage}
            imageAlt="Business class cabin at dusk"
            copy="You have a trip in mind. I find the smartest way to get you there using the points you already have."
            bullets={[
              "The best programme to book through",
              "Roughly what it&rsquo;ll cost in points and taxes",
              "Whether transferring &mdash; or paying cash &mdash; is smarter",
              "Exactly how to book it",
            ]}
            best="For a specific trip you want to get right."
            ctaHref="/trip-planning"
            ctaLabel="Plan my trip"
          />
          <ServiceCard
            index="02"
            tag="Longer term"
            title="Cards Strategy"
            image={notebookImage}
            imageAlt="Handwritten notes in a leather notebook"
            copy="No trip in mind yet. Just a sense you could be doing this better. We build the plan together."
            bullets={[
              "A review of your current cards and balances",
              "Which currencies to earn &mdash; and which to ignore",
              "A clear 12-month roadmap toward the trips you want",
              "An honest look at what to keep and what to close",
            ]}
            best="For anyone building toward something in the next year or two."
            ctaHref="/points-strategy"
            ctaLabel="Explore Cards Strategy"
          />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-l-2 border-clay/50 bg-sand/60 px-6 py-6 md:mt-14 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="max-w-xl">
            <p className="font-display text-[22px] leading-tight text-ink">Run a business?</p>
            <p className="mt-2 text-[15px] leading-relaxed text-ink/75">
              If you also put business expenditure through cards, I can review whether your current
              setup is making the most of that spend too.
            </p>
          </div>
          <a
            href="/points-strategy"
            className="shrink-0 text-sm font-medium text-ink underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            Ask about business cards &nbsp;&rarr;
          </a>
        </div>



        <div className="mt-16 flex flex-col items-start gap-6 border-t border-border pt-10 md:flex-row md:items-center md:justify-between">
          <p className="max-w-lg text-[15px] italic text-muted-foreground">
            Booking Support is available as an optional add-on if you&rsquo;d prefer I handle the
            booking on your behalf.
          </p>
          <a
            href="/trip-planning"
            className="inline-block rounded-sm bg-ink px-8 py-4 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
          >
            Plan my trip &nbsp;&rarr;
          </a>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  index,
  tag,
  title,
  image,
  imageAlt,
  copy,
  bullets,
  best,
  ctaHref,
  ctaLabel,
}: {
  index: string;
  tag: string;
  title: string;
  image: string;
  imageAlt: string;
  copy: string;
  bullets: string[];
  best: string;
  ctaHref: string;
  ctaLabel: string;
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
      <div className="flex items-baseline gap-4">
        <span className="font-display text-2xl text-clay">{index}</span>
        <h3 className="font-display text-3xl text-ink md:text-4xl">{title}</h3>
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
          className="inline-block rounded-sm border border-ink px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-background focus:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
        >
          {ctaLabel} &nbsp;&rarr;
        </a>
      </div>
    </article>
  );
}

/* ---------- Destinations ---------- */

function Destinations() {
  const dests = [
    {
      img: maldivesImage,
      name: "The Maldives",
      note: "A long-haul trip where the right combination of bank points, airline miles and cash can make a meaningful difference.",
    },
    {
      img: italyImage,
      name: "The Italian coast",
      note: "Long summer evenings on the Amalfi coast, booked with a mix of two flexible currencies.",
    },
    {
      img: kyotoImage,
      name: "Kyoto in autumn",
      note: "Traditional ryokan stays and premium-cabin ANA seats — some of the best value in miles.",
    },
    {
      img: alpsImage,
      name: "The Swiss Alps",
      note: "Slow train journeys through alpine valleys, paired with a mountainside stay booked on hotel points.",
    },
  ];

  return (
    <section id="destinations" className="bg-sand">
      <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-12 md:py-36">
        <div className="mb-14 max-w-2xl md:mb-20">
          <p className="eyebrow mb-6 text-clay">Where points can take you</p>
          <h2 className="font-display text-4xl text-ink md:text-6xl">
            Trips people didn&rsquo;t think were possible.
          </h2>
          <p className="mt-6 text-[16px] leading-relaxed text-muted-foreground">
            A few examples of what a well-planned redemption can look like. Yours will be different
            &mdash; and that&rsquo;s the point.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-2">
          {dests.map((d) => (
            <article key={d.name} className="flex flex-col">
              <img
                src={d.img}
                alt={d.name}
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
              <h3 className="mt-5 font-display text-2xl text-ink">{d.name}</h3>
              <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
                {d.note}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
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
            Get in touch
          </p>
          <h2
            className="font-display text-5xl leading-[1.02] md:text-7xl lg:text-[96px]"
            style={{ color: "#fdf7eb" }}
          >
            Tell me about the trip <br />
            <em className="italic" style={{ color: "#f0d5b3" }}>
              you&rsquo;d like to take.
            </em>
          </h2>
          <div
            className="mt-8 max-w-xl text-lg leading-relaxed whitespace-pre-line"
            style={{ color: "rgba(253, 247, 235, 0.8)" }}
          >
            Tell me where you'd like to go, roughly when you're hoping to travel, and which points or rewards you already have.{"\n\n\n"}
            I'll personally review your situation and let you know whether there's a worthwhile points strategy to explore. That initial assessment is complimentary; the detailed personalised strategy is the full Points Trip Planning engagement.
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-6">
            <a
              href="/trip-planning"
              className="rounded-sm bg-[#fdf7eb] px-8 py-4 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
            >
              Get my complimentary assessment &nbsp;&rarr;
            </a>
            {/* email link removed as requested */}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

function Footer() {
  return <SiteFooter />;
}

/* ---------- Founder ---------- */

function Founder() {
  return (
    <section id="founder" className="border-b border-border bg-background">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-6 py-16 md:grid-cols-12 md:gap-16 md:px-12 md:py-24">
        <div className="md:col-span-4">
          <div className="polaroid w-[70%] -rotate-1 p-2 md:w-[85%] md:p-3">
            <img
              src={founderImage.url}
              alt="Samuel Thomas, founder of Samral"
              className="aspect-[4/5] w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
        <div className="md:col-span-8">
          <p className="eyebrow mb-5 text-clay">Who you&rsquo;re working with</p>
          <h2 className="font-display text-3xl leading-[1.1] text-ink md:text-[44px]">
            Samuel Thomas
          </h2>
          <p className="mt-2 text-[14px] text-muted-foreground">Founder, Samral</p>
          <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-ink/85">
            I started Samral after seeing how often valuable points were accumulated without a clear
            strategy for actually using them. I personally review every engagement and help clients
            work through the options &mdash; from the points they already have to the trip they
            actually want to take.
          </p>
          <Link
            to="/about"
            className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-ink underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            More about Samuel &nbsp;&rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- Client experiences ---------- */

function ClientExperiences() {
  const clients = [
    {
      name: "[Client name to be confirmed]",
      title: "[Position to be confirmed]",
      org: "TalentCorp Malaysia",
      quote: "[Testimonial pending client approval]",
    },
    {
      name: "[Client name to be confirmed]",
      title: "[Position to be confirmed]",
      org: "Charoen Pokphand Foods",
      quote: "[Testimonial pending client approval]",
    },
    {
      name: "[Client name to be confirmed]",
      title: "[Position to be confirmed]",
      org: "Synapse Physiotherapy",
      quote: "[Testimonial pending client approval]",
    },
  ];

  return (
    <section id="client-experiences" className="bg-sand">
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-28">
        <div className="max-w-3xl">
          <p className="eyebrow mb-5 text-clay">Client experiences</p>
          <h2 className="font-display text-3xl leading-[1.1] text-ink md:text-5xl md:leading-[1.05]">
            Real people. Better use of the points they already had.
          </h2>
        </div>

        <div className="mt-12 grid gap-8 md:mt-16 md:grid-cols-3">
          {clients.map((c) => (
            <figure
              key={c.org}
              className="flex flex-col border border-border bg-background p-6 md:p-8"
            >
              <blockquote className="font-display text-[22px] leading-snug text-ink md:text-[24px]">
                &ldquo;{c.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-auto pt-8">
                <div className="flex items-center gap-4">
                  <div
                    aria-hidden
                    className="h-12 w-12 shrink-0 rounded-full border border-border bg-sand"
                  />
                  <div>
                    <p className="text-[15px] text-ink">{c.name}</p>
                    <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
                      {c.title}, {c.org}
                    </p>
                    <p className="mt-1 text-[11px] tracking-widest text-clay">
                      PERSONAL SAMRAL CLIENT
                    </p>
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-10 max-w-3xl text-[12px] leading-relaxed text-muted-foreground">
          Professional affiliations are shown for identification only. Samral services were provided
          to these clients in their personal capacity and do not imply endorsement by the
          organisations listed.
        </p>
      </div>
    </section>
  );
}

/* ---------- Case study ---------- */

function CaseStudy() {
  const blocks = [
    {
      n: "01",
      title: "The starting point",
      items: [
        "Points and rewards balances:",
        "Existing cards and programmes:",
        "Travel objective:",
      ],
    },
    {
      n: "02",
      title: "What Samral reviewed",
      items: [
        "Relevant airline programmes:",
        "Transfer options:",
        "Cash fares and points requirements:",
        "Taxes, fees and alternative routes:",
      ],
    },
    {
      n: "03",
      title: "The recommendation",
      items: [
        "Recommended strategy:",
        "Why it was chosen:",
      ],
    },
    {
      n: "04",
      title: "The outcome",
      items: [
        "What was booked or changed:",
        "Points used:",
        "Cash and taxes paid:",
        "Comparative value, where it can be substantiated:",
      ],
    },
  ];

  return (
    <section id="case-study" className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-28">
        <div className="max-w-2xl">
          <p className="eyebrow mb-5 text-clay">A Samral strategy</p>
          <h2 className="font-display text-3xl leading-[1.1] text-ink md:text-5xl md:leading-[1.05]">
            See what the process actually looks like.
          </h2>
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

        <div className="mt-10">
          <a
            href="/trip-planning"
            className="inline-block rounded-sm border border-ink px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-background"
          >
            Plan my trip &nbsp;&rarr;
          </a>
        </div>
      </div>
    </section>
  );
}

