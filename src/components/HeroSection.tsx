import { Button } from "@/components/ui/button";
import { ArrowDown, Mail } from "lucide-react";
import samralLogo from "@/assets/samral-logo.png";

const HeroSection = () => {
  const scrollToVentures = () => {
    document.getElementById("ventures")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-[85vh] flex flex-col items-center justify-center px-6 py-24">
      <div className="max-w-[800px] text-center">
        <img src={samralLogo} alt="Samral" className="h-10 mx-auto mb-8" />
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
          Current focus: software products in finance, travel, and everyday utility
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl leading-[1.1] text-foreground mb-6">
          Building useful digital products, one venture at a time.
        </h1>
        <p className="text-lg text-muted-foreground max-w-[600px] mx-auto mb-12 leading-relaxed">
          Samral is the home for the startups and tools I'm building — focused on solving simple, real-world problems through software.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" onClick={scrollToVentures} className="gap-2 px-8">
            Explore Ventures <ArrowDown className="!size-4" />
          </Button>
          <Button variant="outline" size="lg" onClick={scrollToContact} className="gap-2 px-8">
            Get in Touch <Mail className="!size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
