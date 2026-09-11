import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { DELIVERY_TIME } from "@/lib/commerce";

export default function CardStrategyConfirmed() {
  useEffect(() => {
    document.title = "You're booked | Samral";
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", "noindex, nofollow");
    return () => {
      robots?.setAttribute("content", "index, follow");
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-[920px] px-5 py-16 sm:px-6 md:py-24">
        <p className="eyebrow text-ink/60">Personal Card Strategy</p>
        <h1 className="mt-4 font-display text-4xl leading-[1.05] text-ink md:text-6xl">You&rsquo;re booked.</h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink/70">
          I&rsquo;ve received your information and will review your current setup before we meet.
        </p>

        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-12">
          <section className="border-t border-ink/20 pt-5">
            <h2 className="font-display text-2xl text-ink">Before the call</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-ink/75">
              Have your current cards and approximate points balances available in case I need to
              clarify anything.
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-ink/75">
              You don&rsquo;t need to prepare a spreadsheet or do any additional analysis.
            </p>
          </section>
          <section className="border-t border-ink/20 pt-5">
            <h2 className="font-display text-2xl text-ink">What happens next</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-ink/75">
              I&rsquo;ll come to the call prepared with the main issues and opportunities I see. After
              our conversation, you&rsquo;ll receive your written Samral Card Strategy within{" "}
              {DELIVERY_TIME}.
            </p>
          </section>
        </div>

        <div className="mt-14 border-t border-border pt-8">
          <Link to="/" className="text-[13px] text-ink/65 underline underline-offset-4 hover:text-ink">
            &larr; Back to Samral
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
