const CACHE_NAME = "ayudar-pwa-v1";
const STATIC_ASSETS = [
  "/",
  "/rescue",
  "/animals",
  "/stories",
  "/donate",
  "/images/logo.jpg",
  "/images/hero_banner.jpg",
  "/images/rescue_story_banner.jpg",
  "/manifest.json"
];

// 1. Install event: Cache critical shell assets
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

// 2. Activate event: Clean up legacy caches
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

// 3. Fetch event: Stale-While-Revalidate with Offline Hotline Fallback
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Don't intercept API calls or non-GET requests
  if (request.method !== "GET" || request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If network failed and we have no cached page:
          if (request.mode === "navigate") {
            return caches.match("/").then((root) => {
              if (root) return root;
              // Emergency fallback offline HTML with Hotline
              return new Response(
                `<!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="utf-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                  <title>Ayudar - Offline Emergency Support</title>
                  <style>
                    body { font-family: system-ui, -apple-system, sans-serif; background: #fffbf5; color: #1c1917; padding: 2rem 1.5rem; text-align: center; }
                    .card { max-width: 440px; margin: 2rem auto; background: white; border-radius: 1.5rem; padding: 2.5rem 1.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
                    .btn { display: inline-block; background: #dc2626; color: white; padding: 0.9rem 1.8rem; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 1.1rem; margin-top: 1.5rem; }
                    .phone { font-size: 1.6rem; font-weight: 800; color: #dc2626; margin: 1rem 0; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div style="font-size: 3rem; margin-bottom: 0.5rem;">🐾</div>
                    <h2>You are currently offline</h2>
                    <p style="color: #78716c; line-height: 1.6;">You don't have active internet connection, but our emergency rescue hotline is always available.</p>
                    <div class="phone">📞 +91 98000 00000</div>
                    <p style="font-size: 0.85rem; color: #a8a29e;">Raniganj • Asansol • Durgapur Animal Rescue</p>
                    <a href="tel:+919800000000" class="btn">Call Emergency Dispatch Now</a>
                  </div>
                </body>
                </html>`,
                { headers: { "Content-Type": "text/html; charset=utf-8" } }
              );
            });
          }
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
