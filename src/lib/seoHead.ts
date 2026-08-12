// Client-side head management for article routes.
// Applies title, description, canonical, Open Graph and JSON-LD, and restores
// the sitewide values on unmount so no route leaks metadata into another.

export interface SeoHeadOptions {
  title: string;
  description: string;
  canonical: string;
  ogType?: string;
  ogTitle?: string;
  ogDescription?: string;
  jsonLd?: unknown[];
}

const MANAGED = "data-samral-seo";

function setMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    tag.setAttribute(MANAGED, "");
    document.head.appendChild(tag);
  }
  const previous = tag.getAttribute("content");
  tag.setAttribute("content", content);
  return () => {
    if (tag!.hasAttribute(MANAGED)) tag!.remove();
    else if (previous !== null) tag!.setAttribute("content", previous);
  };
}

export function applySeoHead(o: SeoHeadOptions): () => void {
  const cleanups: Array<() => void> = [];

  const previousTitle = document.title;
  document.title = o.title;
  cleanups.push(() => {
    document.title = previousTitle;
  });

  cleanups.push(setMeta('meta[name="description"]', "name", "description", o.description));
  cleanups.push(
    setMeta('meta[property="og:title"]', "property", "og:title", o.ogTitle ?? o.title),
  );
  cleanups.push(
    setMeta(
      'meta[property="og:description"]',
      "property",
      "og:description",
      o.ogDescription ?? o.description,
    ),
  );
  cleanups.push(setMeta('meta[property="og:url"]', "property", "og:url", o.canonical));
  cleanups.push(
    setMeta('meta[property="og:type"]', "property", "og:type", o.ogType ?? "article"),
  );
  cleanups.push(
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", o.ogTitle ?? o.title),
  );
  cleanups.push(
    setMeta(
      'meta[name="twitter:description"]',
      "name",
      "twitter:description",
      o.ogDescription ?? o.description,
    ),
  );

  // Canonical
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  const previousHref = link?.getAttribute("href") ?? null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", o.canonical);
  cleanups.push(() => {
    if (previousHref) link!.setAttribute("href", previousHref);
    else link!.remove();
  });

  // JSON-LD
  for (const block of o.jsonLd ?? []) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute(MANAGED, "");
    script.textContent = JSON.stringify(block);
    document.head.appendChild(script);
    cleanups.push(() => script.remove());
  }

  return () => cleanups.forEach((fn) => fn());
}
