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
                  I didn&apos;t grow up obsessed with airline miles. Even after working in finance, I never expected credit card points to become such a big interest of mine.
                </p>
                <p>
                  Like most people, I signed up for a credit card because it seemed like a good deal and barely thought about the points afterwards.
                </p>
                <p>
                  One day I checked my account and realised I&apos;d already earned enough points to travel to places like Bangkok and Ho Chi Minh City in just a few months. That surprised me.
                </p>
                <p>
                  I started reading about airline programmes, transfer partners and award redemptions, expecting it to be fairly straightforward.
                </p>
                <p>
                  It wasn&apos;t.
                </p>
                <p>
                  The more I learnt, the more I realised how confusing the whole system is. The same points could be worth very different amounts depending on how you used them. Some transfers made sense. Others didn&apos;t. Some flights looked expensive until you knew where to search.
                </p>
                <p>
                  Before long, it became a hobby. I&apos;d spend evenings reading airline programmes, comparing transfer options and helping friends figure out whether their points were actually worth using.
                </p>
                <p>
                  That&apos;s how Samral started.
                </p>
                <p>
                  Today, I help people understand the rewards they already have and how to use them more effectively. Sometimes that means finding a better redemption. Sometimes it means paying cash instead. The goal isn&apos;t to use points at all costs, it&apos;s to make informed decisions.
                </p>
                <p>
                  Airline programmes change, banks update their transfer partners and new opportunities appear all the time. That&apos;s part of what I enjoy.
                </p>
                <p>
                  I can save you hours of research or help you get more from points you already earned.
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
