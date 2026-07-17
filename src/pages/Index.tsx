import heroImage from "@/assets/hero.jpg";
import samuelImage from "@/assets/samuel.jpg";
import notebookImage from "@/assets/notebook.jpg";
import kyotoImage from "@/assets/kyoto.jpg";
import cabinImage from "@/assets/cabin.jpg";
import maldivesImage from "@/assets/maldives.jpg";
import italyImage from "@/assets/italy.jpg";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <Promise />
      <Founder />
      <Inspiration />
      <Services />
      <Destinations />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}

/* ---------- Nav ---------- */

function Nav() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-6 md:px-12 md:py-8">
        <a
          href="#top"
          className="font-display text-2xl leading-none text-background md:text-[26px]"
        >
          Samuel<span className="text-background/60">.</span>
        </a>
        <nav className="hidden items-center gap-9 text-[13px] text-background/90 md:flex">
          <a href="#founder" className="transition-opacity hover:opacity-70">
            About
          </a>
          <a href="#services" className="transition-opacity hover:opacity-70">
            Services
          </a>
          <a href="#destinations" className="transition-opacity hover:opacity-70">
            Destinations
          </a>
          <a href="#testimonials" className="transition-opacity hover:opacity-70">
            Notes
          </a>
        </nav>
        <a
          href="#contact"
          className="rounded-full border border-background/70 px-5 py-2 text-[13px] text-background transition-colors hover:bg-background hover:text-ink"
        >
          Plan my trip
        </a>
      </div>
    </header>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section id="top" className="relative h-[92vh] min-h-[640px] w-full overflow-hidden">
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
          Personal points &amp; miles advisory
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
          Independent, personal advice on how to turn the credit card rewards you already have
          into trips worth remembering.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <a
            href="#contact"
            className="inline-block rounded-full bg-[#fdf7eb] px-8 py-4 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
          >
            Plan my trip &nbsp;&rarr;
          </a>
          <a
            href="#services"
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
  const items = [
    { k: "01", t: "You share", d: "Where you dream of going and what points you have." },
    { k: "02", t: "I research", d: "The smartest way to redeem — or when to just pay cash." },
    { k: "03", t: "You travel", d: "A clear plan, a confirmed seat, no guesswork." },
  ];
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-16 md:grid-cols-3 md:gap-14 md:px-12 md:py-20">
        {items.map((i) => (
          <div key={i.k} className="flex gap-5">
            <span className="font-display text-3xl text-clay">{i.k}</span>
            <div>
              <h3 className="font-display text-2xl text-ink">{i.t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{i.d}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Founder ---------- */

function Founder() {
  return (
    <section id="founder" className="bg-sand">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 py-24 md:grid-cols-12 md:gap-16 md:px-12 md:py-36">
        <div className="md:col-span-5">
          <div className="relative">
            <img src={samuelImage} alt="Samuel, founder" className="w-full object-cover" />
            <div className="absolute -bottom-4 -right-4 hidden h-32 w-32 border border-clay md:block" />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Samuel &mdash; founder</p>
        </div>

        <div className="md:col-span-7 md:pt-8">
          <p className="eyebrow mb-6 text-clay">About Samuel</p>
          <h2 className="font-display text-4xl text-ink md:text-6xl">
            I started this because I <em className="italic text-clay">wish someone had done it for me.</em>
          </h2>

          <div className="mt-10 space-y-5 text-[17px] leading-relaxed text-ink/85">
            <p>
              I work in real estate private equity. Like most people, I signed up for a few credit
              cards without paying much attention to the rewards.
            </p>
            <p>
              Then one evening I sat down to look properly &mdash; and realised I already had
              enough points for flights to Bangkok and Ho Chi Minh City.
            </p>
            <p>
              The deeper I went, the clearer it became: this world is designed to be confusing.
              You shouldn&rsquo;t need fifty hours on forums to use points you&rsquo;ve already earned.
            </p>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-8 border-t border-clay/20 pt-8 md:max-w-md">
            <div>
              <dt className="eyebrow text-clay">Background</dt>
              <dd className="mt-2 text-sm text-ink">Real estate private equity</dd>
            </div>
            <div>
              <dt className="eyebrow text-clay">Approach</dt>
              <dd className="mt-2 text-sm text-ink">Analytical &amp; personal</dd>
            </div>
          </dl>
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
            &ldquo;A good redemption isn&rsquo;t about squeezing every last point.
            It&rsquo;s about the trip you&rsquo;ll actually remember.&rdquo;
          </p>
          <p className="mt-6 text-sm" style={{ color: "rgba(253, 247, 235, 0.75)" }}>
            &mdash; Samuel
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
              Two ways to work <em className="italic text-clay">together.</em>
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
          />
          <ServiceCard
            index="02"
            tag="Longer term"
            title="Points Strategy"
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
          />
        </div>

        <div className="mt-16 flex flex-col items-start gap-6 border-t border-border pt-10 md:flex-row md:items-center md:justify-between">
          <p className="max-w-lg text-[15px] italic text-muted-foreground">
            Booking Support is available as an optional add-on if you&rsquo;d prefer I handle the
            booking on your behalf.
          </p>
          <a
            href="#contact"
            className="inline-block rounded-full bg-ink px-8 py-4 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
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
}: {
  index: string;
  tag: string;
  title: string;
  image: string;
  imageAlt: string;
  copy: string;
  bullets: string[];
  best: string;
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
        <span className="absolute left-5 top-5 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium tracking-widest text-ink">
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
    </article>
  );
}

/* ---------- Destinations ---------- */

function Destinations() {
  const dests = [
    {
      img: maldivesImage,
      name: "The Maldives",
      note: "Overwater villa, business-class flights &mdash; often possible from a single card&rsquo;s welcome bonus.",
    },
    {
      img: italyImage,
      name: "The Italian coast",
      note: "Long summer evenings on the Amalfi coast, booked with a mix of two flexible currencies.",
    },
    {
      img: kyotoImage,
      name: "Kyoto in autumn",
      note: "Traditional ryokan stays and premium-cabin ANA seats &mdash; some of the best value in miles.",
    },
  ];

  return (
    <section id="destinations" className="bg-sand">
      <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-12 md:py-36">
        <div className="mb-14 max-w-2xl md:mb-20">
          <p className="eyebrow mb-6 text-clay">Where points can take you</p>
          <h2 className="font-display text-4xl text-ink md:text-6xl">
            Trips people didn&rsquo;t <em className="italic text-clay">think were possible.</em>
          </h2>
          <p className="mt-6 text-[16px] leading-relaxed text-muted-foreground">
            A few examples of what a well-planned redemption can look like. Yours will be different
            &mdash; and that&rsquo;s the point.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 md:gap-6">
          {dests.map((d, i) => (
            <figure key={d.name} className={`group ${i === 1 ? "md:mt-16" : ""}`}>
              <div className="overflow-hidden">
                <img
                  src={d.img}
                  alt={d.name}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </div>
              <figcaption className="mt-5">
                <p className="font-display text-2xl text-ink">{d.name}</p>
                <p
                  className="mt-2 text-[14px] leading-relaxed text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: d.note }}
                />
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Testimonials ---------- */

function Testimonials() {
  return (
    <section id="testimonials" className="bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-24 md:grid md:grid-cols-12 md:gap-16 md:px-12 md:py-36">
        <div className="md:col-span-4">
          <p className="eyebrow mb-6 text-clay">Notes from clients</p>
          <h2 className="font-display text-4xl text-ink md:text-5xl">
            Real words, <em className="italic text-clay">as they come in.</em>
          </h2>
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
            This is a new practice. Rather than invent testimonials, I&rsquo;m keeping this space
            open for the first ones as they arrive.
          </p>
        </div>

        <div className="mt-12 md:col-span-8 md:mt-0">
          <blockquote className="border-l border-clay pl-6 md:pl-10">
            <p className="font-display text-2xl leading-[1.25] text-ink md:text-4xl">
              &ldquo;A space reserved for the first client to share their story.
              Yours could be here.&rdquo;
            </p>
            <footer className="mt-6 text-sm text-muted-foreground">&mdash; Coming soon</footer>
          </blockquote>
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
          <p
            className="mt-8 max-w-xl text-lg leading-relaxed"
            style={{ color: "rgba(253, 247, 235, 0.8)" }}
          >
            A short note is enough &mdash; where, roughly when, and what points you think you have.
            I read every enquiry personally and reply within two working days.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-6">
            <a
              href="mailto:hello@samuel.example"
              className="rounded-full bg-[#fdf7eb] px-8 py-4 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
            >
              Plan my trip &nbsp;&rarr;
            </a>
            <a
              href="mailto:hello@samuel.example"
              className="text-sm"
              style={{ color: "rgba(253, 247, 235, 0.85)" }}
            >
              hello@samuel.example
            </a>
          </div>
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
          &copy; {new Date().getFullYear()} Samuel &mdash; Independent points &amp; miles advisory.
        </p>
        <p className="italic">By appointment.</p>
      </div>
    </footer>
  );
}
