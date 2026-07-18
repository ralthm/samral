import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import samuelImage from "@/assets/samral-founder-v2.png.asset.json";

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
                  I didn&apos;t grow up obsessed with airline miles.
                </p>
                <p>
                  Like most people, I signed up for a credit card because it seemed like a good deal and barely thought about the points afterwards.
                </p>
                <p>
                  One day I checked my account and realised I&apos;d already earned enough points to travel. That surprised me.
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
                  Today, I help people understand the rewards they already have and how to use them more effectively. Sometimes that means finding a better redemption. Sometimes it means paying cash instead. The goal isn&apos;t to use points at all costs—it&apos;s to make informed decisions.
                </p>
                <p>
                  I&apos;m still learning every day. Airline programmes change, banks update their transfer partners and new opportunities appear all the time. That&apos;s part of what I enjoy.
                </p>
                <p>
                  If I can save you hours of research—or help you get more from points you already earned—then Samral has done its job.
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
    { label: "Points Strategy", to: "/points-strategy" },
    { label: "About", to: "/about" },
  ];

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-5 sm:px-6 md:px-12 md:py-8">
        <Link
          to="/"
          aria-label="Samral home"
          className="font-display text-2xl leading-none text-ink md:text-[26px]"
        >
          Samral
        </Link>
        <nav className="hidden items-center gap-9 text-[13px] text-ink/80 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`transition-opacity hover:opacity-70 ${l.to === "/about" ? "text-ink" : ""}`}
            >
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
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="font-display text-2xl leading-none text-background"
            >
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
            <Link
              to="/trip-planning"
              onClick={() => setOpen(false)}
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-sm bg-[#fdf7eb] px-6 py-3 text-sm font-medium text-ink"
            >
              Plan my trip &nbsp;&rarr;
            </Link>
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
          <div className="md:col-span-5">
            <Link to="/" className="font-display text-3xl text-background">
              Samral
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-background/60">
              Independent points &amp; miles advisory
            </p>
          </div>
          <div className="md:col-span-4">
            <p className="eyebrow mb-4 text-background/50">Services</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/trip-planning" className="hover:text-background">
                  Points Trip Planning
                </Link>
              </li>
              <li>
                <Link to="/points-strategy" className="hover:text-background">
                  Points Strategy
                </Link>
              </li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <p className="eyebrow mb-4 text-background/50">Contact</p>
            <a
              href="mailto:samuel@samral.com"
              className="text-sm hover:text-background"
            >
              samuel@samral.com
            </a>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-background/10 pt-6 text-xs text-background/50 md:flex-row md:items-center md:justify-between">
          <p>
            &copy; {new Date().getFullYear()} Samral &mdash; Independent points &amp; miles advisory
          </p>
          <p className="italic">{"\n"}</p>
        </div>
      </div>
    </footer>
  );
}
