import { useEffect, useState } from "react";
import { getVerifiedCardImages, type ResolvedCardImage } from "@/lib/cardImages";

/**
 * Renders Samral-hosted official card artwork beside the exact card name.
 *
 * Renders nothing at all when the card has no verified image — the text-only
 * experience is the fallback, never a placeholder or a look-alike image.
 */
export function CardArtwork({
  cardId,
  cardName,
  className = "h-8 w-[52px]",
  sizes = "52px",
}: {
  cardId: string;
  cardName: string;
  className?: string;
  sizes?: string;
}) {
  const [image, setImage] = useState<ResolvedCardImage | null>(null);

  useEffect(() => {
    let cancelled = false;
    getVerifiedCardImages().then((map) => {
      if (!cancelled) setImage(map.get(cardId) ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [cardId]);

  if (!image) return null;

  return (
    <img
      src={image.src}
      srcSet={image.srcSet || undefined}
      sizes={sizes}
      alt={`${cardName} card artwork`}
      loading="lazy"
      decoding="async"
      className={`${className} shrink-0 rounded-[3px] object-contain`}
    />
  );
}
