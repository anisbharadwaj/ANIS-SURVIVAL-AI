const CACHE_NAME = "anis-survival-cache-v1";
const OFFLINE_URL = "/";

// Core assets to pre-cache immediately
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon.png",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
];

// Install Event - Pre-cache core shell assets robustly
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching offline app shell");
      // Use Promise.allSettled to ensure that one asset failure does not crash service worker installation
      return Promise.allSettled(
        PRECACHE_ASSETS.map((asset) => {
          return cache.add(asset)
            .then(() => console.log(`[Service Worker] Pre-cache succeeded for: ${asset}`))
            .catch((err) => console.warn(`[Service Worker] Pre-cache failed for: ${asset}`, err));
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper to determine if a request should be cached
function shouldCache(request) {
  const url = new URL(request.url);
  // Cache requests from our own origin, or external CDNs/fonts
  return (
    url.origin === self.location.origin ||
    url.hostname.includes("unpkg.com") ||
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com")
  );
}

// Fetch Event - Stale-While-Revalidate Strategy for maximum offline speed and freshness
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Bypass API routes (server-side calls like Gemini /api/...)
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Bypass chrome-extension or other non-http(s) schemes
  if (!url.protocol.startsWith("http")) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // If response is valid, update the cache in the background
          if (networkResponse && networkResponse.status === 200 && shouldCache(event.request)) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch((err) => {
          console.warn("[Service Worker] Network request failed, using cache-fallback:", err);
          // If both fail and this is a page navigation, return the root offline shell
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
          throw err;
        });

      // Return cached response instantly if found, else wait for network
      return cachedResponse || fetchPromise;
    })
  );
});

// Push Notification Event Listener Structure (Future Ready)
self.addEventListener("push", (event) => {
  let data = { title: "ANIS SURVIVAL AI Alert", body: "Emergency Broadcast Received." };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "ANIS SURVIVAL AI Alert", body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: "/icon.png",
    badge: "/icon.png",
    vibrate: [200, 100, 200, 100, 400],
    data: {
      url: data.url || "/"
    },
    actions: [
      { action: "open_app", title: "Open Tactical Dashboard" },
      { action: "dismiss", title: "Dismiss" }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Push Notification Action handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action !== "dismiss") {
    const targetUrl = event.notification.data?.url || "/";
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((windowClients) => {
        // If a window is already open, focus it
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
    );
  }
});

// Listen for messages from the front end (e.g. for forced caching or cache purging)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
