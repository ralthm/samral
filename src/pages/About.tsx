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
                Hi, I&apos;m Samuel
              </h1>
              <div className="mt-8 max-w-2xl space-y-5 text-[16px] leading-relaxed text-ink/85">
                <p>{"\n"}</p>
                <p>
                  I built Samral because I kept seeing the same problem: high earners who spend a lot accumulating valuable points for years without knowing what they&apos;re actually worth, or whether using them is even the smartest option.
                </p>
                <p>
                  My background is in real estate private equity, where I learned that owning a valuable asset and actually realising its value are two different things. I think about points the same way. A large balance means very little if you don&apos;t know what it&apos;s worth or how best to use it.
                </p>
                <p>Samral exists to help you turn that value into something real.</p>
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
