import { useEffect } from "react";
import notebookImage from "@/assets/notebook.jpg";
import cabinImage from "@/assets/cabin.jpg";
import kyotoImage from "@/assets/kyoto.jpg";

// TODO: Replace with real booking URL when provided.
const DISCOVERY_CALL_URL = "#discovery-call";
const isExternal = /^https?:\/\//i.test(DISCOVERY_CALL_URL);

function DiscoveryCTA({
  variant = "light",
  className = "",
  children = "Book a Free Discovery Call",
}: {
  variant?: "light" | "dark";
  className?: string;
  children?: React.ReactNode;
}) {
  const base =
    "inline-block rounded-full px-8 py-4 text-sm font-medium transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2";
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
      "Personalised credit card and rewards strategy research for Malaysian business owners and high spenders. Start with a free discovery call.";
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
      <Problem />
      <Overlooked />
      <Founder />
      <Process />
      <DiscoveryCall />
      <PaidService />
      <IdealClient />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ---------- Nav ---------- */

function Nav() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-6 md:px-12 md:py-8">
        <a href="/" className="font-display text-2xl leading-none text-ink md:text-[26px]">
          Samral
        </a>
        <nav className="hidden items-center gap-9 text-[13px] text-ink/80 md:flex">
          <a href="/#founder" className="transition-opacity hover:opacity-70">About</a>
          <a href="/#services" className="transition-opacity hover:opacity-70">Services</a>
          <a href="/points-strategy" className="text-ink transition-opacity hover:opacity-70">Points Strategy</a>
          <a href="/#destinations" className="transition-opacity hover:opacity-70">Destinations</a>
          <a href="/#testimonials" className="transition-opacity hover:opacity-70">Notes</a>
        </nav>
        <a
          href={DISCOVERY_CALL_URL}
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="rounded-full border border-ink/70 px-5 py-2 text-[13px] text-ink transition-colors hover:bg-ink hover:text-background"
        >
          Book a call
        </a>
      </div>
    </header>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-sand">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 py-20 md:grid-cols-12 md:gap-16 md:px-12 md:py-28">
        <div className="md:col-span-7">
          <p className="eyebrow mb-6 text-clay">FOR BUSINESS OWNERS AND HIGH SPENDERS</p>
          <h1 className="font-display text-4xl leading-[1.05] text-ink md:text-6xl lg:text-[72px]">
            Your spending could be <em className="italic text-clay">working harder</em> for you.
          </h1>
          <div className="mt-8 max-w-2xl space-y-5 text-[16px] leading-relaxed text-ink/85">
            <p>
              Samral helps business owners and high spenders understand whether their current credit cards,
              spending patterns and rewards are actually working together effectively.
            </p>
            <p>
              The first step is a short discovery call. I&rsquo;ll learn about your current setup, what you spend
              on and what you want your rewards to achieve. If I believe a full Points Strategy Review could
              create meaningful value, I&rsquo;ll explain the next step.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <DiscoveryCTA variant="dark" />
            <a
              href="#how-it-works"
              className="text-sm text-ink/80 underline-offset-4 hover:underline focus:outline-none focus-visible:underline"
            >
              See how it works
            </a>
          </div>
          <p className="mt-4 text-[13px] italic text-muted-foreground">
            15&ndash;20 minutes. No obligation. No payment required.
          </p>
        </div>
        <div className="md:col-span-5">
          <div className="relative">
            <img
              src={cabinImage}
              alt="A business traveller reviewing notes in a quiet airport lounge"
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

/* ---------- Problem ---------- */

function Problem() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-12 md:py-32">
        <div className="max-w-3xl">
          <h2 className="font-display text-3xl text-ink md:text-5xl">
            You built a successful business. You probably did not build a{" "}
            <em className="italic text-clay">credit card rewards department.</em>
          </h2>
          <div className="mt-10 space-y-5 text-[16px] leading-relaxed text-ink/85">
            <p>
              Business owners make substantial payments every month across advertising, software, travel,
              suppliers, professional services and day-to-day operating costs. But the cards used for those
              expenses are often chosen without a wider strategy.
            </p>
            <p>
              The result may be scattered points, weak earning rates, overlapping benefits, unnecessary
              annual fees or rewards that never become useful trips.
            </p>
            <p>
              You could research every card, earning category, transfer partner and redemption rule yourself.
              But that takes time, and the rules keep changing.
            </p>
            <p className="font-display text-2xl italic text-clay md:text-3xl">
              That is the research Samral can do for you.
            </p>
          </div>
          <div className="mt-10">
            <DiscoveryCTA variant="dark" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Overlooked ---------- */

function Overlooked() {
  const cards = [
    {
      t: "Everyday spending earning too little",
      d: "Your largest expense categories may be going through cards that earn the wrong type of reward or very little value.",
    },
    {
      t: "Points spread across too many programmes",
      d: "Several small balances can be harder to use than one deliberate rewards strategy.",
    },
    {
      t: "Annual fees without sufficient value",
      d: "Premium cards may carry benefits that your business or family rarely uses.",
    },
    {
      t: "Cashback versus miles",
      d: "Airline points are not always the right answer. For some spending patterns, cashback may provide better practical value.",
    },
    {
      t: "Transfer and redemption mistakes",
      d: "Moving points before checking suitable travel options can leave rewards trapped in the wrong programme.",
    },
    {
      t: "No connection between earning and travel goals",
      d: "A good strategy should begin with the trips, cabin preferences and flexibility that actually matter to you.",
    },
  ];
  return (
    <section className="bg-sand">
      <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-12 md:py-32">
        <p className="eyebrow mb-6 text-clay">Common gaps</p>
        <h2 className="font-display max-w-2xl text-3xl text-ink md:text-5xl">
          What may be getting <em className="italic text-clay">overlooked.</em>
        </h2>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => (
            <article
              key={c.t}
              className="border border-border bg-background p-8 transition-transform hover:-translate-y-0.5"
            >
              <span className="font-display text-2xl text-clay">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display mt-4 text-2xl text-ink">{c.t}</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-ink/80">{c.d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Founder ---------- */

function Founder() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-12 md:py-32">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <div className="relative">
              <img
                src={notebookImage}
                alt="Handwritten notes in a leather notebook"
                className="aspect-[4/5] w-full object-cover"
                loading="lazy"
              />
              <div className="absolute -bottom-4 -left-4 hidden h-32 w-32 border border-clay md:block" />
            </div>
          </div>
          <div className="md:col-span-7 md:pt-4">
            <p className="eyebrow mb-6 text-clay">A note from Samuel</p>
            <h2 className="font-display text-3xl text-ink md:text-5xl">
              Hi, I&rsquo;m Samuel. I&rsquo;m here to make this{" "}
              <em className="italic text-clay">less confusing.</em>
            </h2>
            <div className="mt-8 max-w-2xl space-y-5 text-[15px] leading-relaxed text-ink/85">
              <p>
                I started Samral after realising how different the value of the same credit card points could
                be depending on where they were transferred, how they were redeemed and whether suitable seats
                were available at all.
              </p>
              <p>
                The more I researched, the clearer the problem became: many people are earning rewards without
                a practical plan for using them. For business owners, the opportunity may be larger because
                normal operating expenditure creates significantly more earning potential.
              </p>
              <p>
                My role is not to persuade you to collect as many cards as possible. It is to understand your
                current setup, identify whether there is a genuine opportunity and explain the trade-offs
                clearly.
              </p>
              <p>
                Sometimes the answer may be a different card. Sometimes it may be cashback. Sometimes it may
                be keeping exactly what you already have&mdash;but using it more deliberately.
              </p>
            </div>
            <div className="mt-10">
              <DiscoveryCTA variant="dark" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Process ---------- */

function Process() {
  const steps = [
    {
      t: "Book a free discovery call",
      d: "A short 15–20 minute conversation about your current cards, approximate spending, rewards balances and travel goals.",
    },
    {
      t: "I determine whether I can genuinely help",
      d: "The discovery call is a qualification and fit conversation. It is not the full strategy session. I will assess whether there appears to be enough complexity, spending or opportunity to justify a paid review.",
    },
    {
      t: "I explain the paid Points Strategy Review",
      d: "If I believe Samral can provide meaningful value, I will explain the scope, fee, expected timeline and information required for the full engagement. There is no obligation to continue.",
    },
    {
      t: "You decide whether to proceed",
      d: "Only after you agree to the scope and price will payment be collected and the detailed research begin.",
    },
    {
      t: "You receive the strategy",
      d: "The paid review may include a written strategy, card and spending analysis, rewards direction and a follow-up presentation or implementation discussion.",
    },
  ];
  return (
    <section id="how-it-works" className="bg-sand">
      <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-12 md:py-32">
        <div className="max-w-3xl">
          <p className="eyebrow mb-6 text-clay">How the process works</p>
          <h2 className="font-display text-3xl text-ink md:text-5xl">
            Start with a <em className="italic text-clay">conversation.</em>
          </h2>
        </div>

        <ol className="mt-16 space-y-10 md:space-y-12">
          {steps.map((s, i) => (
            <li key={s.t} className="grid gap-6 border-t border-border pt-8 md:grid-cols-12 md:gap-10">
              <div className="md:col-span-3">
                <span className="font-display text-4xl text-clay md:text-5xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="md:col-span-9">
                <h3 className="font-display text-2xl text-ink md:text-3xl">{s.t}</h3>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink/80">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-16 max-w-3xl border-l-2 border-clay bg-background p-8">
          <p className="font-display text-xl text-ink md:text-2xl">
            If I do not believe the likely value justifies the cost of a full review, I will tell you.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Discovery Call ---------- */

function DiscoveryCall() {
  const items = [
    "Whether you are a business owner or high-spending individual",
    "Your approximate monthly eligible card spending",
    "The main categories you spend on",
    "The cards you currently use",
    "Whether balances are paid in full",
    "Your existing rewards balances",
    "Whether you prefer travel rewards, cashback or both",
    "Your usual travel destinations and cabin preferences",
  ];
  return (
    <section id="discovery-call" className="bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-12 md:py-32">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <p className="eyebrow mb-6 text-clay">The free call</p>
            <h2 className="font-display text-3xl text-ink md:text-5xl">
              What happens during the free <em className="italic text-clay">discovery call.</em>
            </h2>
            <p className="mt-8 max-w-md text-[15px] leading-relaxed text-ink/80">
              This is a short conversation to understand your situation and determine whether a deeper
              review would be worthwhile.
            </p>
            <div className="mt-10">
              <DiscoveryCTA variant="dark" />
            </div>
          </div>
          <div className="md:col-span-7">
            <p className="eyebrow mb-6 text-clay">We may discuss</p>
            <ul className="divide-y divide-border border-y border-border">
              {items.map((i) => (
                <li key={i} className="flex gap-4 py-4 text-[15px] text-ink/85">
                  <span className="text-clay">&mdash;</span>
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Paid Service ---------- */

function PaidService() {
  const cards = [
    {
      t: "Detailed intake",
      d: "A secure questionnaire covering your exact cards, approximate spending categories, annual fees, rewards balances and travel goals.",
    },
    {
      t: "Current-card review",
      d: "An assessment of the cards you already hold, their earning structures, benefits, fees and rewards ecosystems.",
    },
    {
      t: "Spending analysis",
      d: "A review of where your business and personal spending is concentrated and how that spending may be routed more intentionally.",
    },
    {
      t: "Custom written strategy",
      d: "A practical roadmap showing what to prioritise, where value may be under-earned, and which areas may deserve further research.",
    },
    {
      t: "Rewards direction",
      d: "An initial assessment of how your rewards may align with your travel goals, including when cashback may be preferable.",
    },
    {
      t: "Strategy presentation",
      d: "A follow-up session to explain the findings, answer questions and discuss the recommended order of action.",
    },
  ];
  return (
    <section className="bg-sand">
      <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-12 md:py-32">
        <div className="max-w-3xl">
          <p className="eyebrow mb-6 text-clay">IF WE DECIDE TO WORK TOGETHER</p>
          <h2 className="font-display text-3xl text-ink md:text-5xl">
            The <em className="italic text-clay">Points Strategy Review.</em>
          </h2>
          <p className="mt-8 text-[16px] leading-relaxed text-ink/85">
            The paid engagement begins only after the discovery call, once we have both agreed that there is
            a meaningful opportunity to investigate.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => (
            <article key={c.t} className="border border-border bg-background p-8">
              <span className="font-display text-2xl text-clay">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display mt-4 text-2xl text-ink">{c.t}</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-ink/80">{c.d}</p>
            </article>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start gap-6 border-t border-border pt-10 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-[15px] italic text-muted-foreground">
            The exact scope and price will be explained after the discovery call and before any payment is
            collected.
          </p>
          <DiscoveryCTA variant="dark" />
        </div>
      </div>
    </section>
  );
}

/* ---------- Ideal Client ---------- */

function IdealClient() {
  const items = [
    "place meaningful recurring expenditure on credit cards;",
    "pay their balances in full;",
    "use several cards or rewards programmes without a unified strategy;",
    "travel internationally or want to travel more comfortably;",
    "value independent research over generic card-comparison articles;",
    "do not have the time or interest to master points programmes themselves.",
  ];
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-12 md:py-32">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-6">
            <p className="eyebrow mb-6 text-clay">Fit</p>
            <h2 className="font-display text-3xl text-ink md:text-5xl">
              Who this is <em className="italic text-clay">designed for.</em>
            </h2>
            <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-ink/85">
              This service is most relevant for business owners, company directors, partners and high-income
              professionals who:
            </p>
            <ul className="mt-6 space-y-3">
              {items.map((i) => (
                <li key={i} className="flex gap-3 text-[15px] text-ink/85">
                  <span className="text-clay">&mdash;</span>
                  <span>{i}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 max-w-2xl text-[14px] italic text-muted-foreground">
              There is no strict spending threshold for the discovery call. The call exists partly to
              determine whether the full service is likely to be worthwhile for you.
            </p>
          </div>
          <div className="md:col-span-6">
            <div className="h-full bg-ink p-10 text-background md:p-12">
              <p className="eyebrow mb-6" style={{ color: "rgba(253, 247, 235, 0.7)" }}>
                An honest note
              </p>
              <h3
                className="font-display text-2xl leading-[1.15] md:text-4xl"
                style={{ color: "#fdf7eb" }}
              >
                A strategy review does not automatically mean{" "}
                <em className="italic" style={{ color: "#f0d5b3" }}>more cards.</em>
              </h3>
              <div
                className="mt-8 space-y-5 text-[15px] leading-relaxed"
                style={{ color: "rgba(253, 247, 235, 0.85)" }}
              >
                <p>
                  The recommendation may be to change how you route spending, simplify your wallet, cancel
                  an unnecessary card, retain your current setup, prioritise cashback or wait before making
                  any new application.
                </p>
                <p>
                  The objective is better net value after considering fees, restrictions, effort and your
                  actual travel preferences.
                </p>
              </div>
            </div>
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
      a: "No. Samral provides research and recommendations. Any application remains under your control and is subject to the bank’s approval.",
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
  ];
  return (
    <section className="bg-sand">
      <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-12 md:py-32">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-4">
            <p className="eyebrow mb-6 text-clay">Questions</p>
            <h2 className="font-display text-3xl text-ink md:text-5xl">
              Common <em className="italic text-clay">questions.</em>
            </h2>
          </div>
          <div className="md:col-span-8">
            <dl className="divide-y divide-border border-y border-border">
              {faqs.map((f) => (
                <div key={f.q} className="py-8">
                  <dt className="font-display text-xl text-ink md:text-2xl">{f.q}</dt>
                  <dd className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink/80">{f.a}</dd>
                </div>
              ))}
            </dl>
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
        src={kyotoImage}
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
      <div className="relative z-10 mx-auto max-w-[1440px] px-6 py-28 md:px-12 md:py-40">
        <div className="max-w-3xl">
          <p className="eyebrow mb-6" style={{ color: "rgba(253, 247, 235, 0.7)" }}>
            START WITH A CONVERSATION
          </p>
          <h2
            className="font-display text-4xl leading-[1.05] md:text-6xl lg:text-[80px]"
            style={{ color: "#fdf7eb" }}
          >
            Let&rsquo;s find out whether there is an{" "}
            <em className="italic" style={{ color: "#f0d5b3" }}>
              opportunity worth exploring.
            </em>
          </h2>
          <div
            className="mt-8 max-w-2xl space-y-5 text-[16px] leading-relaxed"
            style={{ color: "rgba(253, 247, 235, 0.85)" }}
          >
            <p>
              Book a short complimentary discovery call. I&rsquo;ll learn about your current cards,
              approximate spending and travel goals and determine whether a full Points Strategy Review is
              likely to provide meaningful value.
            </p>
            <p>
              If I believe I can help, I&rsquo;ll explain the next steps and cost before you make any
              commitment. If I do not think the likely value justifies the fee, I&rsquo;ll tell you.
            </p>
          </div>
          <div className="mt-10">
            <DiscoveryCTA variant="light" />
          </div>
          <p className="mt-4 text-[13px] italic" style={{ color: "rgba(253, 247, 235, 0.7)" }}>
            15&ndash;20 minutes. No obligation. No payment required.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

function Footer() {
  return (
    <footer className="bg-ink text-background/60">
      <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-4 border-t border-background/10 px-6 py-8 text-xs md:flex-row md:items-center md:px-12">
        <p>
          &copy; {new Date().getFullYear()} Samral &mdash; Independent points &amp; miles advisory.
        </p>
        <nav className="flex flex-wrap gap-6">
          <a href="/" className="hover:text-background">Home</a>
          <a href="/#services" className="hover:text-background">Services</a>
          <a href="/points-strategy" className="hover:text-background">Points Strategy</a>
          <a href="/plan-my-trip" className="hover:text-background">Plan my trip</a>
        </nav>
      </div>
    </footer>
  );
}
