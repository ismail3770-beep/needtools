/* NeedTools Service Worker — v1
 * Strategy: cache-first static assets, network-first pages, offline fallback.
 * Bump VERSION before each deploy to invalidate old caches.
 */
const VERSION = "v2";
const STATIC_CACHE = `needtools-static-${VERSION}`;
const PAGES_CACHE = `needtools-pages-${VERSION}`;

const STATIC_EXTENSIONS = [".js", ".css", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".woff2", ".ico"];

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("needtools-") && !k.endsWith(VERSION))
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  
  // Bypass cache completely in development to prevent Next.js Hydration mismatches
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
    return;
  }

  if (url.origin !== self.location.origin) return;

  const isStatic =
    STATIC_EXTENSIONS.some((ext) => url.pathname.endsWith(ext)) ||
    url.pathname.startsWith("/_next/static/");

  if (isStatic) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }

  if (request.mode === "navigate" || (request.headers.get("accept") || "").includes("text/html")) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response.ok) {
            const cache = await caches.open(PAGES_CACHE);
            cache.put(request, response.clone());
          }
          return response;
        } catch {
          const cached = await caches.match(request);
          return cached || (await caches.match("/")) || Response.error();
        }
      })()
    );
  }
});
