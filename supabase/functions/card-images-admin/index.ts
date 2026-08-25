// Admin-only card artwork ingestion + approval.
//
// This function is the ONLY place that talks to Firecrawl or to the
// `card-images` storage bucket. Nothing here is reachable without an
// authenticated account carrying the `admin` role.
//
// It deliberately knows nothing about conversion rules: the card catalogue is
// passed in by the admin page (which owns `src/data/milesCalculator.ts`), so
// there is no duplicate card database.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import { decode as decodeImage, Image } from "https://deno.land/x/imagescript@1.2.17/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
const GATEWAY = "https://connector-gateway.lovable.dev/firecrawl/v2";

const BUCKET = "card-images";
const MAX_INGEST_BATCH = 10;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const VARIANT_WIDTHS = [160, 320, 640];
const LOCK_MINUTES = 5;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

/* ------------------------------- schemas ------------------------------- */

const CardSchema = z.object({
  cardId: z.string().min(1).max(120),
  bankId: z.string().min(1).max(60),
  bankName: z.string().min(1).max(120),
  cardName: z.string().min(1).max(200),
  officialSourceUrl: z.string().url().optional(),
  bankRewardsUrl: z.string().url().optional(),
});
type CardInput = z.infer<typeof CardSchema>;

const BodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("sync"), cards: z.array(CardSchema).min(1).max(2000) }),
  z.object({ action: z.literal("ingest"), cards: z.array(CardSchema).min(1).max(MAX_INGEST_BATCH) }),
  z.object({
    action: z.literal("approve"),
    cardId: z.string().min(1),
    cardName: z.string().min(1),
    candidateId: z.string().uuid(),
  }),
  z.object({ action: z.literal("reject"), cardId: z.string().min(1), candidateId: z.string().uuid() }),
  z.object({
    action: z.literal("upload"),
    cardId: z.string().min(1),
    cardName: z.string().min(1),
    fileBase64: z.string().min(16).max(12_000_000),
    contentType: z.string().min(3).max(80),
    sourceUrl: z.string().url().optional(),
  }),
]);

/* ------------------------------- helpers ------------------------------- */

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sha256(bytes: Uint8Array | string): Promise<string> {
  const data = typeof bytes === "string" ? new TextEncoder().encode(bytes) : bytes;
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function tokens(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((t) => t.length > 2 && !["the", "card", "credit", "bank"].includes(t));
}

const BAD_IMAGE_HINTS = [
  "logo", "icon", "favicon", "sprite", "avatar", "banner", "placeholder",
  "arrow", "chevron", "footer", "header-", "social", "apple-touch",
];

function looksLikeCardArtwork(url: string): boolean {
  const lower = url.toLowerCase();
  if (lower.startsWith("data:")) return false;
  if (lower.endsWith(".svg") || lower.includes(".svg?")) return false;
  if (BAD_IMAGE_HINTS.some((h) => lower.includes(h))) return false;
  return /\.(png|jpe?g|webp|avif)(\?|$)/.test(lower) || lower.includes("/image");
}

function absolutize(src: string, base: string): string | null {
  try {
    return new URL(src, base).toString();
  } catch {
    return null;
  }
}

/** Pull candidate artwork URLs out of a scraped page. */
function extractCandidates(html: string, metadata: Record<string, unknown>, pageUrl: string) {
  const found = new Map<string, { url: string; method: string; score: number }>();

  const add = (raw: string | undefined | null, method: string, base: number) => {
    if (!raw) return;
    const abs = absolutize(raw.trim(), pageUrl);
    if (!abs || !looksLikeCardArtwork(abs)) return;
    const existing = found.get(abs);
    if (!existing || existing.score < base) found.set(abs, { url: abs, method, score: base });
  };

  const meta = metadata ?? {};
  add(meta["ogImage"] as string, "og_image", 60);
  add(meta["og:image"] as string, "og_image", 60);
  add(meta["twitter:image"] as string, "twitter_image", 50);

  // JSON-LD "image"
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const raw = JSON.parse(m[1]);
      const walk = (node: unknown) => {
        if (!node) return;
        if (Array.isArray(node)) return node.forEach(walk);
        if (typeof node !== "object") return;
        const obj = node as Record<string, unknown>;
        if (typeof obj.image === "string") add(obj.image, "structured_data", 55);
        if (Array.isArray(obj.image)) obj.image.forEach((i) => typeof i === "string" && add(i, "structured_data", 55));
        Object.values(obj).forEach(walk);
      };
      walk(raw);
    } catch {
      // ignore malformed JSON-LD
    }
  }

  // Prominent <img> elements
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const src =
      tag.match(/\bsrc=["']([^"']+)["']/i)?.[1] ??
      tag.match(/\bdata-src=["']([^"']+)["']/i)?.[1] ??
      tag.match(/\bsrcset=["']([^"'\s]+)/i)?.[1];
    const alt = tag.match(/\balt=["']([^"']*)["']/i)?.[1] ?? "";
    add(src, "product_image", 20);
    const abs = src ? absolutize(src, pageUrl) : null;
    if (abs && found.has(abs) && alt) {
      const entry = found.get(abs)!;
      entry.score += Math.min(alt.length > 0 ? 5 : 0, 5);
      // remember the alt text for name matching
      (entry as { alt?: string }).alt = alt;
    }
  }

  return [...found.values()];
}

async function firecrawlScrape(url: string) {
  if (!LOVABLE_API_KEY || !FIRECRAWL_API_KEY) {
    throw new Error("Firecrawl connection is not configured");
  }
  const res = await fetch(`${GATEWAY}/scrape`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": FIRECRAWL_API_KEY,
    },
    body: JSON.stringify({ url, formats: ["rawHtml"], onlyMainContent: false }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`[${res.status}] ${text.slice(0, 400)}`);
  const parsed = JSON.parse(text);
  const data = parsed.data ?? parsed;
  return {
    html: (data.rawHtml ?? data.html ?? "") as string,
    metadata: (data.metadata ?? {}) as Record<string, unknown>,
    statusCode: (data.metadata?.statusCode ?? res.status) as number,
  };
}

/* ------------------------------- actions ------------------------------- */

async function syncCards(cards: CardInput[]) {
  const { data: existing } = await admin.from("card_images").select("card_id, card_name, card_image_status");
  const byId = new Map((existing ?? []).map((r) => [r.card_id, r]));

  const inserts = cards
    .filter((c) => !byId.has(c.cardId))
    .map((c) => ({
      card_id: c.cardId,
      bank_id: c.bankId,
      card_name: c.cardName,
      card_image_source_url: c.officialSourceUrl ?? c.bankRewardsUrl ?? null,
      card_image_status: "needs_review",
    }));

  if (inserts.length) {
    const { error } = await admin.from("card_images").insert(inserts);
    if (error) throw new Error(error.message);
  }

  // A renamed card must never keep another card's approved artwork silently.
  let renamed = 0;
  for (const c of cards) {
    const row = byId.get(c.cardId);
    if (row && row.card_name !== c.cardName) {
      await admin
        .from("card_images")
        .update({
          card_name: c.cardName,
          card_image_status: row.card_image_status === "verified" ? "stale" : row.card_image_status,
          review_notes: `Card renamed from "${row.card_name}" — artwork must be re-checked.`,
        })
        .eq("card_id", c.cardId);
      renamed++;
    }
  }

  return { created: inserts.length, renamed, total: cards.length };
}

async function ingestCards(cards: CardInput[]) {
  const results: Record<string, string>[] = [];

  for (const card of cards) {
    const attempts: { url: string; type: string }[] = [];
    if (card.officialSourceUrl) attempts.push({ url: card.officialSourceUrl, type: "official_card_page" });
    if (card.bankRewardsUrl && card.bankRewardsUrl !== card.officialSourceUrl) {
      attempts.push({ url: card.bankRewardsUrl, type: "official_bank_catalogue" });
    }

    if (attempts.length === 0) {
      await admin
        .from("card_images")
        .update({
          card_image_status: "not_found",
          last_checked_at: new Date().toISOString(),
          review_notes: "No official source URL on record for this card.",
        })
        .eq("card_id", card.cardId)
        .neq("card_image_status", "verified");
      results.push({ cardId: card.cardId, outcome: "no_source" });
      continue;
    }

    const { data: current } = await admin
      .from("card_images")
      .select("card_image_status, source_content_hash")
      .eq("card_id", card.cardId)
      .maybeSingle();

    let collected: { url: string; method: string; score: number; sourceUrl: string; sourceType: string }[] = [];
    let pageHash: string | null = null;
    let failure: string | null = null;

    for (const attempt of attempts) {
      try {
        const page = await firecrawlScrape(attempt.url);
        if (!pageHash) pageHash = await sha256(page.html);
        const found = extractCandidates(page.html, page.metadata, attempt.url);
        const cardTokens = tokens(card.cardName);
        for (const f of found) {
          const hay = `${f.url} ${(f as { alt?: string }).alt ?? ""}`.toLowerCase();
          const hits = cardTokens.filter((t) => hay.includes(t)).length;
          collected.push({
            ...f,
            score: f.score + hits * 25,
            sourceUrl: attempt.url,
            sourceType: attempt.type,
          });
        }
        if (collected.some((c) => c.score >= 45)) break;
      } catch (err) {
        failure = err instanceof Error ? err.message : String(err);
      }
    }

    collected = collected
      .sort((a, b) => b.score - a.score)
      .filter((c, i, arr) => arr.findIndex((x) => x.url === c.url) === i)
      .slice(0, 6);

    const now = new Date().toISOString();
    const verified = current?.card_image_status === "verified";
    const materiallyChanged = Boolean(
      verified && pageHash && current?.source_content_hash && current.source_content_hash !== pageHash,
    );
    const sourceGone = Boolean(verified && failure && !pageHash);

    if (verified) {
      await admin
        .from("card_images")
        .update({
          last_checked_at: now,
          source_content_hash: pageHash ?? current?.source_content_hash ?? null,
          card_image_status: materiallyChanged || sourceGone ? "stale" : "verified",
          review_notes: sourceGone
            ? `Official source could not be reached: ${failure}`
            : materiallyChanged
              ? "Official source page changed materially since approval — re-check the artwork."
              : null,
        })
        .eq("card_id", card.cardId);
      results.push({ cardId: card.cardId, outcome: sourceGone ? "source_gone" : materiallyChanged ? "stale" : "unchanged" });
      continue;
    }

    if (collected.length) {
      await admin.from("card_image_candidates").upsert(
        collected.map((c) => ({
          card_id: card.cardId,
          image_url: c.url,
          source_url: c.sourceUrl,
          source_type: c.sourceType,
          discovery_method: c.method,
          score: c.score,
          status: "pending",
        })),
        { onConflict: "card_id,image_url", ignoreDuplicates: true },
      );
    }

    await admin
      .from("card_images")
      .update({
        card_image_status: collected.length ? "needs_review" : "not_found",
        card_image_source_url: attempts[0].url,
        source_content_hash: pageHash,
        last_checked_at: now,
        review_notes: collected.length ? null : failure ?? "No candidate artwork found on the official source.",
      })
      .eq("card_id", card.cardId);

    results.push({ cardId: card.cardId, outcome: collected.length ? `candidates:${collected.length}` : "not_found" });
  }

  return { processed: results.length, results };
}

/** Resize onto a transparent canvas, preserving the full artwork + aspect ratio. */
async function buildVariants(bytes: Uint8Array, cardId: string, hash: string) {
  const stored: Record<string, string> = {};
  let width: number | null = null;
  let height: number | null = null;

  try {
    const decoded = await decodeImage(bytes);
    const source = decoded instanceof Image ? decoded : null;
    if (source) {
      width = source.width;
      height = source.height;
      for (const w of VARIANT_WIDTHS) {
        if (w > source.width) continue;
        const clone = source.clone().resize(w, Image.RESIZE_AUTO);
        const canvas = new Image(clone.width, clone.height); // transparent
        canvas.composite(clone, 0, 0);
        const png = await canvas.encode(6);
        const path = `cards/${cardId}/${hash.slice(0, 12)}-${w}.png`;
        const { error } = await admin.storage
          .from(BUCKET)
          .upload(path, png, { contentType: "image/png", upsert: true, cacheControl: "31536000" });
        if (error) throw new Error(error.message);
        stored[String(w)] = path;
      }
    }
  } catch (err) {
    console.error("variant generation skipped:", err instanceof Error ? err.message : err);
  }

  return { variants: stored, width, height };
}

async function storeApprovedImage(opts: {
  cardId: string;
  cardName: string;
  bytes: Uint8Array;
  contentType: string;
  originUrl: string | null;
  sourceUrl: string | null;
  sourceType: string;
}) {
  const { data: row } = await admin
    .from("card_images")
    .select("card_id, card_name")
    .eq("card_id", opts.cardId)
    .maybeSingle();

  if (!row) throw new Error("Unknown card id");
  // Identity guard: the image is bound to the exact card id AND its exact name.
  if (row.card_name !== opts.cardName) {
    throw new Error(
      `Card name mismatch for ${opts.cardId}: stored "${row.card_name}" vs submitted "${opts.cardName}". Run sync first.`,
    );
  }

  const hash = await sha256(opts.bytes);

  const { data: clash } = await admin
    .from("card_images")
    .select("card_id")
    .eq("image_sha256", hash)
    .eq("card_image_status", "verified")
    .neq("card_id", opts.cardId)
    .maybeSingle();
  if (clash) {
    throw new Error(`That exact image is already the verified artwork for "${clash.card_id}". Reuse is blocked.`);
  }

  const ext = opts.contentType.includes("png")
    ? "png"
    : opts.contentType.includes("webp")
      ? "webp"
      : opts.contentType.includes("avif")
        ? "avif"
        : "jpg";
  const originalPath = `cards/${opts.cardId}/${hash.slice(0, 12)}-original.${ext}`;
  const up = await admin.storage
    .from(BUCKET)
    .upload(originalPath, opts.bytes, { contentType: opts.contentType, upsert: true, cacheControl: "31536000" });
  if (up.error) throw new Error(up.error.message);

  const { variants, width, height } = await buildVariants(opts.bytes, opts.cardId, hash);

  const { error } = await admin
    .from("card_images")
    .update({
      card_image_path: originalPath,
      card_image_variants: variants,
      card_image_origin_url: opts.originUrl,
      card_image_source_url: opts.sourceUrl,
      card_image_source_type: opts.sourceType,
      card_image_status: "verified",
      card_image_verified_at: new Date().toISOString(),
      last_checked_at: new Date().toISOString(),
      image_sha256: hash,
      image_width: width,
      image_height: height,
      review_notes: null,
    })
    .eq("card_id", opts.cardId);
  if (error) throw new Error(error.message);

  return { path: originalPath, variants };
}

async function downloadImage(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": "SamralCardImageBot/1.0" } });
  if (!res.ok) throw new Error(`Download failed [${res.status}]`);
  const contentType = (res.headers.get("content-type") ?? "").split(";")[0].trim();
  if (!contentType.startsWith("image/")) throw new Error(`Not an image (${contentType || "unknown"})`);
  const buf = new Uint8Array(await res.arrayBuffer());
  if (buf.byteLength > MAX_IMAGE_BYTES) throw new Error("Image is larger than 8MB");
  if (buf.byteLength < 512) throw new Error("Image is suspiciously small");
  return { bytes: buf, contentType };
}

/* -------------------------------- entry -------------------------------- */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // --- auth: signed-in admin only -----------------------------------------
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Not authenticated" }, 401);

  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) return json({ error: "Not authenticated" }, 401);

  const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
  if (!isAdmin) return json({ error: "Admin access required" }, 403);

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch (err) {
    return json({ error: "Invalid request", details: err instanceof z.ZodError ? err.flatten() : String(err) }, 400);
  }

  try {
    if (body.action === "sync") {
      return json(await syncCards(body.cards));
    }

    if (body.action === "ingest") {
      // Single-flight lock: a second run exits instead of doubling the crawl.
      const expires = new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString();
      const { error: lockErr } = await admin
        .from("job_locks")
        .insert({ job_name: "card_image_ingest", expires_at: expires });
      if (lockErr) {
        const { data: lock } = await admin
          .from("job_locks")
          .select("expires_at")
          .eq("job_name", "card_image_ingest")
          .maybeSingle();
        if (lock && new Date(lock.expires_at) > new Date()) {
          return json({ error: "An ingestion run is already in progress." }, 409);
        }
        await admin.from("job_locks").update({ locked_at: new Date().toISOString(), expires_at: expires })
          .eq("job_name", "card_image_ingest");
      }
      try {
        return json(await ingestCards(body.cards));
      } finally {
        await admin.from("job_locks").delete().eq("job_name", "card_image_ingest");
      }
    }

    if (body.action === "reject") {
      await admin
        .from("card_image_candidates")
        .update({ status: "rejected" })
        .eq("id", body.candidateId)
        .eq("card_id", body.cardId);
      const { count } = await admin
        .from("card_image_candidates")
        .select("id", { count: "exact", head: true })
        .eq("card_id", body.cardId)
        .eq("status", "pending");
      if (!count) {
        await admin
          .from("card_images")
          .update({ card_image_status: "not_found", review_notes: "All candidates rejected." })
          .eq("card_id", body.cardId)
          .neq("card_image_status", "verified");
      }
      return json({ ok: true });
    }

    if (body.action === "approve") {
      const { data: candidate } = await admin
        .from("card_image_candidates")
        .select("*")
        .eq("id", body.candidateId)
        .eq("card_id", body.cardId)
        .maybeSingle();
      if (!candidate) return json({ error: "Candidate not found for this card" }, 404);

      const { bytes, contentType } = await downloadImage(candidate.image_url);
      const stored = await storeApprovedImage({
        cardId: body.cardId,
        cardName: body.cardName,
        bytes,
        contentType,
        originUrl: candidate.image_url,
        sourceUrl: candidate.source_url,
        sourceType: candidate.source_type,
      });
      await admin.from("card_image_candidates").update({ status: "approved" }).eq("id", candidate.id);
      await admin
        .from("card_image_candidates")
        .update({ status: "rejected" })
        .eq("card_id", body.cardId)
        .eq("status", "pending");
      return json({ ok: true, ...stored });
    }

    if (body.action === "upload") {
      if (!body.contentType.startsWith("image/")) return json({ error: "Only image uploads are accepted" }, 400);
      const binary = Uint8Array.from(atob(body.fileBase64), (c) => c.charCodeAt(0));
      if (binary.byteLength > MAX_IMAGE_BYTES) return json({ error: "Image is larger than 8MB" }, 400);
      const stored = await storeApprovedImage({
        cardId: body.cardId,
        cardName: body.cardName,
        bytes: binary,
        contentType: body.contentType,
        originUrl: null,
        sourceUrl: body.sourceUrl ?? null,
        sourceType: "manual_upload",
      });
      return json({ ok: true, ...stored });
    }

    return json({ error: "Unsupported action" }, 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("card-images-admin failed:", message);
    return json({ error: message }, 500);
  }
});
