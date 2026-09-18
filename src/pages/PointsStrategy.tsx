import { useEffect } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import cabinImage from "@/assets/cabin.jpg";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  PRICES,
  formatUsd,
  CURRENCY_NOTE,
  CARD_STRATEGY_BOOKING_URL,
  SHOW_DELIVERY_TIME,
  DELIVERY_TIME,
  isExternalUrl,
  track,
} from "@/lib/commerce";

const PRICE = formatUsd(PRICES.cardStrategy);
const isExternal = isExternalUrl(CARD_STRATEGY_BOOKING_URL);

function BookCTA({
  variant = "light",
  source,
  label = `Book my Card Strategy — US$${PRICES.cardStrategy}`,
  className = "",
}: {
  variant?: "light" | "dark";
  source: string;
  label?: string;
  className?: string;
}) {
  const base =
    "inline-block rounded-sm px-8 py-4 text-sm font-medium transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2";
  const styles = variant === "dark" ? "bg-ink text-background hover:bg-ink/90" : "bg-[#fdf7eb] text-ink";
  return (
    <a
      href={CARD_STRATEGY_BOOKING_URL}
      onClick={() => track("card_strategy_booking_clicked", { source, price_usd: PRICES.cardStrategy })}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`${base} ${styles} ${className}`}
    >
      {label} &nbsp;&rarr;
    </a>
  );
}

export default function PointsStrategy() {
  useEffect(() => {
    document.title = "Personal Card Strategy | Samral";
    const desc =
      "A personalized card and rewards system with a written action plan and private walkthrough. US$149.";
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
      <ServiceOverview />
      <WhatYouReceive />
      <HowItWorks />
      <UsefulIf />
      <FAQ />
      <FinalCTA />
      <SiteFooter />
    </div>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1440px] px-6 pt-16 pb-12 md:px-12 md:pt-24 md:pb-16">
        <p className="eyebrow mb-6 text-ink/60">PERSONAL CARD AND REWARDS STRATEGY</p>
        <h1 className="font-display max-w-3xl text-4xl leading-[1.05] text-ink md:text-6xl lg:text-[72px]">
          Are you using the right cards for the way you spend?
        </h1>
        <div className="mt-10 flex flex-wrap items-end gap-x-8 gap-y-4">
          <div>
            <p className="font-display text-5xl leading-none text-ink md:text-6xl">{PRICE}</p>
            <p className="mt-2 text-[12px] text-ink/55">{CURRENCY_NOTE}</p>
          </div>
          <BookCTA variant="dark" source="hero" />
        </div>
        <p className="mt-6 max-w-xl text-[13px] leading-relaxed text-ink/65">
          Personal cards only &middot; Payment and scheduling in one step
        </p>
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
              Most people choose credit cards one at a time. After a while, it is easy to end up with
              several cards, points in different programmes and no clear idea whether the setup still
              makes sense.
            </p>
            <p>
               A personalized system for what cards to use, where to put your spending and what points to
               build toward.
            </p>
          </div>
          <div className="mt-10">
            <BookCTA variant="dark" source="overview" />
          </div>
          <p className="mt-4 text-[13px] italic text-muted-foreground">
             Personal cards only · Payment and scheduling in one step
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
    "Review of current cards and points balances",
    "Keep, change or reconsider recommendations",
    "Spending-by-category card strategy",
    "Points currencies to prioritize based on goals",
    "Annual fee and relevant benefit review",
    "Simple one-page ‘Which card do I use?’ guide",
    "Written, sequenced action plan",
    "45-minute private walkthrough",
    "14 days of reasonable follow-up questions relating to the strategy",
  ];

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-28">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <h2 className="font-display text-3xl text-ink md:text-5xl">What you receive</h2>
            <div className="mt-6">
               <p className="text-[15px] text-ink/70">Personal Card and Rewards Strategy</p>
              <p className="mt-1 font-display text-4xl text-ink">{PRICE}</p>
              <p className="mt-2 text-[12px] text-ink/55">{CURRENCY_NOTE}</p>
            </div>
          </div>
          <div className="md:col-span-7">
            <ul className="space-y-8">
               {items.map((item) => (
                 <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-ink/80">
                   <span aria-hidden className="text-clay">&mdash;</span>
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

/* ---------- How it works ---------- */

function HowItWorks() {
  const steps = [
    {
      title: "Book and pay",
      text: `Choose a time for your call and pay the ${PRICE} fee in one step. You'll be asked a few short questions about your cards and spending when you book.`,
    },
    {
      title: "I review your setup before we meet",
      text: "I look at the information you provided so our call is spent on decisions, not data collection.",
    },
    {
      title: "We talk it through",
      text: "A one-to-one call to go through your cards, spending and what you want your rewards to do.",
    },
    {
      title: "Receive your written strategy",
      text: SHOW_DELIVERY_TIME
        ? `You'll receive your personal Samral Card Strategy within ${DELIVERY_TIME} of the call.`
        : "You'll receive your personal Samral Card Strategy by email after the call.",
    },
  ];

  return (
    <section className="bg-sand">
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-28">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <h2 className="font-display text-3xl text-ink md:text-5xl">How it works</h2>
          </div>
          <div className="md:col-span-7">
            <ol className="space-y-10">
              {steps.map((step, i) => (
                <li key={step.title} className="flex gap-5">
                  <span className="font-display text-3xl text-ink/40">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-display text-xl text-ink md:text-2xl">{step.title}</h3>
                    <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink/80">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-12">
              <BookCTA variant="dark" source="how_it_works" />
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
    "You use several personal credit cards.",
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
            <h2 className="font-display text-3xl text-ink md:text-5xl">This may be useful for you if</h2>
            <p className="mt-6 max-w-md text-[14px] leading-relaxed text-ink/65">
              Running a business and putting company spend through cards? That&rsquo;s covered
              separately on the{" "}
              <a href="/business" className="underline underline-offset-4 hover:text-ink">
                Business page
              </a>
              , starting with a free conversation.
            </p>
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
      q: "What does the fee include?",
      a: `It includes a review of your current cards and spending, a one-to-one strategy call, clear written recommendations, a rewards direction and a personal written Samral Card Strategy. The fee is ${PRICE}. ${CURRENCY_NOTE}`,
    },
    {
      q: "How does booking work?",
      a: "You choose a time, answer a few short questions about your cards and spending, and pay in the same step. You'll receive a confirmation and calendar invitation immediately.",
    },
    {
      q: "What information will I need to provide?",
      a: "At booking you'll be asked about your current cards, annual fees, main spending categories, existing rewards balances, and what you want your rewards to do for you. It takes a few minutes.",
    },
    {
      q: "What if I need to reschedule?",
      a: "You can reschedule from your booking confirmation. If you need to cancel before we've met, email me and I'll refund the fee.",
    },
    {
      q: "Will you tell me which cards to apply for?",
      a: "I may recommend cards to consider, but I do not apply for them on your behalf and any application remains your decision and subject to the bank's approval.",
    },
    {
      q: "Do you receive commissions from banks?",
      a: "No. Samral charges clients directly for its research and does not receive payment from banks for recommending specific cards.",
    },
    {
      q: "Is this only about airline points?",
      a: "No. The review may compare airline points, bank rewards, cashback and relevant card benefits.",
    },
    {
      q: "Does this cover business cards?",
      a: "No. Personal Card Strategy covers personal cards only. Business spend and payment optimisation is a separate service that starts with a free conversation via the Business page.",
    },
    {
      q: "Can you guarantee how much value I will receive?",
      a: "No. Results depend on spending, eligibility, available products, programme rules, transfer rates, fees and award availability.",
    },
    {
      q: "Can't AI do this for me?",
      a: "Yes. AI can be very useful for comparing cards, rewards programmes and travel options, and I use it as part of my research too.\n\nIf you enjoy doing the research yourself, checking the details and deciding between the options, you may not need Samral.\n\nSamral is for busy high spenders and business owners who would rather delegate that work. I research your specific situation, compare the realistic options, verify the important details and give you a clear recommendation for what I’d do and why.\n\nAI is one of the tools that helps me do that faster. You still get a human responsible for the research, judgment and recommendation.",
    },
  ];

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-28">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-4">
            <h2 className="font-display text-3xl text-ink md:text-5xl">Common questions</h2>
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
            Ready to sort out your cards?
          </h2>
          <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-background/85">
            Book your call, tell me about your setup, and get a written strategy for what to keep,
            change or reconsider.
          </p>
          <div className="mt-10">
            <BookCTA variant="light" source="final_cta" />
          </div>
          <p className="mt-4 text-[12px] text-background/55">Personal cards only · Payment and scheduling in one step</p>
        </div>
      </div>
    </section>
  );
}
