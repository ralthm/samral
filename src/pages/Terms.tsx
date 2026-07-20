import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const LAST_UPDATED = "18 July 2026";

export default function Terms() {
  useEffect(() => {
    document.title = "Terms of Service | Samral";
    const desc =
      "The terms that apply when you use the Samral website, book a call or purchase a Samral service.";
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
      <main>
        <section className="bg-background">
          <div className="mx-auto max-w-[820px] px-6 py-16 md:px-8 md:py-24">
            <h1 className="font-display text-4xl leading-[1.05] text-ink md:text-6xl">
              Terms of Service
            </h1>
            <p className="mt-4 text-sm text-ink/60">Last updated: {LAST_UPDATED}</p>

            <div className="mt-12 space-y-10 text-[16px] leading-relaxed text-ink/85">
              <Section title="1. About these terms">
                <p>
                  These terms apply when you use the Samral website, book a call with Samral or purchase a Samral service. By using the website or engaging Samral, you agree to these terms.
                </p>
              </Section>

              <Section title="2. Samral's services">
                <p>
                  Samral provides independent research and personalised guidance relating to credit cards, rewards, points, cashback and travel planning.
                </p>
                <p>
                  Recommendations are based on the information supplied by the client and the information reasonably available at the time the work is completed.
                </p>
              </Section>

              <Section title="3. Nature of the service">
                <p>
                  Samral's services are informational and consultative. They do not constitute regulated financial, investment, legal, accounting or tax advice.
                </p>
                <p>
                  Samral does not issue credit cards, provide credit, arrange financing or act on behalf of any bank or card issuer.
                </p>
              </Section>

              <Section title="4. Client responsibility">
                <p>The client is responsible for:</p>
                <ul className="ml-5 list-disc space-y-2">
                  <li>providing complete and accurate information;</li>
                  <li>checking the final terms offered by a bank, airline or rewards programme;</li>
                  <li>deciding whether to apply for, retain, cancel or use any financial product;</li>
                  <li>understanding fees, interest, eligibility requirements and other product terms;</li>
                  <li>ensuring that credit-card balances and financial commitments are managed responsibly.</li>
                </ul>
              </Section>

              <Section title="5. Card applications and eligibility">
                <p>
                  Samral does not submit or manage card applications. Approval, credit limits, benefits, welcome offers and eligibility decisions are determined entirely by the relevant issuer.
                </p>
                <p>
                  Samral cannot guarantee that an application will be approved or that a particular offer will remain available.
                </p>
              </Section>

              <Section title="6. Rewards and travel programmes">
                <p>
                  Banks, airlines, hotels and other providers may change earning rates, transfer ratios, redemption prices, availability, fees, benefits, eligibility rules and programme terms.
                </p>
                <p>
                  Samral is not responsible for changes made by third parties after research or recommendations have been delivered.
                </p>
              </Section>

              <Section title="7. No guaranteed outcome">
                <p>
                  Samral cannot guarantee a particular financial saving, points value, card approval, flight availability, redemption outcome or travel experience.
                </p>
              </Section>

              <Section title="8. Fees and payment">
                <p>
                  The applicable price and scope will be shown before the client purchases a service. Payment may be required before research begins.
                </p>
                <p>
                  Additional work outside the agreed scope may require a separate fee, which must be agreed before that work begins.
                </p>
              </Section>

              <Section title="9. Cancellations and refunds">
                <p>
                  A client may cancel and request a full refund before Samral begins the substantive research.
                </p>
                <p>
                  Once substantive research has started, fees are generally non-refundable because time has already been committed to the engagement.
                </p>
                <p>
                  If Samral cannot complete the agreed service, Samral may provide a full or proportionate refund depending on the work already completed.
                </p>
                <p>Nothing in this section limits rights that cannot legally be excluded.</p>
              </Section>

              <Section title="10. Intellectual property and personal use">
                <p>
                  Reports, plans and recommendations supplied by Samral are for the client's own personal or internal business use. They may not be resold, republished or commercially distributed without permission.
                </p>
              </Section>

              <Section title="11. Third-party services and links">
                <p>
                  Samral may refer to third-party websites, banks, airlines, booking tools and rewards programmes. Samral does not control those third parties and is not responsible for their websites, products, availability, security or performance.
                </p>
              </Section>

              <Section title="12. Limitation of liability">
                <p>
                  To the fullest extent permitted by law, Samral will not be liable for indirect or consequential losses, missed rewards, rejected applications, unavailable flights, programme changes or decisions made by third parties.
                </p>
                <p>
                  Nothing in these terms attempts to exclude liability that cannot legally be excluded.
                </p>
              </Section>

              <Section title="13. Changes to these terms">
                <p>
                  These terms may be updated occasionally. The revised date will be shown at the top of this page.
                </p>
              </Section>

              <Section title="14. Governing law">
                <p>
                  These Terms of Service are governed by the laws of Malaysia. Any dispute will be subject to the jurisdiction of the courts of Malaysia.
                </p>
              </Section>

              <Section title="15. Contact">
                <p>
                  For questions about these terms, contact{" "}
                  <a href="mailto:samuel@samral.com" className="underline hover:text-ink">
                    samuel@samral.com
                  </a>
                  .
                </p>
              </Section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-2xl text-ink md:text-3xl">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
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
    { label: "Cards Strategy", to: "/points-strategy" },
    { label: "About", to: "/about" },
  ];
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-5 sm:px-6 md:px-12 md:py-8">
        <Link to="/" aria-label="Samral home" className="font-display text-2xl leading-none text-ink md:text-[26px]">
          Samral
        </Link>
        <nav className="hidden items-center gap-9 text-[13px] text-ink/80 md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="transition-opacity hover:opacity-70">
              {l.label}
            </Link>
          ))}
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
            <Link to="/" onClick={() => setOpen(false)} className="font-display text-2xl leading-none text-background">
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
                className="font-display border-b border-background/15 py-5 text-3xl"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

/* ---------- Footer ---------- */

function Footer() {
  return (
    <footer className="bg-ink text-background/70">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-14 sm:px-6 md:px-12">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <Link to="/" className="font-display text-3xl text-background">
              Samral
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-background/60">
              Points &amp; miles advisory
            </p>
          </div>
          <div className="md:col-span-3">
            <p className="eyebrow mb-4 text-background/50">Services</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/trip-planning" className="hover:text-background">
                  Points Trip Planning
                </Link>
              </li>
              <li>
                <Link to="/points-strategy" className="hover:text-background">
                  Cards Strategy
                </Link>
              </li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <p className="eyebrow mb-4 text-background/50">Software</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="hover:text-background">
                  Our products
                </Link>
              </li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <p className="eyebrow mb-4 text-background/50">Contact</p>
            <a href="mailto:samuel@samral.com" className="text-sm hover:text-background">
              samuel@samral.com
            </a>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-background/10 pt-6 text-xs text-background/50 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} Samral &mdash; Points &amp; miles advisory</p>
          <div className="flex gap-5">
            <Link to="/terms" className="hover:text-background">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-background">Privacy Notice</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
