import { useEffect } from "react";

const FONT_LINK_ID = "typography-preview-fonts";

const specimens = [
  {
    key: "current",
    name: "Instrument Serif (current)",
    fontFamily: "'Instrument Serif', ui-serif, Georgia, serif",
    note: "The heading font live on the site today.",
  },
  {
    key: "newsreader",
    name: "Newsreader",
    fontFamily: "'Newsreader', ui-serif, Georgia, serif",
    note: "Modern editorial serif with a warm, literary feel.",
  },
  {
    key: "source-serif-4",
    name: "Source Serif 4",
    fontFamily: "'Source Serif 4', ui-serif, Georgia, serif",
    note: "Contemporary transitional serif — precise and confident.",
  },
  {
    key: "lora",
    name: "Lora",
    fontFamily: "'Lora', ui-serif, Georgia, serif",
    note: "Calligraphic serif with a softer, more personal tone.",
  },
];

export default function TypographyPreview() {
  useEffect(() => {
    document.title = "Typography preview — Samral";
    if (!document.getElementById(FONT_LINK_ID)) {
      const link = document.createElement("link");
      link.id = FONT_LINK_ID;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;1,8..60,400&family=Lora:ital,wght@0,400;0,500;1,400&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-6 md:px-12">
          <a href="/" className="font-display text-2xl text-ink">
            Samral
          </a>
          <p className="text-[13px] text-muted-foreground">Typography preview</p>
        </div>
      </header>

      <section className="mx-auto max-w-[1280px] px-6 pb-10 pt-16 md:px-12 md:pb-16 md:pt-24">
        <p className="eyebrow mb-6 text-clay">Compare heading typefaces</p>
        <h1 className="font-display max-w-3xl text-4xl leading-[1.05] text-ink md:text-6xl">
          Four serifs, same body copy.
        </h1>
        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          The body font (Inter) stays constant in every specimen so only the heading typeface changes.
          Nothing here is applied to the live site.
        </p>
      </section>

      <div className="mx-auto max-w-[1280px] px-6 pb-32 md:px-12">
        <div className="divide-y divide-border border-y border-border">
          {specimens.map((s) => (
            <article key={s.key} className="grid gap-8 py-16 md:grid-cols-12 md:gap-12 md:py-20">
              <div className="md:col-span-3">
                <p className="eyebrow text-clay">{s.name.split(" ").slice(-1)[0] === "(current)" ? "In use" : "Option"}</p>
                <p className="mt-4 text-[15px] text-ink">{s.name}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{s.note}</p>
              </div>
              <div className="md:col-span-9">
                <h2
                  className="text-4xl leading-[1.05] text-ink md:text-6xl"
                  style={{ fontFamily: s.fontFamily, letterSpacing: "-0.015em" }}
                >
                  You have the points.{" "}
                  <span style={{ fontFamily: s.fontFamily, fontStyle: "italic" }}>
                    Let&rsquo;s put them to good use.
                  </span>
                </h2>
                <h3
                  className="mt-8 text-2xl text-ink md:text-3xl"
                  style={{ fontFamily: s.fontFamily }}
                >
                  A quiet advisory for smarter rewards and better travel.
                </h3>
                <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-ink/80">
                  I&rsquo;ll help you get 2&ndash;10&times; more value from the credit card points you
                  already have, so you can take more trips worth remembering. The body copy sits in
                  Inter across every specimen — only the heading typeface changes above.
                </p>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-16 max-w-2xl text-[14px] italic text-muted-foreground">
          Tell me which one you&rsquo;d like to move forward with and I&rsquo;ll swap it into the
          live site.
        </p>
      </div>
    </div>
  );
}
