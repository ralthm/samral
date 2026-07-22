import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

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
  return <SiteHeader />;
}

/* ---------- Footer ---------- */

function Footer() {
  return <SiteFooter />;
}
