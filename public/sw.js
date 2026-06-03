const CACHE = "prospectkit-v2";
const PRECACHE = ["/", "/index.html", "/manifest.json", "/icon-192.svg", "/icon-512.svg"];

function isSupabaseRequest(url) {
  return url.hostname.endsWith("supabase.co") || url.hostname.endsWith("supabase.in");
}

function isStaticAsset(request) {
  return request.destination === "style"
    || request.destination === "script"
    || request.destination === "font"
    || request.destination === "image";
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || isSupabaseRequest(url)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE);
        cache.put("/index.html", response.clone());
        return response;
      } catch {
        return caches.match(request) || caches.match("/index.html");
      }
    })());
    return;
  }

  if (isStaticAsset(request)) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE);
          cache.put(request, response.clone());
        }
        return response;
      } catch {
        return caches.match(request);
      }
    })());
    return;
  }

  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
