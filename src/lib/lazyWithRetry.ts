import { lazy, type ComponentType } from "react";

/**
 * Dynamic imports fail when a new deploy replaces the hashed chunk files the
 * currently-open page was built against ("Failed to fetch dynamically imported
 * module"). Retry once with a cache-busting reload; guard with sessionStorage
 * so a genuinely broken chunk can't cause a reload loop.
 */
const RELOAD_KEY = "lovable:chunk-reload";

export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      const mod = await factory();
      try {
        sessionStorage.removeItem(RELOAD_KEY);
      } catch {
        /* no-op */
      }
      return mod;
    } catch (err) {
      // One quick in-place retry handles transient network blips.
      try {
        return await factory();
      } catch {
        /* fall through to reload */
      }
      let alreadyReloaded = false;
      try {
        alreadyReloaded = sessionStorage.getItem(RELOAD_KEY) === "1";
        sessionStorage.setItem(RELOAD_KEY, "1");
      } catch {
        /* no-op */
      }
      if (!alreadyReloaded) {
        window.location.reload();
        // Never resolves; the page is going away.
        return new Promise<{ default: T }>(() => {});
      }
      throw err;
    }
  });
}
