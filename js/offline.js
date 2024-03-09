function initOfflineSettings() {
    // set up map control to open modal
    const offline_settings_control = document.getElementById("offline_settings_control");
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(offline_settings_control);
    offline_settings_control.addEventListener("click", function () {
        document.getElementById("offline_settings").showModal();
    });

    // event listeners for downloading / un-downloading maps
    document.querySelectorAll(".download_map_button").forEach(button => {
        button.addEventListener("click", () => {
            downloadMap(button.dataset.mapName);
        });
    });
    document.querySelectorAll(".delete_map_button").forEach(button => {
        button.addEventListener("click", () => {
            deleteMap(button.dataset.mapName);
        });
    });
}


// at zoom level 12, x and y ranges for pisgah tiles
const pisgah_z12_x_range = [1104, 1108]; //exclusive end index
const pisgah_z12_y_range = [1616, 1620];

// function to loop through pisgah at a certain zoom based on above config at zoom level 12
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


async function downloadMap(mapName) {
    if (mapName === "Nat Geo") {
        const urls_to_download = getNatGeoUrls();
        sendToServiceWorker({ type: "save_to_cache", urls: urls_to_download });
    }
    if (mapName === "USGS") {
        const urls_to_download = getUsgsUrls();
        // download bit by bit to not overwhelm the service worker
        for (let i = 0; i < urls_to_download.length; i += 256) {
            sendToServiceWorker({ type: "save_to_cache", urls: urls_to_download.slice(i, i + 256) });
            await new Promise(resolve => setTimeout(() => { resolve() }, 500))
        }
    }
}


function deleteMap(mapName) {
    let urls_to_delete = [];
    if (mapName === "Nat Geo") {
        urls_to_delete = getNatGeoUrls();
    }
    if (mapName === "USGS") {
        urls_to_delete = getUsgsUrls();
    }
    for(let url of urls_to_delete){
        sendToServiceWorker({type: "delete_from_cache", url: url})
    }
}


function sendToServiceWorker(data) {
    navigator.serviceWorker.ready.then(registration => {
        registration.active.postMessage(data);
    });
}