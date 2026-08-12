import type { Article } from "./types";
import { enrichBonusAugust2026 } from "./enrich-bank-points-bonus-august-2026";

// Registry of published guides. Add new articles here — the route, metadata,
// structured data and sitemap entry all derive from this list.
export const articles: Article[] = [enrichBonusAugust2026];

export function getArticle(slug?: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export type { Article };
