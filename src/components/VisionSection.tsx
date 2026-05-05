const VisionSection = () => {
  return (
    <section id="vision" className="relative border-b border-border overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="relative max-w-[1200px] mx-auto px-6 py-28 md:py-40">
        <div className="max-w-[860px] md:ml-[8%]">
          <div className="flex items-center gap-3 mb-10">
            <span className="font-mono text-[11px] text-muted-foreground">03</span>
            <span className="label-eyebrow">Vision</span>
          </div>
          <p className="font-heading text-3xl sm:text-4xl md:text-6xl text-foreground tracking-tight leading-[1.08]">
            A portfolio of <em className="italic">focused</em> software —
            quietly simplifying the systems people use every day.
          </p>
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-[640px] border-t border-border pt-8">
            {[
              ["Finance", "01"],
              ["Property", "02"],
              ["Travel", "03"],
              ["Routines", "04"],
            ].map(([label, n]) => (
              <div key={label}>
                <div className="font-mono text-[11px] text-muted-foreground">{n}</div>
                <div className="mt-1 text-sm text-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionSection;
