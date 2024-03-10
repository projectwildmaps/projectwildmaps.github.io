// Tutorials used (and some copy-paste):
// https://dev.to/paco_ita/service-workers-and-caching-strategies-explained-step-3-m4f
// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation
// https://developers.google.com/codelabs/pwa-training/pwa03--going-offline#3


const CACHE_NAME = "pmaps_cache"; // match cache name in offline.js

// precache resources - put in cache without user needing to refresh to use the service worker to do that
// better user experience to be able to use offline mode without requiring a refresh

/*
if you reload after downloading the service worker and use the app enough so that all the resources get cached,
you can use something like the below script run in the browser's console to update this list of precache resources

caches.open("pmaps_cache").then(cache => cache.keys()).then(keys => {
    keys = keys.map(req => req.url)
    keys = keys.map(k => k.replace(/http:\/\/localhost:\d+/, "."))
    keys = keys.filter(k => !k.includes("firestore.googleapis.com"))
    keys.sort()
    console.log(JSON.stringify(keys, null, 4))
})
*/

const precache_resources = [
    "./",
    "./css/dialog.css",
    "./css/info_window.css",
    "./css/main.css",
    "./css/map_controls.css",
    "./css/measure_ui.css",
    "./favicon.ico",
    "./images/backpacker.png",
    "./images/compass.png",
    "./images/info_icon.png",
    "./images/input_form.png",
    "./images/measuring_example.png",
    "./images/mountain.png",
    "./images/point_info.png",
    "./images/ruler.png",
    "./images/wood_sign.png",
    "./index.html",
    "./js/autopan.js",
    "./js/dataInfoWindow.js",
    "./js/dateFilter.js",
    "./js/download.js",
    "./js/getIcon.js",
    "./js/globals_and_config.js",
    "./js/init.js",
    "./js/legend.js",
    "./js/locationChange.js",
    "./js/map_definitions.js",
    "./js/measure.js",
    "./js/newPoint.js",
    "./js/offline.js",
    "./js/trails.js",
    "./manifest.json",
    "./none.png",
    "https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVI.woff2",
    "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc4.woff2",
    "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmSU5fBBc4.woff2",
    "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4.woff2",
    "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2",
    "https://fonts.gstatic.com/s/rocksalt/v22/MwQ0bhv11fWD6QsAVOZrt0M6.woff2",
    "https://maps.googleapis.com/maps/api/mapsjs/gen_204?csp_test=true",
    "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js",
    "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js"
]

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


self.addEventListener("fetch", (event) => {
    event.respondWith(cacheFirstWithRefresh(event.request));
});

// from: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching
async function cacheFirstWithRefresh(request) {
    // fetch from network, but don't wait for it to finish
    const fetchResponsePromise = fetch(request).then(async (networkResponse) => {
        if (request.method === "GET" && networkResponse.ok && !request.url.includes("natGeo") && !request.url.includes("openstreetmap")) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => {
        return Response.error()
    });

    // return network answer if cache miss
    return (await caches.match(request)) || (await fetchResponsePromise);
}