import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { track, PRICES, TRIP_PLAN_FORM_URL } from "@/lib/commerce";

const NAV_LINKS = [
  { label: "For individuals", to: "/trip-planning" },
  { label: "For business owners", to: "/business" },
  { label: "Miles calculator", to: "/miles-calculator" },
  { label: "About", to: "/about" },
];

export default function SiteHeader({ variant = "solid" }: { variant?: "solid" | "transparent" }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
    {variant === "solid" && <div className="samral-header__spacer" aria-hidden="true" />}
    <header className="samral-header">
      <div className="samral-header__bar">
        <Link to="/" aria-label="Samral home" className="samral-header__brand">Samral<span className="samral-header__brand-dot">.</span></Link>
        <nav aria-label="Main navigation" className="samral-header__links">
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} aria-current={pathname === link.to ? "page" : undefined}>{link.label}</Link>
          ))}
        </nav>
        <a
          href={TRIP_PLAN_FORM_URL}
          onClick={() => track("trip_plan_cta_clicked", { source: "header", price_usd: PRICES.tripPlan })}
          className="samral-header__cta"
        >
          Plan a trip <ArrowUpRight size={16} aria-hidden="true" />
        </a>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="samral-mobile-menu"
          onClick={() => setOpen((value) => !value)}
          className="samral-header__toggle"
        >{open ? <X size={24} /> : <Menu size={24} />}</button>
      </div>
      {open && (
        <nav id="samral-mobile-menu" aria-label="Mobile navigation" className="samral-mobile-menu">
          <Link to="/" onClick={() => setOpen(false)}>Home <ArrowUpRight size={20} /></Link>
          {NAV_LINKS.map((link) => <Link key={link.to} to={link.to} onClick={() => setOpen(false)}>{link.label} <ArrowUpRight size={20} /></Link>)}
          <Link to="/points-strategy" onClick={() => setOpen(false)}>Card strategy <ArrowUpRight size={20} /></Link>
          <a href={TRIP_PLAN_FORM_URL} className="samral-mobile-menu__cta" onClick={() => setOpen(false)}>Get my Points Trip Plan <ArrowUpRight size={20} /></a>
        </nav>
      )}
    </header>
    </>
  );
}