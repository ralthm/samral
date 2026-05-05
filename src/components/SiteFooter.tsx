const products = [
  { name: "SubsNest", url: "https://www.subsnest.com" },
  { name: "Resifolio", url: "https://www.resifolio.com" },
  { name: "TripHalfsies", url: "https://www.triphalfsies.com" },
  { name: "GoalsKeep", url: "https://www.goalskeep.com" },
];

const SiteFooter = () => {
  return (
    <footer className="px-6 py-10 border-t border-border">
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} Samral. All rights reserved.</span>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {products.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              {p.name}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
