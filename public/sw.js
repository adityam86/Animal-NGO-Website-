const CACHE_NAME = "ayudar-pwa-v4";
const STATIC_ASSETS = [
  "/images/logo.jpg",
  "/images/hero_banner.jpg",
  "/images/cow_lakshmi.jpg",
  "/images/dog_bruno.jpg",
  "/manifest.json",
];

// 1. Install event: Pre-cache static image & manifest assets only
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("PWA: Some static assets failed to pre-cache:", err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Activate event: Purge stale caches immediately (e.g., ayudar-pwa-v2)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

function buildOfflineHotlineResponse() {
  return new Response(
    `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Ayudar — Offline Emergency Support</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #FAF7F2; color: #1A2820; padding: 2rem 1.5rem; text-align: center; }
        .card { max-width: 440px; margin: 2rem auto; background: white; border-radius: 8px; padding: 2.25rem 1.5rem; border: 1px solid #E2DACB; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
        .btn { display: inline-block; background: #B83232; color: white; padding: 0.9rem 1.6rem; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 1rem; margin-top: 1.25rem; }
        .phone { font-size: 1.5rem; font-weight: 800; color: #B83232; margin: 1rem 0; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>You are currently offline</h2>
        <p style="color: #495A51; line-height: 1.6;">Internet connection is unavailable, but our emergency rescue hotline can still be dialed directly.</p>
        <div class="phone">+91 73840 20901</div>
        <p style="font-size: 0.85rem; color: #66756D;">Ayudar Shelter (Animal Hospital) · Tilabad, Kumarpur, Asansol 713304</p>
        <a href="tel:+917384020901" class="btn">Call Emergency Dispatch Now</a>
      </div>
    </body>
    </html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

// 3. Fetch event: Network-First for pages & Next.js assets; Cache-First only for /images/
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/admin") ||
    url.pathname === "/login"
  ) {
    return;
  }

  // Static sanctuary photos can use cache-then-network cleanly
  if (url.pathname.startsWith("/images/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return res;
        });
      })
    );
    return;
  }

  // HTML navigations & JS/CSS bundles MUST ALWAYS prefer fresh network builds
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedPage) => cachedPage || buildOfflineHotlineResponse());
        })
    );
  }
});
