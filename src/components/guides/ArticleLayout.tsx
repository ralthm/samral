import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { track } from "@/lib/analytics";
import { applySeoHead } from "@/lib/seoHead";
import { SITE_URL, type Article, type ArticleBlock } from "@/content/guides/types";

/* ---------- helpers ---------- */

function todayKL(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function slugId(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/* ---------- blocks ---------- */

function BlockRenderer({ block, slug }: { block: ArticleBlock; slug: string }) {
  switch (block.type) {
    case "paragraph":
      return <p className="mt-5 text-[17px] leading-relaxed text-ink/80">{block.text}</p>;

    case "heading": {
      const id = block.id ?? slugId(block.text);
      if (block.level === 3) {
        return (
          <h3 id={id} className="font-display mt-10 text-xl text-ink md:text-2xl">
            {block.text}
          </h3>
        );
      }
      return (
        <h2 id={id} className="font-display mt-14 text-2xl leading-tight text-ink md:text-[34px]">
          {block.text}
        </h2>
      );
    }

    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag
          className={`mt-5 space-y-2 pl-5 text-[17px] leading-relaxed text-ink/80 ${
            block.ordered ? "list-decimal" : "list-disc"
          }`}
        >
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </Tag>
      );
    }

    case "table":
      return (
        <figure className="mt-8">
          <div className="overflow-x-auto border border-border">
            <table className="w-full border-collapse text-left text-sm">
              {block.caption && (
                <caption className="eyebrow border-b border-border bg-muted/40 px-4 py-3 text-left text-ink/60">
                  {block.caption}
                </caption>
              )}
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {block.columns.map((c) => (
                    <th key={c} scope="col" className="px-4 py-3 font-medium text-ink">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row) => (
                  <tr key={row.join("|")} className="border-b border-border last:border-0">
                    {row.map((cell, i) => (
                      <td
                        key={`${cell}-${i}`}
                        className={`px-4 py-3 tabular-nums ${i === 0 ? "text-ink" : "text-ink/70"}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.note && (
            <figcaption className="mt-3 text-sm leading-relaxed text-ink/55">{block.note}</figcaption>
          )}
        </figure>
      );

    case "callout":
      return (
        <aside
          className={`mt-8 border-l-2 px-5 py-4 ${
            block.tone === "warning"
              ? "border-clay bg-clay/5"
              : "border-ink/30 bg-muted/30"
          }`}
        >
          {block.title && <p className="text-sm font-medium text-ink">{block.title}</p>}
          <p className="mt-2 text-[15px] leading-relaxed text-ink/75">{block.text}</p>
        </aside>
      );

    case "keyNumbers":
      return (
        <div className="mt-8 border border-border bg-muted/20 px-5 py-5">
          {block.title && <p className="eyebrow mb-3 text-ink/60">{block.title}</p>}
          <div className="space-y-1 font-mono text-[15px] tabular-nums text-ink md:text-base">
            {block.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          {block.note && <p className="mt-3 text-sm leading-relaxed text-ink/55">{block.note}</p>}
        </div>
      );

    case "cta":
      return <ArticleCta block={block} slug={slug} />;

    default:
      return null;
  }
}

function ArticleCta({
  block,
  slug,
}: {
  block: Extract<ArticleBlock, { type: "cta" }>;
  slug: string;
}) {
  const dark = block.variant !== "secondary";
  return (
    <div
      className={`mt-12 px-6 py-8 md:px-10 md:py-10 ${
        dark ? "bg-ink text-background" : "border border-ink/15 bg-muted/30 text-ink"
      }`}
    >
      {block.eyebrow && (
        <p className={`eyebrow mb-3 ${dark ? "text-background/50" : "text-ink/50"}`}>
          {block.eyebrow}
        </p>
      )}
      <h2 className={`font-display text-2xl leading-tight md:text-[30px] ${dark ? "" : "text-ink"}`}>
        {block.title}
      </h2>
      {block.text && (
        <p
          className={`mt-4 max-w-2xl text-[15px] leading-relaxed ${
            dark ? "text-background/70" : "text-ink/70"
          }`}
        >
          {block.text}
        </p>
      )}
      <Link
        to={block.href}
        onClick={() =>
          track("article_cta_click", { article: slug, destination: block.destination })
        }
        className={`mt-7 inline-block rounded-sm px-8 py-4 text-sm font-medium transition-transform hover:-translate-y-0.5 ${
          dark ? "bg-[#fdf7eb] text-ink" : "bg-ink text-background hover:bg-ink/90"
        }`}
      >
        {block.buttonLabel} &nbsp;&rarr;
      </Link>
    </div>
  );
}

/* ---------- layout ---------- */

export default function ArticleLayout({ article }: { article: Article }) {
  const canonical = `${SITE_URL}/guides/${article.slug}`;
  const expired = useMemo(
    () => Boolean(article.promotion && article.promotion.endDate < todayKL()),
    [article.promotion],
  );

  useEffect(() => {
    track("article_view", { article: article.slug, referrer: document.referrer || "direct" });
  }, [article.slug]);

  useEffect(() => {
    const articleLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.h1,
      description: article.metaDescription,
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
      url: canonical,
      datePublished: article.datePublished,
      dateModified: article.dateModified,
      inLanguage: "en-MY",
      author: { "@type": "Organization", name: article.author.name, url: article.author.url },
      publisher: {
        "@type": "Organization",
        name: "Samral",
        url: SITE_URL,
      },
    };
    const faqLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: article.faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    };
    return applySeoHead({
      title: article.seoTitle,
      description: article.metaDescription,
      canonical,
      ogType: "article",
      jsonLd: [articleLd, faqLd],
    });
  }, [article, canonical]);

  const blocks = expired
    ? article.blocks
    : [...article.blocks, ...(article.activeOnlyBlocks ?? [])];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        <article>
          <header className="mx-auto w-full max-w-[760px] px-5 pt-12 sm:px-6 md:pt-20">
            {article.eyebrow && <p className="eyebrow mb-5 text-ink/60">{article.eyebrow}</p>}
            <h1 className="font-display text-3xl leading-[1.1] text-ink md:text-[52px]">
              {article.h1}
            </h1>

            {expired && article.promotion && (
              <div className="mt-8 border-l-2 border-clay bg-clay/5 px-5 py-4">
                <p className="text-sm font-medium text-ink">{article.promotion.endedNotice}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/75">
                  {article.promotion.endedFollowUp}
                </p>
                <Link
                  to="/miles-calculator"
                  onClick={() =>
                    track("article_cta_click", {
                      article: article.slug,
                      destination: "miles_calculator_expiry_notice",
                    })
                  }
                  className="mt-4 inline-block rounded-sm bg-ink px-6 py-3 text-sm font-medium text-background hover:bg-ink/90"
                >
                  Open the Miles Calculator &nbsp;&rarr;
                </Link>
              </div>
            )}

            <div className="mt-8 space-y-4 border-l-2 border-ink/20 pl-5">
              {article.summary.map((line) => (
                <p key={line} className="text-[17px] leading-relaxed text-ink/85 md:text-lg">
                  {expired
                    ? line
                        .replace("Qualifying conversions", "Qualifying conversions during this promotion")
                        .replace(" receive an extra", " received an extra")
                        .replace("The promotion ends on", "The promotion ended on")
                    : line}
                </p>
              ))}
            </div>

            <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-2 border-t border-border pt-5 text-xs text-ink/55">
              <div className="flex gap-2">
                <dt>Published</dt>
                <dd>
                  <time dateTime={article.datePublished}>{formatDate(article.datePublished)}</time>
                </dd>
              </div>
              <div className="flex gap-2">
                <dt>Last updated</dt>
                <dd>
                  <time dateTime={article.dateModified}>{formatDate(article.dateModified)}</time>
                </dd>
              </div>
              <div className="flex gap-2">
                <dt>Last verified</dt>
                <dd>
                  <time dateTime={article.lastVerified}>{formatDate(article.lastVerified)}</time>
                </dd>
              </div>
              <div className="flex gap-2">
                <dt>By</dt>
                <dd>{article.author.name}</dd>
              </div>
            </dl>
          </header>

          <div className="mx-auto w-full max-w-[760px] px-5 pb-4 pt-2 sm:px-6">
            {blocks.map((block, i) => (
              <BlockRenderer key={`${block.type}-${i}`} block={block} slug={article.slug} />
            ))}

            {/* FAQs */}
            {article.faqs.length > 0 && (
              <section className="mt-16">
                <h2 id="faqs" className="font-display text-2xl leading-tight text-ink md:text-[34px]">
                  Frequently asked questions
                </h2>
                <div className="mt-6 divide-y divide-border border-y border-border">
                  {article.faqs.map((f) => (
                    <div key={f.question} className="py-5">
                      <h3 className="text-[17px] font-medium text-ink">{f.question}</h3>
                      <p className="mt-2 text-[16px] leading-relaxed text-ink/75">{f.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Secondary CTA */}
            <section className="mt-14 border border-ink/15 bg-muted/30 px-6 py-8 md:px-10">
              <h2 className="font-display text-2xl leading-tight text-ink md:text-[30px]">
                Have enough points but not sure how to make the trip work?
              </h2>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink/70">
                Explore the Points Trip Plan before deciding whether it is right for your trip.
              </p>
              <a
                href={TRIP_PLAN_FORM_URL}
                onClick={() =>
                  track("article_cta_click", {
                    article: article.slug,
                    destination: "tally_trip_plan_form",
                  })
                }
                className="mt-7 inline-block rounded-sm bg-ink px-8 py-4 text-sm font-medium text-background transition-transform hover:-translate-y-0.5 hover:bg-ink/90"
              >
                Get my Points Trip Plan &nbsp;&rarr;
              </a>
            </section>

            {/* Sources */}
            {article.sources.length > 0 && (
              <section className="mt-14">
                <h2 className="eyebrow text-ink/60">Sources &amp; verification</h2>
                <p className="mt-3 text-sm text-ink/70">
                  Last verified:{" "}
                  <time dateTime={article.lastVerified}>{formatDate(article.lastVerified)}</time>
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {article.sources.map((s) => (
                    <li key={s.url}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ink underline underline-offset-4 hover:opacity-70"
                      >
                        {s.label}
                      </a>
                      {s.publisher && <span className="text-ink/55"> — {s.publisher}</span>}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs leading-relaxed text-ink/50">
                  Promotion terms are set by the programme and its participating banks and can
                  change without notice. Always confirm details with the official source before
                  converting points.
                </p>
              </section>
            )}

            {/* Related guides */}
            {article.related && article.related.length > 0 && (
              <section className="mt-14">
                <h2 className="eyebrow text-ink/60">Related guides</h2>
                <ul className="mt-3 space-y-2 text-[16px]">
                  {article.related.map((r) => (
                    <li key={r.slug}>
                      <Link
                        to={`/guides/${r.slug}`}
                        onClick={() =>
                          track("article_cta_click", {
                            article: article.slug,
                            destination: `guide:${r.slug}`,
                          })
                        }
                        className="text-ink underline underline-offset-4 hover:opacity-70"
                      >
                        {r.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </article>
      </main>

      <div className="mt-20">
        <SiteFooter />
      </div>
    </div>
  );
}
