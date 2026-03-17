const AboutSection = () => {
  return (
    <section id="about" className="px-6 py-24 md:py-32">
      <div className="max-w-[800px] mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">About</p>
        <h2 className="text-3xl sm:text-4xl text-foreground mb-8">What is Samral?</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Samral is a holding company for the digital products and ventures I'm building. The focus is on creating practical, easy-to-use tools that solve everyday problems and can grow into lasting businesses.
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Right now, Samral includes early-stage software products in personal finance and travel, with more ventures to come over time.
        </p>
      </div>
    </section>
  );
};

export default AboutSection;
