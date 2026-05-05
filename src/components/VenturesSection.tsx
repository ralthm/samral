import { ArrowUpRight } from "lucide-react";

type Product = {
  tag: string;
  title: string;
  description: string;
  url: string;
  featured?: boolean;
};

const products: Product[] = [
  {
    tag: "Personal Finance",
    title: "SubsNest",
    description:
      "Track and manage subscriptions so you never lose money to forgotten recurring payments.",
    url: "https://www.subsnest.com",
    featured: true,
  },
  {
    tag: "Property / Finance",
    title: "Resifolio",
    description:
      "Understand your true property cash flow by tracking rent, expenses, and loans in one place.",
    url: "https://www.resifolio.com",
    featured: true,
  },
  {
    tag: "Travel / Expense Sharing",
    title: "TripHalfsies",
    description:
      "Split travel expenses clearly and fairly — without awkwardness or confusion.",
    url: "https://www.triphalfsies.com",
  },
  {
    tag: "Productivity / Habits",
    title: "GoalsKeep",
    description:
      "Run structured daily routines that actually stick, using simple step-by-step flows.",
    url: "https://www.goalskeep.com",
  },
];

const VenturesSection = () => {
  return (
    <section id="products" className="px-6 py-24 md:py-32 bg-card border-y border-border">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex items-end justify-between mb-16 gap-6 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Portfolio</p>
            <h2 className="text-3xl sm:text-4xl text-foreground tracking-tight">Products</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            A growing portfolio of focused tools, each solving one clear problem well.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((p) => (
            <a
              key={p.title}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex flex-col justify-between border border-border bg-background rounded-xl p-8 md:p-10 transition-all duration-200 hover:border-foreground/30 hover:shadow-sm ${
                p.featured ? "md:min-h-[280px]" : ""
              }`}
            >
              <div>
                <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {p.tag}
                </span>
                <h3 className="text-2xl md:text-3xl text-foreground mt-4 mb-4 tracking-tight">
                  {p.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {p.description}
                </p>
              </div>
              <span className="mt-10 inline-flex items-center gap-1.5 text-sm text-foreground font-medium group-hover:gap-2.5 transition-all duration-200">
                Visit {p.title} <ArrowUpRight className="size-4" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VenturesSection;
