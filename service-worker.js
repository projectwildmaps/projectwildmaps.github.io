// Tutorials used (and some copy-paste):
// https://dev.to/paco_ita/service-workers-and-caching-strategies-explained-step-3-m4f
// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation
// https://developers.google.com/codelabs/pwa-training/pwa03--going-offline#3

const CACHE_NAME = "pmaps_cache"; // match cache name in offline.js
const precache_resources = [
    "/",
    "/index.html"
];

// When the service worker is installing, open the cache and add the precache resources to it
self.addEventListener("install", (event) => {
    console.log("Service worker install event");
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(precache_resources))
    );
});

self.addEventListener("activate", (event) => {
    console.log("Service worker activate event");
});


// adopted from https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (request.method === "GET" && networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        return cachedResponse || Response.error();
    }
}


async function cacheFirst(request) {
    // First try to get the resource from the cache.
    const response_from_cache = await caches.match(request);
    if (response_from_cache) {
        return response_from_cache;
    }

    // If the response was not found in the cache,
    // try to get the resource from the network.
    try {
        const response_from_network = await fetch(request);

        // If the network request succeeded, clone the response:
        // - put one copy in the cache, for the next time
        // - return the original to the app
        // Cloning is needed because a response can only be consumed once.
        // Only do this for http / https, because schemes like chrome-extension:// causes errors

        // if (request.url.startsWith("http://") || request.url.startsWith("https://")) {
        //     const response_clone = response_from_network.clone();
        //     caches.open(CACHE_NAME).then((cache) => {
        //         cache.put(request, response_clone)
        //             .catch((error) => {
        //                 console.log("Error adding to cache:", request, response_clone);
        //                 throw error;
        //             });
        //     });
        // }

        return response_from_network;

    } catch (error) {
        console.log("Cache and network requests failed", request);

        // If the network request failed,
        // get the fallback response from the cache.

        // const fallbackResponse = await caches.match(fallbackUrl);
        // if (fallbackResponse) {
        //     return fallbackResponse;
        // }

        // When even the fallback response is not available,
        // there is nothing we can do, but we must always
        // return a Response object.
        return new Response("Network error happened", {
            status: 408,
            headers: { "Content-Type": "text/plain" },
        });
    }
};


self.addEventListener("fetch", (event) => {
    event.respondWith(handleFetch(event.request));
});


async function handleFetch(request) {
    try {
        const networkResponse = await fetch(request);
        if (request.method === "GET" && networkResponse.ok && !request.url.includes("natGeo") && !request.url.includes("openstreetmap")) {
            // add to cache
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        return cachedResponse || Response.error();
    }
}



self.addEventListener("message", async (event) => {
    console.log("service worker received message:", event.data);
    // data should have format {msgId: int, message: ___}
    const message = event.data.message;
});