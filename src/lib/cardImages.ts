// Customer-facing card artwork lookup.
//
// Only rows with `card_image_status = 'verified'` are readable by visitors
// (enforced by row-level security), so the calculator can never render an
// unreviewed or mismatched image. Images are keyed by the exact internal card
// id — never by bank or by a fuzzy name match.

import { supabase } from "@/integrations/supabase/client";

export interface VerifiedCardImage {
  cardId: string;
  /** Storage paths keyed by width, e.g. { "160": "cards/x/ab-160.png" }. */
  variants: Record<string, string>;
  originalPath: string | null;
  width: number | null;
  height: number | null;
}

export interface ResolvedCardImage extends VerifiedCardImage {
  /** Signed URL for the smallest usable variant. */
  src: string;
  srcSet: string;
}

let cache: Promise<Map<string, ResolvedCardImage>> | null = null;

async function load(): Promise<Map<string, ResolvedCardImage>> {
  const map = new Map<string, ResolvedCardImage>();

  const { data, error } = await supabase
    .from("card_images")
    .select("card_id, card_image_path, card_image_variants, image_width, image_height")
    .eq("card_image_status", "verified");

  if (error || !data?.length) return map;

  const rows: VerifiedCardImage[] = data.map((r) => ({
    cardId: r.card_id,
    variants: (r.card_image_variants as Record<string, string>) ?? {},
    originalPath: r.card_image_path,
    width: r.image_width,
    height: r.image_height,
  }));

  const paths = [...new Set(rows.flatMap((r) => [...Object.values(r.variants), r.originalPath].filter(Boolean)))] as string[];
  if (paths.length === 0) return map;

  const { data: signed } = await supabase.storage.from("card-images").createSignedUrls(paths, 60 * 60);
  const urlByPath = new Map((signed ?? []).map((s) => [s.path ?? "", s.signedUrl]));

  for (const row of rows) {
    const widths = Object.keys(row.variants)
      .map(Number)
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => a - b);

    const srcSetParts: string[] = [];
    for (const w of widths) {
      const url = urlByPath.get(row.variants[String(w)]);
      if (url) srcSetParts.push(`${url} ${w}w`);
    }

    const fallback =
      (widths.length ? urlByPath.get(row.variants[String(widths[widths.length - 1])]) : undefined) ??
      (row.originalPath ? urlByPath.get(row.originalPath) : undefined);

    if (!fallback) continue;
    map.set(row.cardId, { ...row, src: fallback, srcSet: srcSetParts.join(", ") });
  }

  return map;
}

/** Cached for the page session; safe to call from several components. */
export function getVerifiedCardImages(): Promise<Map<string, ResolvedCardImage>> {
  if (!cache) {
    cache = load().catch(() => new Map<string, ResolvedCardImage>());
  }
  return cache;
}
