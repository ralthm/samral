import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import samuelImage from "@/assets/samral-founder-v2.png.asset.json";
import cabinImage from "@/assets/cabin.jpg";

export default function About() {
  useEffect(() => {
    document.title = "About Samral | Personal Points & Miles Advisory";
    const desc =
      "Meet Samuel, founder of Samral — an independent points and miles advisory built to help you get more from the rewards you already have.";
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
      <Intro />
      <MyStory />
      <HowIDiscovered />
      <WhySamral />
      <MyApproach />
      <WhatToExpect />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ---------- Nav ---------- */

function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    { label: "Home", to: "/" },
    { label: "Points Trip Planning", to: "/trip-planning" },
    { label: "Points Strategy", to: "/points-strategy" },
    { label: "About", to: "/about" },
  ];

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-5 sm:px-6 md:px-12 md:py-8">
        <Link
          to="/"
          aria-label="Samral home"
          className="font-display text-2xl leading-none text-ink md:text-[26px]"
        >
          Samral
        </Link>
        <nav className="hidden items-center gap-9 text-[13px] text-ink/80 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`transition-opacity hover:opacity-70 ${l.to === "/about" ? "text-ink" : ""}`}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/about" className="text-ink transition-opacity hover:opacity-70">
            About
          </Link>
        </nav>
        <Link
          to="/trip-planning"
          className="hidden rounded-sm border border-ink/70 px-5 py-2 text-[13px] text-ink transition-colors hover:bg-ink hover:text-background md:inline-block"
        >
          Plan my trip
        </Link>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center text-ink md:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 flex flex-col bg-ink text-background md:hidden">
          <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-5 sm:px-6">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="font-display text-2xl leading-none text-background"
            >
              Samral
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-2 px-5 pt-6 sm:px-6">
            {[{ label: "Home", to: "/" }, ...links].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="font-display border-b border-background/15 py-5 text-3xl"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/about"
              onClick={() => setOpen(false)}
              className="font-display border-b border-background/15 py-5 text-3xl"
            >
              About
            </Link>
            <Link
              to="/trip-planning"
              onClick={() => setOpen(false)}
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-sm bg-[#fdf7eb] px-6 py-3 text-sm font-medium text-ink"
            >
              Plan my trip &nbsp;&rarr;
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

/* ---------- Intro ---------- */

function Intro() {
  return (
    <section className="bg-sand">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-16 md:grid-cols-12 md:gap-16 md:px-12 md:py-28">
        <div className="md:col-span-5">
          <div className="polaroid inline-block p-3 md:p-4">
            <img
              src={samuelImage.url}
              alt="Samuel, founder of Samral"
              className="aspect-[4/5] w-48 object-cover md:w-64"
              loading="eager"
            />
          </div>
        </div>
        <div className="flex flex-col justify-center md:col-span-7">
          <p className="eyebrow mb-5 text-clay">About Samral</p>
          <h1 className="font-display text-4xl leading-[1.05] text-ink md:text-6xl lg:text-7xl">
            A personal advisory for people who want more from their points.
          </h1>
          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-ink/75">
            Samral is built around one idea: the points you already have are probably worth more than you think. My job is to help you understand your options, compare them honestly, and book the trip you&apos;ll actually remember.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- My Story ---------- */

function MyStory() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-32">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow mb-5 text-clay">My story</p>
          <h2 className="font-display text-3xl text-ink md:text-5xl">
            Finance background, accidental points optimiser.
          </h2>
          <div className="mt-8 space-y-5 text-[16px] leading-relaxed text-ink/85">
            <p>
              My background is in finance, which means I am used to reading fine print, comparing options and thinking in percentages. But for years I treated credit card points the way most people do: as a side benefit I would deal with later.
            </p>
            <p>
              Then I looked at what I had accumulated in just over a year and realised it was already enough to make travel possible to places like Bangkok and Ho Chi Minh City. That caught me off guard. If this much value could build up without me noticing, what was I missing?
            </p>
            <p>
              I started reading the rules behind transfer partners, award charts and airline alliances. The more I learned, the clearer it became: most people collect rewards for years, then redeem them in the easiest way rather than the smartest.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- How I Discovered Points ---------- */

function HowIDiscovered() {
  return (
    <section className="border-y border-border bg-sand">
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-32">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow mb-5 text-clay">How I discovered points</p>
          <h2 className="font-display text-3xl text-ink md:text-5xl">
            The real value is hidden in the rules, not the marketing.
          </h2>
          <div className="mt-8 space-y-5 text-[16px] leading-relaxed text-ink/85">
            <p>
              Credit card companies and airlines do not make redemption easy. They want you to spend points on gift cards, cashback or portal bookings because those are usually the worst value. The best redemptions — business class seats, premium hotel stays, carefully timed transfers — take research.
            </p>
            <p>
              I spent months learning how different programmes work, which partners talk to each other, and where the hidden opportunities are. The same number of points can be worth twice as much, or ten times as much, depending on how you use them.
            </p>
            <p>
              That realisation became the seed of Samral: a service that does this research for you, so you do not have to spend your evenings comparing award charts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Why I Started Samral ---------- */

function WhySamral() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-32">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow mb-5 text-clay">Why I started Samral</p>
          <h2 className="font-display text-3xl text-ink md:text-5xl">
            To close the gap between what people have and what they could book.
          </h2>
          <div className="mt-8 space-y-5 text-[16px] leading-relaxed text-ink/85">
            <p>
              I started Samral because I kept meeting people who had points sitting in accounts they barely checked. They knew the rewards were valuable, but they did not know where to start, which programmes to trust, or whether they were about to waste a great opportunity.
            </p>
            <p>
              The real problem is not lack of points. It is lack of a clear strategy. Most advice online is either too generic, too US-centric, or written to sell a particular card. I wanted to offer something different: independent, one-to-one guidance that treats your points as part of your overall travel plan.
            </p>
            <p>
              Samral is not a booking engine and it is not a credit card affiliate. It is a research partner that helps you make informed decisions and get more from the points you already have.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- My Approach ---------- */

function MyApproach() {
  const items = [
    {
      title: "Independent",
      body: "I do not represent any bank, airline or loyalty programme. My recommendations are based on value, not commissions.",
    },
    {
      title: "Honest",
      body: "Sometimes the best option is to pay cash. Sometimes the best option is to wait. I will tell you when points are not the right tool.",
    },
    {
      title: "Personal",
      body: "Every plan is built from your actual balances, travel goals and preferences. No templates, no automation.",
    },
    {
      title: "Clear",
      body: "You get a written plan with specific programmes, transfer partners, rough costs and exact booking steps.",
    },
  ];

  return (
    <section className="border-y border-border bg-sand">
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-32">
        <div className="mb-12 max-w-2xl md:mb-16">
          <p className="eyebrow mb-5 text-clay">My approach</p>
          <h2 className="font-display text-3xl text-ink md:text-5xl">
            Four principles that guide every plan.
          </h2>
        </div>
        <div className="grid gap-px bg-border md:grid-cols-2">
          {items.map((item) => (
            <div key={item.title} className="bg-sand p-6 md:p-10">
              <h3 className="font-display text-2xl text-ink md:text-3xl">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/75">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- What You Can Expect ---------- */

function WhatToExpect() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-32">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow mb-5 text-clay">What you can expect</p>
          <h2 className="font-display text-3xl text-ink md:text-5xl">
            A direct relationship, not a dashboard.
          </h2>
          <div className="mt-8 space-y-5 text-[16px] leading-relaxed text-ink/85">
            <p>
              When you work with Samral, you deal with me directly. I read every enquiry personally, review your balances and goals, and put together a complimentary Points Travel Plan before any paid work begins.
            </p>
            <p>
              There are no subscriptions, no software to log into, and no upsells. You get a clear written strategy and the option to add booking support if you would prefer I handle the reservation on your behalf.
            </p>
            <p>
              I reply within two working days, and I only take on projects where I am confident I can add real value. If I do not think I can help, I will say so upfront.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */

function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-ink text-background">
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
            Start your plan
          </p>
          <h2
            className="font-display text-4xl leading-[1.05] md:text-6xl lg:text-7xl"
            style={{ color: "#fdf7eb" }}
          >
            Ready to see what your points can do?
          </h2>
          <p
            className="mt-6 max-w-xl text-[17px] leading-relaxed"
            style={{ color: "rgba(253, 247, 235, 0.8)" }}
          >
            Tell me where you would like to go, roughly when you are hoping to travel, and which points or rewards you already have. I will personally review your submission and put together a complimentary Points Travel Plan.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              to="/trip-planning"
              className="rounded-sm bg-[#fdf7eb] px-8 py-4 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
            >
              Start my complimentary plan &nbsp;&rarr;
            </Link>
            <Link
              to="/"
              className="text-sm transition-opacity hover:opacity-100"
              style={{ color: "rgba(253, 247, 235, 0.85)" }}
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

function Footer() {
  return (
    <footer className="bg-ink text-background/70">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-14 sm:px-6 md:px-12">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link to="/" className="font-display text-3xl text-background">
              Samral
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-background/60">
              Independent points &amp; miles advisory
            </p>
          </div>
          <div className="md:col-span-4">
            <p className="eyebrow mb-4 text-background/50">Services</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/trip-planning" className="hover:text-background">
                  Points Trip Planning
                </Link>
              </li>
              <li>
                <Link to="/points-strategy" className="hover:text-background">
                  Points Strategy
                </Link>
              </li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <p className="eyebrow mb-4 text-background/50">Contact</p>
            <a
              href="mailto:samuel@samral.com"
              className="text-sm hover:text-background"
            >
              samuel@samral.com
            </a>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-background/10 pt-6 text-xs text-background/50 md:flex-row md:items-center md:justify-between">
          <p>
            &copy; {new Date().getFullYear()} Samral &mdash; Independent points &amp; miles advisory
          </p>
          <p className="italic">{"\n"}</p>
        </div>
      </div>
    </footer>
  );
}
