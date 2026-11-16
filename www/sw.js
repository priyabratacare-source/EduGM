
const CACHE_NAME = "edugm-unitools-v1";

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

// Install and cache the app shell.
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(APP_FILES);
        })
    );

    self.skipWaiting();
});

// Activate the current cache.
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );

    self.clients.claim();
});

// Serve cached local files when available.
self.addEventListener("fetch", event => {
    const request = event.request;

    if (request.method !== "GET") return;

    const url = new URL(request.url);

    // Do not intercept external Firebase requests.
    if (url.origin !== self.location.origin) return;

    event.respondWith(
        caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request).then(response => {
                if (
                    response &&
                    response.status === 200 &&
                    response.type === "basic"
                ) {
                    const copy = response.clone();

                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, copy);
                    });
                }

                return response;
            }).catch(() => {
                if (request.mode === "navigate") {
                    return caches.match("./index.html");
                }

                return new Response(
                    "This resource is unavailable offline.",
                    {
                        status: 503,
                        headers: {
                            "Content-Type": "text/plain"
                        }
                    }
                );
            });
        })
    );
});
