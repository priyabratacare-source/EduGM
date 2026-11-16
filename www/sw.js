const CACHE_NAME = "edugm-unitools-v2";

const APP_FILES = [
    "./",
    "./index.html",
    "./tools.html",
    "./about.html",
    "./contact.html",
    "./settings.html",
    "./css/style.css",
    "./js/app.js",
    "./js/tools.js",
    "./js/contact.js",
    "./js/firebase-config.js",
    "./assets/logo.png"
];

self.addEventListener("install", event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(APP_FILES);
        await self.skipWaiting();
    })());
});

self.addEventListener("activate", event => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(
            keys
                .filter(key => key.startsWith("edugm-unitools-") && key !== CACHE_NAME)
                .map(key => caches.delete(key))
        );
        await self.clients.claim();
    })());
});

self.addEventListener("fetch", event => {
    const request = event.request;
    if (request.method !== "GET") return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    // Always try the network first for page navigation so published updates appear.
    if (request.mode === "navigate") {
        event.respondWith((async () => {
            try {
                const response = await fetch(request);
                if (response && response.ok) {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put("./index.html", response.clone()).catch(() => {});
                }
                return response;
            } catch {
                return (await caches.match(request)) ||
                    (await caches.match("./index.html")) ||
                    new Response("EduGM is unavailable offline. Please reconnect and try again.", {
                        status: 503,
                        headers: { "Content-Type": "text/plain; charset=utf-8" }
                    });
            }
        })());
        return;
    }

    // App assets are served from cache immediately, then refreshed from network.
    event.respondWith((async () => {
        const cached = await caches.match(request);
        const networkPromise = fetch(request).then(response => {
            if (response && response.ok && response.type === "basic") {
                caches.open(CACHE_NAME)
                    .then(cache => cache.put(request, response.clone()))
                    .catch(() => {});
            }
            return response;
        });

        if (cached) {
            event.waitUntil(networkPromise.then(() => {}).catch(() => {}));
            return cached;
        }

        try {
            return await networkPromise;
        } catch {
            return new Response("This resource is not available offline.", {
                status: 503,
                headers: { "Content-Type": "text/plain; charset=utf-8" }
            });
        }
    })());
});
