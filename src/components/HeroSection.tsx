import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative border-b border-border">
      <div className="max-w-[1200px] mx-auto px-6 pt-20 md:pt-28 pb-20 md:pb-28 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-end">
        {/* Left: editorial copy */}
        <div className="lg:col-span-7">
          <div className="flex items-center gap-3 mb-10">
            <span className="h-px w-8 bg-foreground/40" />
            <span className="label-eyebrow">Samral — Product Platform</span>
          </div>
          <h1 className="font-heading text-[44px] sm:text-6xl md:text-7xl leading-[1.02] text-foreground tracking-tight">
            A studio building <em className="italic text-foreground/90">practical</em> software for everyday systems.
          </h1>
          <p className="mt-10 max-w-[520px] text-base md:text-lg text-muted-foreground leading-relaxed">
            A focused portfolio of tools across personal finance, property,
            travel, and routines — designed to be clear, usable, and durable.
          </p>
          <div className="mt-10 flex items-center gap-8">
            <button
              onClick={() => scrollTo("products")}
              className="group inline-flex items-center gap-2 text-sm font-medium text-foreground border-b border-foreground/40 hover:border-foreground pb-1 transition-colors"
            >
              View the portfolio
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => scrollTo("contact")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact →
            </button>
          </div>
        </div>

        {/* Right: structural diagram */}
        <div className="lg:col-span-5 lg:pl-8">
          <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] w-full border border-border bg-card overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-70" />
            {/* Index marks */}
            <div className="absolute top-4 left-4 right-4 flex justify-between label-eyebrow text-foreground/60">
              <span>Index / 04</span>
              <span>2026</span>
            </div>
            {/* Stacked product blocks */}
            <div className="absolute inset-x-6 bottom-6 space-y-2">
              {[
                { id: "01", name: "SubsNest", tag: "Finance" },
                { id: "02", name: "Resifolio", tag: "Property" },
                { id: "03", name: "TripHalfsies", tag: "Travel" },
                { id: "04", name: "GoalsKeep", tag: "Routines" },
              ].map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between border-t border-border/80 bg-background/70 backdrop-blur-sm px-3 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-muted-foreground">{p.id}</span>
                    <span className="text-sm text-foreground">{p.name}</span>
                  </div>
                  <span className="label-eyebrow">{p.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
