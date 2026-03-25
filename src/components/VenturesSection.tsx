import { ArrowUpRight, Wallet, Plane, Target } from "lucide-react";

const ventures = [
  {
    tag: "Personal Finance",
    title: "SubsNest",
    description:
      "A subscription tracking app that helps people manage recurring payments, avoid forgotten charges, and stay on top of monthly spending.",
    url: "https://www.subsnest.com",
    icon: Wallet,
  },
  {
    tag: "Travel / Expense Sharing",
    title: "TripHalfsies",
    description:
      "A travel expense splitting app that helps friends and groups track shared costs, split expenses fairly, and settle up easily during trips.",
    url: "https://www.triphalfsies.com",
    icon: Plane,
  },
];

const VenturesSection = () => {
  return (
    <section id="ventures" className="px-6 py-24 md:py-32 bg-card">
      <div className="max-w-[960px] mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Portfolio</p>
        <h2 className="text-3xl sm:text-4xl text-foreground mb-16">Current Ventures</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ventures.map((v) => (
            <a
              key={v.title}
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block border border-border bg-background rounded-lg p-10 transition-all duration-150 hover:-translate-y-0.5 hover:border-muted-foreground/30"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  {v.tag}
                </span>
                <v.icon className="size-5 text-muted-foreground" />
              </div>
              <h3 className="text-2xl text-foreground mb-4">{v.title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-8">
                {v.description}
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm text-foreground font-medium group-hover:gap-2.5 transition-all duration-150">
                Visit {v.title} <ArrowUpRight className="size-4" />
              </span>
            </a>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-12">
          More ventures coming soon.
        </p>
      </div>
    </section>
  );
};

export default VenturesSection;
