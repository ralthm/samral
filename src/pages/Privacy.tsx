import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const LAST_UPDATED = "18 July 2026";

export default function Privacy() {
  useEffect(() => {
    document.title = "Privacy Notice | Samral";
    const desc =
      "How Samral collects, uses and protects personal information from visitors, clients and enquirers.";
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
              Privacy Notice
            </h1>
            <p className="mt-4 text-sm text-ink/60">Last updated: {LAST_UPDATED}</p>

            <div className="mt-12 space-y-10 text-[16px] leading-relaxed text-ink/85">
              <Section title="1. Who this notice applies to">
                <p>
                  This notice applies to people who visit the Samral website, submit a form, book a call, communicate with Samral or purchase a service.
                </p>
              </Section>

              <Section title="2. Information Samral may collect">
                <p>Depending on how you interact with Samral, the following information may be collected:</p>
                <ul className="ml-5 list-disc space-y-2">
                  <li>name;</li>
                  <li>email address;</li>
                  <li>telephone number;</li>
                  <li>business or employment information;</li>
                  <li>information submitted through questionnaires;</li>
                  <li>credit cards held;</li>
                  <li>approximate spending categories and amounts;</li>
                  <li>rewards and loyalty balances;</li>
                  <li>travel preferences and planned trips;</li>
                  <li>communications with Samral;</li>
                  <li>payment and transaction details;</li>
                  <li>basic website and device information.</li>
                </ul>
                <p>
                  Samral should not request full card numbers, passwords, PINs, security codes or online-banking login details. Please do not send this information.
                </p>
              </Section>

              <Section title="3. How information is collected">
                <p>Information is collected through:</p>
                <ul className="ml-5 list-disc space-y-2">
                  <li>website forms;</li>
                  <li>booking forms;</li>
                  <li>questionnaires;</li>
                  <li>email, telephone or messaging conversations;</li>
                  <li>service providers used for scheduling, payments, forms, analytics or website hosting.</li>
                </ul>
              </Section>

              <Section title="4. Why information is used">
                <p>Information is used for:</p>
                <ul className="ml-5 list-disc space-y-2">
                  <li>responding to enquiries;</li>
                  <li>conducting discovery calls;</li>
                  <li>assessing whether a service is suitable;</li>
                  <li>preparing Card Strategies and Points Travel Plans;</li>
                  <li>processing payments;</li>
                  <li>delivering and improving services;</li>
                  <li>maintaining business records;</li>
                  <li>protecting the website and preventing misuse;</li>
                  <li>meeting legal obligations.</li>
                </ul>
              </Section>

              <Section title="5. Service providers and disclosure">
                <p>Information may be shared with service providers needed to operate the business, such as:</p>
                <ul className="ml-5 list-disc space-y-2">
                  <li>website hosting providers;</li>
                  <li>scheduling providers;</li>
                  <li>form providers;</li>
                  <li>email providers;</li>
                  <li>payment processors;</li>
                  <li>cloud-storage providers;</li>
                  <li>professional advisers where necessary.</li>
                </ul>
                <p>Samral does not sell personal information.</p>
              </Section>

              <Section title="6. International processing">
                <p>
                  Some service providers may process or store information outside Malaysia. Samral will take reasonable steps to use appropriate providers and safeguards.
                </p>
              </Section>

              <Section title="7. Retention">
                <p>
                  Personal information is kept only for as long as reasonably required to deliver services, maintain necessary records, resolve disputes and comply with legal obligations.
                </p>
              </Section>

              <Section title="8. Security">
                <p>
                  Reasonable technical and organisational measures are used to protect information. No online system can be guaranteed completely secure.
                </p>
              </Section>

              <Section title="9. Your choices and rights">
                <p>You may contact Samral to:</p>
                <ul className="ml-5 list-disc space-y-2">
                  <li>request access to your personal information;</li>
                  <li>request corrections;</li>
                  <li>withdraw consent where applicable;</li>
                  <li>object to or limit certain processing;</li>
                  <li>request deletion where appropriate;</li>
                  <li>opt out of direct marketing.</li>
                </ul>
                <p>
                  These options apply to the extent provided by applicable law.
                </p>
              </Section>

              <Section title="10. Cookies and analytics">
                <p>
                  The website uses DataFast, a lightweight, privacy-focused analytics service, to understand aggregate visitor traffic and improve the site. No other tracking pixels or advertising cookies are used.
                </p>
                <p>
                  Cookies strictly necessary to operate the website may also be used.
                </p>
              </Section>

              <Section title="11. Third-party links">
                <p>
                  The website may link to third-party websites. Those websites have their own privacy practices and are not controlled by Samral.
                </p>
              </Section>

              <Section title="12. Changes to this notice">
                <p>
                  This notice may be updated occasionally. The latest revision date will be shown at the top of the page.
                </p>
              </Section>

              <Section title="13. Contact">
                <p>
                  For privacy questions or requests, contact{" "}
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
              Independent points &amp; miles advisory
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
          <p>&copy; {new Date().getFullYear()} Samral &mdash; Independent points &amp; miles advisory</p>
          <div className="flex gap-5">
            <Link to="/terms" className="hover:text-background">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-background">Privacy Notice</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
