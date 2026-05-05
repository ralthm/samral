const products = [
  { name: "SubsNest", url: "https://www.subsnest.com" },
  { name: "Resifolio", url: "https://www.resifolio.com" },
  { name: "TripHalfsies", url: "https://www.triphalfsies.com" },
  { name: "GoalsKeep", url: "https://www.goalskeep.com" },
];

const SiteFooter = () => {
  return (
    <footer className="px-6 py-12">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 text-sm">
        <div className="md:col-span-4">
          <div className="font-heading text-xl text-foreground">Samral</div>
          <p className="mt-2 text-muted-foreground max-w-[280px]">
            A platform for practical software products.
          </p>
        </div>
        <div className="md:col-span-5">
          <div className="label-eyebrow mb-4">Portfolio</div>
          <ul className="grid grid-cols-2 gap-y-2">
            {products.map((p) => (
              <li key={p.name}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {p.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3 md:text-right text-muted-foreground">
          <div className="label-eyebrow mb-4">Index</div>
          <div>© {new Date().getFullYear()} Samral</div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
