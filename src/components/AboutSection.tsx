const AboutSection = () => {
  return (
    <section id="about" className="border-b border-border">
      <div className="max-w-[1200px] mx-auto px-6 py-24 md:py-32 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-muted-foreground">01</span>
            <span className="label-eyebrow">About</span>
          </div>
        </div>
        <div className="md:col-span-8 md:pl-8 md:border-l md:border-border">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight leading-[1.1] max-w-[720px]">
            A platform for developing and operating simple, high-utility software products.
          </h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-[720px] text-muted-foreground leading-relaxed">
            <p>
              Each product targets a clear, recurring problem — built around
              clarity, ease of use, and real-world practicality.
            </p>
            <p>
              Samral treats software as infrastructure: small, reliable systems
              that quietly do their job and stay out of the way.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
