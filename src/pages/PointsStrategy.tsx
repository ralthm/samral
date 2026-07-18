import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import cabinImage from "@/assets/cabin.jpg";

// TODO: Replace with real booking URL when provided.
const DISCOVERY_CALL_URL = "#discovery-call";
const isExternal = /^https?:\/\//i.test(DISCOVERY_CALL_URL);

function DiscoveryCTA({
  variant = "light",
  className = "",
  children = "Book a free call",
}: {
  variant?: "light" | "dark";
  className?: string;
  children?: React.ReactNode;
}) {
  const base =
    "inline-block rounded-sm px-8 py-4 text-sm font-medium transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2";
  const styles =
    variant === "dark"
      ? "bg-ink text-background hover:bg-ink/90"
      : "bg-[#fdf7eb] text-ink";
  return (
    <a
      href={DISCOVERY_CALL_URL}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`${base} ${styles} ${className}`}
    >
      {children} &nbsp;&rarr;
    </a>
  );
}

export default function PointsStrategy() {
  useEffect(() => {
    document.title = "Points Strategy for Business Owners | Samral";
    const desc =
      "Personalised credit card and rewards strategy for Malaysian business owners and high spenders. Start with a free discovery call.";
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
      <WhoFor />
      <HowItWorks />
      <WhatYouGet />
      <FAQ />
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
          <Link to="/" className="transition-opacity hover:opacity-70">Home</Link>
          <Link to="/trip-planning" className="transition-opacity hover:opacity-70">
            Points Trip Planning
          </Link>
          <Link to="/points-strategy" className="text-ink transition-opacity hover:opacity-70">
            Points Strategy
          </Link>
          <Link to="/about" className="transition-opacity hover:opacity-70">
            About
          </Link>
        </nav>
        <a
          href={DISCOVERY_CALL_URL}
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="hidden rounded-sm border border-ink/70 px-5 py-2 text-[13px] text-ink transition-colors hover:bg-ink hover:text-background md:inline-block"
        >
          Book a call
        </a>
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
        <div className="fixed inset-0 z-40 flex flex-col bg-background text-ink md:hidden">
          <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-5 sm:px-6">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="font-display text-2xl leading-none text-ink"
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
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="font-display border-b border-border py-5 text-3xl text-ink"
              >
                {l.label}
              </Link>
            ))}
            <a
              href={DISCOVERY_CALL_URL}
              {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              onClick={() => setOpen(false)}
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-sm bg-ink px-6 py-3 text-sm font-medium text-background"
            >
              Book a free call &nbsp;&rarr;
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

/* ---------- Intro ---------- */

function Intro() {
  return (
    <section className="relative overflow-hidden bg-sand">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 py-20 md:grid-cols-12 md:gap-16 md:px-12 md:py-28">
        <div className="md:col-span-7">
          <h1 className="font-display text-4xl leading-[1.05] text-ink md:text-6xl lg:text-[72px]">
            Points Strategy
          </h1>
          <div className="mt-8 max-w-2xl space-y-5 text-[16px] leading-relaxed text-ink/85">
            <p>
              I review your credit cards, spending and rewards, then tell you whether there's a better way to set things up.
            </p>
            <p>
              Most people don't need another card. They need someone to look at what they already have and point out what's actually worth changing. That's what this is.
            </p>
          </div>
          <div className="mt-10">
            <DiscoveryCTA variant="dark" />
          </div>
          <p className="mt-4 text-[13px] italic text-muted-foreground">
            15–20 minutes. No obligation. No payment required.
          </p>
        </div>
        <div className="md:col-span-5">
          <div className="relative">
            <img
              src={cabinImage}
              alt="A quiet lounge corner with a notebook and coffee"
              className="aspect-[4/5] w-full object-cover"
              loading="eager"
            />
            <div className="absolute -bottom-4 -right-4 hidden h-32 w-32 border border-clay md:block" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Who it's for ---------- */

function WhoFor() {
  const items = [
    "You put meaningful monthly spending on credit cards.",
    "You pay your balances in full each month.",
    "You have points scattered across several programmes.",
    "You travel internationally, or want to.",
    "You don't have the time or interest to research card rules yourself.",
  ];

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-28">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <h2 className="font-display text-3xl text-ink md:text-5xl">
              Who this is for
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="max-w-2xl text-[16px] leading-relaxed text-ink/85">
              This is most useful for business owners, company directors and high-income professionals who:
            </p>
            <ul className="mt-8 space-y-4">
              {items.map((i) => (
                <li key={i} className="flex gap-3 text-[15px] text-ink/85">
                  <span className="text-clay">&mdash;</span>
                  <span>{i}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 max-w-2xl text-[14px] italic text-muted-foreground">
              There is no fixed spending minimum for the free call. The call itself is partly there to figure out whether a full review would be worthwhile for you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- How it works ---------- */

function HowItWorks() {
  return (
    <section className="bg-sand">
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-28">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <h2 className="font-display text-3xl text-ink md:text-5xl">
              How it works
            </h2>
          </div>
          <div className="md:col-span-7 max-w-2xl space-y-5 text-[16px] leading-relaxed text-ink/85">
            <p>
              We start with a short discovery call. You tell me about your current cards, spending patterns, rewards balances and what you want your points to actually do.
            </p>
            <p>
              After the call, I look at whether there's a genuine opportunity to improve things. If I think the value is worth the fee, I'll explain the scope and cost before you decide. If not, I'll tell you.
            </p>
            <p>
              Only if you choose to proceed do I start the paid review. No pressure, no surprise charges.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- What you get ---------- */

function WhatYouGet() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-28">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <h2 className="font-display text-3xl text-ink md:text-5xl">
              What you get
            </h2>
          </div>
          <div className="md:col-span-7 max-w-2xl space-y-5 text-[16px] leading-relaxed text-ink/85">
            <p>
              The paid review is a written strategy based on your actual setup. It covers what you're currently earning, where you might be missing value, and what I'd do differently.
            </p>
            <p>
              That might mean changing a card, moving points, simplifying your wallet, or sometimes just keeping what you have and using it more deliberately. The answer is whatever makes sense for your spending and travel goals.
            </p>
            <p>
              I also walk you through the findings so you can ask questions and decide what to act on.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ---------- FAQ ---------- */

function FAQ() {
  const faqs = [
    {
      q: "Is the discovery call free?",
      a: "Yes. The discovery call is complimentary and usually lasts 15–20 minutes.",
    },
    {
      q: "Will I receive my full strategy during the discovery call?",
      a: "No. The discovery call is designed to understand your situation and determine whether a full paid review is likely to be worthwhile. Detailed research begins only after scope, price and payment have been agreed.",
    },
    {
      q: "Do I have to proceed after the call?",
      a: "No. There is no obligation to purchase the full service.",
    },
    {
      q: "When do I pay?",
      a: "Payment is collected only after the discovery call, once the scope and price of the Points Strategy Review have been explained and you have chosen to proceed.",
    },
    {
      q: "Will you apply for cards on my behalf?",
      a: "No. Samral provides research and recommendations. Any application remains under your control and is subject to the bank's approval.",
    },
    {
      q: "Can you guarantee a certain amount of travel?",
      a: "No. Results depend on spending, eligibility, available products, programme rules, transfer rates, fees and award availability.",
    },
    {
      q: "Is this only about airline miles?",
      a: "No. The review may compare airline points, bank rewards, cashback and relevant card benefits.",
    },
    {
      q: "Do you receive commissions from banks?",
      a: "No. Samral currently charges clients directly for its research and does not receive payment from banks for recommending specific cards.",
    },
    {
      q: "Can’t AI do this for me?",
      a: "AI can be a very useful starting point. It can help compare cards, explain rewards programmes and generate ideas much faster than doing everything manually. I use it as part of the research process too.\n\nBut I would not rely on AI alone for decisions involving large points balances. Card terms, transfer rates, programme rules and availability can change, and AI can still present outdated or incorrect information with confidence.\n\nThere is also a difference between receiving a list of possible options and knowing which one genuinely makes sense for your spending, travel plans and tolerance for complexity. Some points transfers cannot be reversed, so checking the details before moving a large balance matters.\n\nSamral is for people who would rather have a human research the options, explain the trade-offs and guide them through the decision.\n\nIf you enjoy doing the research yourself with AI and feel confident checking every detail independently, you may not need this service—and that is completely fine.",
    },
  ];

  return (
    <section className="bg-sand">
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-28">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-4">
            <h2 className="font-display text-3xl text-ink md:text-5xl">
              Common questions
            </h2>
          </div>
          <div className="md:col-span-8">
            <Accordion type="single" collapsible className="border-t border-border">
              {faqs.map((f, i) => (
                <AccordionItem key={f.q} value={`faq-${i}`} className="border-b border-border">
                  <AccordionTrigger className="py-7 text-left font-display text-xl text-ink transition-opacity hover:no-underline hover:opacity-70 md:text-2xl">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-7 pt-0">
                    <div className="max-w-2xl whitespace-pre-line text-[15px] leading-relaxed text-ink/80">
                      {f.a}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */

function FinalCTA() {
  return (
    <section className="bg-ink text-background">
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-28">
        <div className="max-w-3xl">
          <h2 className="font-display text-3xl text-background md:text-5xl">
            Not sure if this is for you? That's fine.
          </h2>
          <div className="mt-8 max-w-2xl space-y-5 text-[16px] leading-relaxed text-background/85">
            <p>
              Book a free call and tell me about your setup. I'll be honest about whether I can help, and if I can't, I'll say so.
            </p>
          </div>
          <div className="mt-10">
            <DiscoveryCTA variant="light" />
          </div>
          <p className="mt-4 text-[13px] italic text-background/70">
            15–20 minutes. No obligation. No payment required.
          </p>
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
              Independent points &amp; miles advisory.
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
            &copy; {new Date().getFullYear()} Samral &mdash; Independent points &amp; miles advisory.
          </p>
        </div>
      </div>
    </footer>
  );
}
