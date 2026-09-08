import { useEffect } from "react";
import { Link } from "react-router-dom";
import samuelImage from "@/assets/samral-founder-v2.png.asset.json";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function About() {
  useEffect(() => {
    document.title = "About Samuel | Samral";
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
      <main>
        <section className="bg-sand">
          <div className="mx-auto grid max-w-[1440px] gap-12 px-6 py-16 md:grid-cols-12 md:gap-16 md:px-12 md:py-28">
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
            <div className="md:col-span-7">
              <h1 className="font-display text-4xl leading-[1.05] text-ink md:text-6xl lg:text-7xl">
                About Samuel
              </h1>
              <div className="mt-8 max-w-2xl space-y-5 text-[16px] leading-relaxed text-ink/85">
                <p>
                  I started Samral after noticing something surprisingly simple: the same money can produce very different value depending on how it&apos;s spent, paid and used.
                </p>
                <p>
                  My background is in finance, but my interest in this started personally. After checking the points I&apos;d accumulated on a credit card, I realised I already had enough to travel to places like Bangkok and Ho Chi Minh City.
                </p>
                <p>
                  What looked simple quickly became a rabbit hole. Different transfer routes, airline programmes and redemption choices could produce completely different outcomes from the same points.
                </p>
                <p>
                  I started researching it obsessively and helping friends do the same. That eventually became Samral.
                </p>
                <p>
                  Today, Samral helps individuals make better decisions around their cards, points and travel, and is expanding that same thinking into how business owners spend and pay.
                </p>
                <p>
                  The principle is the same: don&apos;t optimize the most obvious number. Look at the whole economic outcome.
                </p>
                <p>
                  Sometimes points create the most value. Sometimes cash does. For a business, fees, FX, payment terms or working capital can matter more than rewards.
                </p>
                <p>
                  My job is to understand the options, quantify the trade-offs and help you make the decision that creates the most real-world value.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
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
