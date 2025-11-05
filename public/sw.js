const CACHE_NAME = "lets-connect-v2"
const urlsToCache = ["/manifest.json", "/icon-192.jpg", "/icon-512.jpg"]

// Install event - cache essential files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[v0] Opened cache")
      return cache.addAll(urlsToCache)
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[v0] Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Only cache GET requests
  if (event.request.method !== "GET") return

  const url = new URL(event.request.url)

  // Ignore Next.js HMR/hot-update chunks and dev client
  if (
    url.pathname.startsWith("/_next/") &&
    (url.pathname.includes("hot-update") || url.pathname.includes("app-next-dev"))
  ) {
    return
  }

  // Don't cache the root page during development to see changes immediately
  if (url.pathname === "/") {
    event.respondWith(fetch(event.request))
    return
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      // Try cache first
      const cached = await cache.match(event.request)
      if (cached) return cached

      // Fetch network and cache safely
      const response = await fetch(event.request)
      try {
        // Only cache successful responses
        if (response && response.status === 200 && response.type === "basic") {
          await cache.put(event.request, response.clone())
        }
      } catch (err) {
        // Safely ignore caching errors (e.g., opaque responses)
        console.log("[v0] Cache put failed:", err)
      }
      return response
    })()
  )
})
