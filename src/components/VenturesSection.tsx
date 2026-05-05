import { ArrowUpRight } from "lucide-react";

type Product = {
  index: string;
  tag: string;
  title: string;
  description: string;
  url: string;
};

const products: Product[] = [
  {
    index: "01",
    tag: "Personal Finance",
    title: "SubsNest",
    description:
      "Track and manage subscriptions so you never lose money to forgotten recurring payments.",
    url: "https://www.subsnest.com",
  },
  {
    index: "02",
    tag: "Property / Finance",
    title: "Resifolio",
    description:
      "Understand true property cash flow by tracking rent, expenses, and loans in one clear view.",
    url: "https://www.resifolio.com",
  },
  {
    index: "03",
    tag: "Travel / Expense Sharing",
    title: "TripHalfsies",
    description:
      "Split travel expenses clearly and fairly — without awkwardness or spreadsheet gymnastics.",
    url: "https://www.triphalfsies.com",
  },
  {
    index: "04",
    tag: "Productivity / Habits",
    title: "GoalsKeep",
    description:
      "Run structured daily routines that actually stick, using simple step-by-step flows.",
    url: "https://www.goalskeep.com",
  },
];

const VenturesSection = () => {
  return (
    <section id="products" className="border-b border-border bg-card">
      <div className="max-w-[1200px] mx-auto px-6 py-24 md:py-32">
        {/* Section header — asymmetric */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-20">
          <div className="md:col-span-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-muted-foreground">02</span>
              <span className="label-eyebrow">Portfolio · 04 Products</span>
            </div>
          </div>
          <div className="md:col-span-8 md:pl-8 md:border-l md:border-border">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight leading-[1.1] max-w-[680px]">
              A curated directory of focused tools, each solving one clear problem.
            </h2>
          </div>
        </div>

        {/* Product directory list */}
        <ul className="border-t border-border">
          {products.map((p) => (
            <li key={p.title} className="border-b border-border">
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block py-10 md:py-12 transition-colors hover:bg-background/60"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-baseline px-2">
                  <div className="md:col-span-2 flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground">
                      {p.index}
                    </span>
                    <span className="label-eyebrow hidden md:inline">{p.tag.split(" / ")[0]}</span>
                  </div>
                  <div className="md:col-span-5">
                    <h3 className="font-heading text-3xl md:text-5xl text-foreground tracking-tight leading-[1.05] transition-transform duration-300 group-hover:translate-x-1">
                      {p.title}
                    </h3>
                    <span className="md:hidden mt-2 inline-block label-eyebrow">{p.tag}</span>
                  </div>
                  <div className="md:col-span-4 max-w-[420px]">
                    <p className="text-muted-foreground leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                  <div className="md:col-span-1 flex md:justify-end">
                    <span className="inline-flex items-center gap-1.5 text-sm text-foreground border-b border-transparent group-hover:border-foreground pb-0.5 transition-all">
                      Visit
                      <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default VenturesSection;
