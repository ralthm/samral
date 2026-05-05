const AboutSection = () => {
  return (
    <section id="about" className="px-6 py-24 md:py-32 border-t border-border">
      <div className="max-w-[860px] mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">About</p>
        <h2 className="text-3xl sm:text-4xl text-foreground mb-10 tracking-tight">What is Samral?</h2>
        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
          <p>
            Samral is a platform for developing and operating simple, high-utility software products.
          </p>
          <p>
            Each product is built around a clear use case — focusing on ease of use, clarity, and real-world practicality.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
