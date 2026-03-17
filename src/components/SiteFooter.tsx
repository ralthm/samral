const SiteFooter = () => {
  return (
    <footer className="px-6 py-8 border-t border-border">
      <div className="max-w-[960px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} Samral. All rights reserved.</span>
        <div className="flex gap-6">
          <a href="https://www.subsnest.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">SubsNest</a>
          <a href="https://www.triphalfsies.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">TripHalfsies</a>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
