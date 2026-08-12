// Article content model. Content/data lives in src/content/guides/*.ts and is
// rendered by the shared layout in src/components/guides/ArticleLayout.tsx.

export const SITE_URL = "https://www.samral.com";

export type InlineText = string;

export type ArticleBlock =
  | { type: "paragraph"; text: InlineText }
  | { type: "heading"; level: 2 | 3; text: string; id?: string }
  | { type: "list"; ordered?: boolean; items: InlineText[] }
  | {
      type: "table";
      caption?: string;
      note?: string;
      columns: string[];
      rows: string[][];
    }
  | { type: "callout"; tone?: "note" | "warning"; title?: string; text: InlineText }
  | { type: "keyNumbers"; title?: string; lines: string[]; note?: string }
  | {
      type: "cta";
      variant?: "primary" | "secondary";
      eyebrow?: string;
      title: string;
      text?: string;
      buttonLabel: string;
      href: string;
      /** Analytics destination label, e.g. "miles_calculator". */
      destination: string;
    };

export interface ArticleFaq {
  question: string;
  answer: string;
}

export interface ArticleSource {
  label: string;
  url: string;
  publisher?: string;
}

export interface RelatedGuide {
  slug: string;
  title: string;
}

export interface Article {
  slug: string;
  h1: string;
  seoTitle: string;
  metaDescription: string;
  eyebrow?: string;
  /** Short answer shown immediately under the H1. */
  summary: string[];
  datePublished: string; // ISO
  dateModified: string; // ISO
  lastVerified: string; // ISO — for time-sensitive data
  author: { name: string; url?: string };
  /**
   * Optional time-sensitive promotion this article describes. Once the end
   * date has passed the layout shows an expiry notice and the article stops
   * describing the promotion as active.
   */
  promotion?: {
    endDate: string; // ISO, evaluated in Asia/Kuala_Lumpur time
    endedNotice: string;
    endedFollowUp: string;
  };
  blocks: ArticleBlock[];
  /** Blocks shown only while the promotion is still running. */
  activeOnlyBlocks?: ArticleBlock[];
  faqs: ArticleFaq[];
  sources: ArticleSource[];
  related?: RelatedGuide[];
}
