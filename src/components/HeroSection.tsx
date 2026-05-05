import { Button } from "@/components/ui/button";
import { ArrowDown, Mail } from "lucide-react";

const HeroSection = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="px-6 pt-28 pb-32 md:pt-40 md:pb-44">
      <div className="max-w-[860px] mx-auto text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
          Software Platform
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-foreground mb-8 tracking-tight">
          Practical software for everyday systems.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-[640px] mx-auto mb-12 leading-relaxed">
          Simple tools across finance, travel, and daily life — designed to help you manage, track, and make better decisions.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" onClick={() => scrollTo("products")} className="gap-2 px-8">
            Explore Products <ArrowDown className="!size-4" />
          </Button>
          <Button variant="outline" size="lg" onClick={() => scrollTo("contact")} className="gap-2 px-8">
            Contact <Mail className="!size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
