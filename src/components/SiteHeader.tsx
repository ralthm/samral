import samralLogo from "@/assets/samral-logo.png";

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2"
          aria-label="Samral home"
        >
          <img src={samralLogo} alt="Samral" className="h-6 dark:invert" />
        </button>
        <nav className="flex items-center gap-8 text-sm text-muted-foreground">
          <button onClick={() => scrollTo("products")} className="hover:text-foreground transition-colors">
            Products
          </button>
          <button onClick={() => scrollTo("vision")} className="hover:text-foreground transition-colors">
            Vision
          </button>
          <button onClick={() => scrollTo("contact")} className="hover:text-foreground transition-colors">
            Contact
          </button>
        </nav>
      </div>
    </header>
  );
};

export default SiteHeader;
