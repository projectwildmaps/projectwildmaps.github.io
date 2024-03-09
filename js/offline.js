function initOfflineSettings() {
    // set up map control to open modal
    const offline_settings_control = document.getElementById("offline_settings_control");
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(offline_settings_control);
    offline_settings_control.addEventListener("click", function () {
        document.getElementById("offline_settings").showModal();
    });

    // event listeners for downloading / un-downloading maps
    document.querySelectorAll(".map_download_row").forEach(div => {
        div.querySelector(".download_map_button").addEventListener("click", () => {
            div.dataset.state = "loading";
            downloadMap(div.dataset.mapName, () => {div.dataset.state = "downloaded"});
        });
        div.querySelector(".delete_map_button").addEventListener("click", () => {
            div.dataset.state = "loading";
            deleteMap(div.dataset.mapName, () => {div.dataset.state = "not_downloaded"});
        });
    });

    // set up service worker - see service-worker.js
    // note - window will have loaded by this point
    setUpServiceWorker(); // see below

}


// at zoom level 12, x and y ranges for pisgah tiles
const pisgah_z12_x_range = [1104, 1108]; //exclusive end index (makes changing zoom level easier)
const pisgah_z12_y_range = [1616, 1620];

// function to loop through pisgah at a certain zoom, based on region defined at zoom level 12
function getPisgahTileUrls(zoom, getTileUrl) {
    //getTileUrl is a function taking args x,y,z

    const tile_urls = [];

    const x_start = Math.floor(pisgah_z12_x_range[0] * (2 ** (zoom - 12)));
    const x_end = Math.ceil(pisgah_z12_x_range[1] * (2 ** (zoom - 12)));
    const y_start = Math.floor(pisgah_z12_y_range[0] * (2 ** (zoom - 12)));
    const y_end = Math.ceil(pisgah_z12_y_range[1] * (2 ** (zoom - 12)));

    for (let x = x_start; x < x_end; x++) {
        for (let y = y_start; y < y_end; y++) {
            tile_urls.push(getTileUrl(x, y, zoom));
        }
    }
    return tile_urls;
}


function getNatGeoUrls() {
    let urls = [];
    for (let zoom of [12, 13, 14]) {
        const tile_urls = getPisgahTileUrls(zoom, (x, y, z) => `/natGeo/${z}/${x}/${y}.jpg`)
        urls = [...urls, ...tile_urls];
    }
    // filter out missing tiles
    const missing_urls = ['/natGeo/13/2214/3238.jpg', '/natGeo/13/2214/3239.jpg', '/natGeo/13/2215/3232.jpg', '/natGeo/13/2215/3237.jpg', '/natGeo/13/2215/3238.jpg', '/natGeo/13/2215/3239.jpg']
    urls = urls.filter(url => !missing_urls.includes(url));
    return urls;
}


function getUsgsUrls() {
    let urls = [];
    for (let zoom of [12, 13, 14, 15]) {
        const tile_urls = getPisgahTileUrls(zoom, (x, y, z) => `/usgsTiff/${z}/${x}/${y}.png`)
        urls = [...urls, ...tile_urls];
    }
    return urls;
}


async function downloadMap(mapName, callback=undefined) {
    if (mapName === "Nat Geo") {
        const urls_to_download = getNatGeoUrls();
        sendToServiceWorker({ type: "save_to_cache", urls: urls_to_download }, callback);
    }
    if (mapName === "USGS") {
        const urls_to_download = getUsgsUrls();
        // download bit by bit to not overwhelm the service worker
        const chunk_size = 256;
        for (let i = 0; i < urls_to_download.length; i += chunk_size) {
            //only send callback if this is the last chunk
            const callback_to_send = i + chunk_size < urls_to_download.length ? undefined : callback;
            sendToServiceWorker({
                type: "save_to_cache",
                urls: urls_to_download.slice(i, i + chunk_size)
            }, callback_to_send);
            await new Promise(resolve => setTimeout(() => { resolve() }, 500))
        }
    }
}


function deleteMap(mapName, callback=undefined) {
    let urls_to_delete = [];
    if (mapName === "Nat Geo") {
        urls_to_delete = getNatGeoUrls();
    }
    if (mapName === "USGS") {
        urls_to_delete = getUsgsUrls();
    }
    sendToServiceWorker({ type: "delete_from_cache", urls: urls_to_delete }, callback);
}



// service worker stuff

let serviceWorkerMsgId = 0; // increments, used to identify a service worker action so we can execute the correct callback when it finishes
const serviceWorkerCallbacks = {}; // key = msgId, value = callback function

async function setUpServiceWorker() {
    if ("serviceWorker" in navigator) {
        try {
            await navigator.serviceWorker.register("/service-worker.js");
            console.log("Service worker registration succeeded!");
            // set up receiving messages
            navigator.serviceWorker.addEventListener("message", (event) => {
                if("msgId" in event.data && event.data.msgId in serviceWorkerCallbacks){
                    // do the callback and then remove it to save memory
                    serviceWorkerCallbacks[event.data.msgId]();
                    delete serviceWorkerCallbacks[event.data.msgId];
                }
            });
        } catch (err) {
            console.log("Service worker registration failed: ", err);
        }
    }
}

function sendToServiceWorker(message, callback=undefined) {
    navigator.serviceWorker.ready.then(registration => {
        // add identifier to the message so the service worker can tell us when it finished
        const data = {msgId: serviceWorkerMsgId, message: message};
        if(callback){
            // see setUpServiceWorker() for how the callback gets called
            serviceWorkerCallbacks[serviceWorkerMsgId] = callback;
        }
        registration.active.postMessage(data);
        serviceWorkerMsgId++;
    });
}