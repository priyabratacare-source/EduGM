const CACHE_NAME = "edugm-unitools-v3";

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
    "./js/firebase-config.js"
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

    if (request.mode === "navigate") {
        event.respondWith((async () => {
            try {
                const response = await fetch(request);
                if (response && response.ok) {
                    const cache = await caches.open(CACHE_NAME);
                    await cache.put(request, response.clone()).catch(() => {});
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

    // Cache-first for local app assets; network response is cached on first use.
    event.respondWith((async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        try {
            const response = await fetch(request);
            if (response && response.ok && response.type === "basic") {
                const cache = await caches.open(CACHE_NAME);
                await cache.put(request, response.clone()).catch(() => {});
            }
            return response;
        } catch {
            return new Response("This resource is not available offline.", {
                status: 503,
                headers: { "Content-Type": "text/plain; charset=utf-8" }
            });
        }
    })());
});
