import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import cabinImage from "@/assets/cabin.jpg";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const DISCOVERY_CALL_URL = "https://cal.com/samral/discovery-call";
const isExternal = /^https?:\/\//i.test(DISCOVERY_CALL_URL);

function DiscoveryCTA({
  variant = "light",
  className = "",
}: {
  variant?: "light" | "dark";
  className?: string;
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
      Book a Strategy Call &nbsp;&rarr;
    </a>
  );
}

export default function PointsStrategy() {
  useEffect(() => {
    document.title = "Card Strategy | Samral";
    const desc =
      "Personalised credit card review for people who use several cards and want a clear, written plan for what to keep, change or reconsider.";
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
      <ServiceOverview />
      <WhatYouReceive />
      <HowItWorks />
      <UsefulIf />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ---------- Nav ---------- */

function Nav() {
  return <SiteHeader />;
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1440px] px-6 pt-16 pb-12 md:px-12 md:pt-24 md:pb-16">
        <p className="eyebrow mb-6 text-ink/60">CARD STRATEGY</p>
        <h1 className="font-display max-w-3xl text-4xl leading-[1.05] text-ink md:text-6xl lg:text-[72px]">
          Are you using the right cards for the way you spend?
        </h1>
      </div>
    </section>
  );
}

/* ---------- Service Overview ---------- */

function ServiceOverview() {
  return (
    <section className="bg-sand">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 py-20 md:grid-cols-12 md:gap-16 md:px-12 md:py-28">
        <div className="md:col-span-7">
          <div className="max-w-2xl space-y-6 text-[16px] leading-relaxed text-ink/85">
            <p>
              Most people choose credit cards one at a time. After a while, it is easy to end up with several cards, points in different programmes and no clear idea whether the setup still makes sense.
            </p>
            <p>
              I will review the cards you use, where you spend and what you would actually like to get from your rewards. I will then put together a clear, personal strategy showing what I think you should keep, change or reconsider.
            </p>
          </div>
          <div className="mt-10">
            <DiscoveryCTA variant="dark" />
          </div>
          <p className="mt-4 text-[13px] italic text-muted-foreground">
            A short call to see whether the service is suitable for you. No advice or card recommendations are provided during this call.
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

/* ---------- What you receive ---------- */

function WhatYouReceive() {
  const items = [
    {
      title: "A review of your current cards",
      text: "I will look at what each card earns, its annual fee, its useful benefits and whether it still has a place in your setup.",
    },
    {
      title: "A review of your spending",
      text: "I will consider your main spending categories and whether you are using suitable cards for them.",
    },
    {
      title: "Clear recommendations",
      text: "You will receive my recommendations on which cards to keep, reconsider or potentially add, together with the reasons behind them.",
    },
    {
      title: "A rewards direction",
      text: "I will explain whether travel points, cashback or a mixture of both makes the most sense for you.",
    },
    {
      title: "A written Card Strategy",
      text: "Everything will be brought together in a personal written plan that you can refer back to.",
    },
    {
      title: "A follow-up call",
      text: "We will go through the strategy together, and you can ask questions about my recommendations.",
    },
  ];

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-28">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <h2 className="font-display text-3xl text-ink md:text-5xl">
              What you receive
            </h2>
            <div className="mt-6">
              <p className="text-[15px] text-ink/70">{"\n"}</p>
              <p className="mt-1 font-display text-4xl text-ink">{"\n"}</p>
            </div>
          </div>
          <div className="md:col-span-7">
            <ul className="space-y-8">
              {items.map((item) => (
                <li key={item.title}>
                  <h3 className="font-display text-xl text-ink md:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink/80">
                    {item.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- How it works ---------- */

function HowItWorks() {
  const steps = [
    {
      title: "Book a Discovery Call",
      text: "We will briefly discuss your situation and decide whether a Card Strategy would be useful for you.",
    },
    {
      title: "Decide whether to proceed",
      text: "If the service is suitable, I will send you the payment link and a questionnaire. The Card Strategy costs US$ 200.",
    },
    {
      title: "I do the research",
      text: "I will review the information you provide and prepare your personal recommendations.",
    },
    {
      title: "Receive your strategy",
      text: "You will receive the written Card Strategy, followed by a call to walk through it together.",
    },
  ];

  return (
    <section className="bg-sand">
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-28">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <h2 className="font-display text-3xl text-ink md:text-5xl">
              How it works
            </h2>
          </div>
          <div className="md:col-span-7">
            <ol className="space-y-10">
              {steps.map((step, i) => (
                <li key={step.title} className="flex gap-5">
                  <span className="font-display text-3xl text-ink/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-xl text-ink md:text-2xl">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink/80">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-12">
              <DiscoveryCTA variant="dark" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Useful if ---------- */

function UsefulIf() {
  const items = [
    "You use several personal or business credit cards.",
    "You have significant monthly card spending.",
    "You are unsure which card to use for different expenses.",
    "You are paying annual fees without knowing whether they are worthwhile.",
    "You have points spread across different programmes.",
    "You want your rewards to support future travel.",
  ];

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-28">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <h2 className="font-display text-3xl text-ink md:text-5xl">
              This may be useful for you if
            </h2>
          </div>
          <div className="md:col-span-7">
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] text-ink/85">
                  <span className="text-clay">&mdash;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}


/* ---------- FAQ ---------- */

function FAQ() {
  const faqs = [
    {
      q: "What happens during the Discovery Call?",
      a: "The Discovery Call is a brief introduction to understand your current situation and determine whether the Card Strategy service is suitable for you. It is not the strategy session itself.",
    },
    {
      q: "Will I receive recommendations during the Discovery Call?",
      a: "No. Personal recommendations require proper research and are provided as part of the paid Card Strategy.",
    },
    {
      q: "What does the fee include?",
      a: "It includes a review of your current cards and spending, clear written recommendations, a rewards direction, a personal written Card Strategy, and a follow-up call to walk through it together.",
    },
    {
      q: "What information will I need to provide?",
      a: "You will receive a questionnaire covering your current cards, annual fees, main spending categories, existing rewards balances, and what you want your rewards to do for you.",
    },
    {
      q: "Will you tell me which cards to apply for?",
      a: "I may recommend cards to consider, but I do not apply for them on your behalf and any application remains your decision and subject to the bank's approval.",
    },
    {
      q: "Do you apply for cards on my behalf?",
      a: "No. Samral provides research and recommendations only. Any application remains under your control.",
    },
    {
      q: "Do you receive commissions from banks?",
      a: "No. Samral currently charges clients directly for its research and does not receive payment from banks for recommending specific cards.",
    },
    {
      q: "Is this only about airline points?",
      a: "No. The review may compare airline points, bank rewards, cashback and relevant card benefits.",
    },
    {
      q: "Can you guarantee how much value I will receive?",
      a: "No. Results depend on spending, eligibility, available products, programme rules, transfer rates, fees and award availability.",
    },
    {
      q: "Can't AI do this for me?",
      a: "AI can be a very useful starting point. It can help compare cards, explain rewards programmes and generate ideas much faster than doing everything manually. I use it as part of the research process too.\n\nBut I would not rely on AI alone for decisions involving large points balances. Card terms, transfer rates, programme rules and availability can change, and AI can still present outdated or incorrect information with confidence.\n\nThere is also a difference between receiving a list of possible options and knowing which one genuinely makes sense for your spending, travel plans and tolerance for complexity. Some points transfers cannot be reversed, so checking the details before moving a large balance matters.\n\nSamral is for people who would rather have a human research the options, explain the trade-offs and guide them through the decision.\n\nIf you enjoy doing the research yourself with AI and feel confident checking every detail independently, you may not need this service—and that is completely fine.",
    },
  ];

  return (
    <section className="bg-background">
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
            Not sure if this is for you?
          </h2>
          <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-background/85">
            Book a Discovery Call and tell me about your setup. If the service is not right for you, I will say so.
          </p>
          <div className="mt-10">
            <DiscoveryCTA variant="light" />
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
