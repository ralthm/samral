import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Miles Calculator", to: "/miles-calculator" },
  { label: "Points Trip Planning", to: "/trip-planning" },
  { label: "Cards Strategy", to: "/points-strategy" },
];

const MOBILE_LINKS = [{ label: "Home", to: "/" }, ...NAV_LINKS, { label: "About", to: "/about" }];

export default function SiteHeader({ variant = "solid" }: { variant?: "solid" | "transparent" }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const transparent = variant === "transparent";
  const wrapperClass = transparent
    ? "absolute inset-x-0 top-0 z-30"
    : "border-b border-border bg-background";
  const textColor = transparent ? "text-background" : "text-ink";
  const linkColor = transparent ? "text-background/90" : "text-ink/80";
  const ctaClass = transparent
    ? "rounded-sm border border-background/70 px-5 py-2 text-[13px] text-background transition-colors hover:bg-background hover:text-ink"
    : "rounded-sm border border-ink/70 px-5 py-2 text-[13px] text-ink transition-colors hover:bg-ink hover:text-background";

  return (
    <header className={wrapperClass}>
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-5 sm:px-6 md:px-12 md:py-8">
        <Link
          to="/"
          aria-label="Samral home"
          className={`font-display text-2xl leading-none md:text-[26px] ${textColor}`}
        >
          Samral
        </Link>
        <nav className={`hidden items-center gap-9 text-[13px] md:flex ${linkColor}`}>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`transition-opacity hover:opacity-70 ${pathname === l.to ? textColor : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link to="/trip-planning" className={`hidden md:inline-block ${ctaClass}`}>
          Plan my trip
        </Link>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`inline-flex h-11 w-11 items-center justify-center md:hidden ${textColor}`}
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
            {MOBILE_LINKS.map((l) => (
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
