import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

/**
 * NOTE FOR MAINTAINER:
 * Production URLs and official logo assets were not present in the project at
 * build time. Replace the `href` values below with the confirmed production
 * URLs, and drop the official SVG logos into:
 *   src/assets/software/resifolio.svg
 *   src/assets/software/subsnest.svg
 *   src/assets/software/triphalfsies.svg
 *   src/assets/software/latersafe.svg
 * Then swap the wordmark fallback for an <img> import.
 */
type Product = {
  name: string;
  description: string;
  href: string; // developer placeholder — replace with confirmed production URL
};

const products: Product[] = [
  {
    name: "Resifolio",
    description:
      "Keep property income, expenses, bills and important records organised in one place.",
    href: "https://resifolio.com",
  },
  {
    name: "SubsNest",
    description:
      "Track subscriptions, recurring payments and upcoming renewals before they become unexpected charges.",
    href: "https://subsnest.com",
  },
  {
    name: "TripHalfsies",
    description:
      "Split group travel expenses across currencies and see clearly who owes whom.",
    href: "https://triphalfsies.com",
  },
  {
    name: "LaterSafe",
    description:
      "Store important information and arrange for it to be shared with trusted people when needed.",
    href: "https://latersafe.com",
  },
];

const CANONICAL = "https://www.samral.com/products";

function upsertMeta(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector(selector) as HTMLElement | null;
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

export default function Products() {
  useEffect(() => {
    const title = "Software by Samral | Resifolio, SubsNest, TripHalfsies and LaterSafe";
    const desc =
      "Explore software built by Samral for property records, subscription tracking, group travel expenses and important personal information.";
    document.title = title;

    upsertMeta('meta[name="description"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      return m;
    }, "content", desc);

    upsertMeta('link[rel="canonical"]', () => {
      const l = document.createElement("link");
      l.setAttribute("rel", "canonical");
      return l;
    }, "href", CANONICAL);

    const og: [string, string][] = [
      ["og:title", "Software by Samral"],
      ["og:description", "Practical software for property, subscriptions, group travel expenses and important personal information."],
      ["og:url", CANONICAL],
      ["og:type", "website"],
    ];
    og.forEach(([prop, val]) => {
      upsertMeta(`meta[property="${prop}"]`, () => {
        const m = document.createElement("meta");
        m.setAttribute("property", prop);
        return m;
      }, "content", val);
    });

    // Structured data
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Software by Samral",
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "SoftwareApplication",
          name: p.name,
          url: p.href,
          applicationCategory: "WebApplication",
        },
      })),
    });
    ld.setAttribute("data-products-jsonld", "true");
    document.head.appendChild(ld);
    return () => {
      ld.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        {/* Hero */}
        <section className="border-b border-border">
          <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-6 md:px-12 md:py-24">
            <p className="eyebrow text-clay">Software by Samral</p>
            <h1 className="font-display mt-6 text-4xl leading-[1.05] text-ink md:text-6xl lg:text-7xl">
              Practical tools, built simply.
            </h1>
            <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-ink/80">
              Samral builds focused software for managing property, subscriptions,
              shared travel expenses and important personal information.
            </p>
          </div>
        </section>

        {/* Products */}
        <section>
          <ul className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 md:px-12">
            {products.map((p, idx) => (
              <li
                key={p.name}
                className={`grid gap-8 py-12 md:grid-cols-12 md:gap-12 md:py-20 ${
                  idx > 0 ? "border-t border-border" : ""
                }`}
              >
                <div className="md:col-span-4">
                  <div className="flex h-24 items-center">
                    {/* Official logo missing — using restrained wordmark fallback.
                        Replace with <img src={...} alt="{p.name} logo" /> once
                        src/assets/software/{slug}.svg is provided. */}
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${p.name} — visit website`}
                      className="font-display text-4xl leading-none text-ink transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-4 md:text-5xl"
                    >
                      {p.name}
                    </a>
                  </div>
                </div>
                <div className="md:col-span-8">
                  <p className="max-w-xl text-[17px] leading-relaxed text-ink/85">
                    {p.description}
                  </p>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-sm border border-ink/70 px-5 py-2.5 text-[13px] text-ink transition-colors hover:bg-ink hover:text-background focus:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
                  >
                    Visit {p.name}
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Closing */}
        <section className="border-t border-border">
          <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-6 md:px-12 md:py-20">
            <p className="max-w-2xl text-[15px] leading-relaxed text-ink/70">
              Each product operates independently and has its own website, account and terms.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

/* ---------- Nav (footer-only linkage; /products intentionally omitted) ---------- */

function Nav() {
  return <SiteHeader />;
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
