let polyline_coords = []    // list of LatLng objects
let polyline;

function initDistanceMeasurement() {
    let measure_control = document.getElementById("measure_control")
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(measure_control);


    // open and close event handlers
    measure_control.addEventListener("click", () => {
        document.querySelector("#measure_ui.show") ? closeMeasureUI() : openMeasureUI();
    });
    document.addEventListener("keydown", e => {
        if (e.key == "Escape") closeMeasureUI();
    });
    document.getElementById("close_measure_ui").addEventListener("click", closeMeasureUI);


    // init the polyline, we will use polyline.setPath() to mess with it
    polyline = new google.maps.Polyline({
        path: polyline_coords,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 4,
        clickable: false
    });
    polyline.setMap(map);


    // creating and removing points
    map.addListener("click", e => {
        if (!document.querySelector("#measure_ui.show")) return;
        polyline_coords.push(e.latLng);
        updatePolyline();
    });
    document.addEventListener("keypress", e => {
        if (e.code == "KeyZ" && e.ctrlKey && document.querySelector("#measure_ui.show")) undoPolylineStep();
    });
    document.getElementById("undo_polyline_point").addEventListener("click", undoPolylineStep);
}


function openMeasureUI() {
    let measure_ui = document.getElementById("measure_ui");
    measure_ui.classList.add("show");
    markerLayer.setMap(null);
    usersMarker.setMap(null);
    map.setOptions({ draggableCursor: 'default' });
}

function closeMeasureUI() {
    if (!document.querySelector("#measure_ui.show")) return;    // prevent weird Escape key behavior and excess event listeners

    let measure_ui = document.getElementById("measure_ui");
    measure_ui.classList.add("hide");
    measure_ui.addEventListener("animationend", () => {
        measure_ui.classList.remove("show", "hide");
        document.getElementById("measure_instructions").style.display = "block";
        document.getElementById("measure_results").style.display = "none";
        polyline_coords = [];
        updatePolyline();
    }, { once: true });

    markerLayer.setMap(map);
    usersMarker.setMap(map);
    map.setOptions({ draggableCursor: null });
}


function updatePolyline() {

    polyline.setPath(polyline_coords);

    // calculate distance
    let total_miles = 0;
    for (let i = 1; i < polyline_coords.length; i++) {
        total_miles += haversine_distance(polyline_coords[i - 1], polyline_coords[i])
    }
    document.getElementById("length_measurement").textContent = total_miles.toFixed(2);

    if (polyline_coords.length >= 2) {
        document.getElementById("measure_instructions").style.display = "none";
        document.getElementById("measure_results").style.display = "block";
    }
}


function undoPolylineStep() {
    polyline_coords.pop();
    updatePolyline();
}



// function to calculate distance on a sphere in miles
// code adapted from this tutorial: https://cloud.google.com/blog/products/maps-platform/how-calculate-distances-map-maps-javascript-api

function haversine_distance(latlng1, latlng2) {
    var R = 3958.8; // Radius of the Earth in miles
    var rlat1 = latlng1.lat() * (Math.PI / 180); // Convert degrees to radians
    var rlat2 = latlng2.lat() * (Math.PI / 180); // Convert degrees to radians
    var difflat = rlat2 - rlat1; // Radian difference (latitudes)
    var difflon = (latlng2.lng() - latlng1.lng()) * (Math.PI / 180); // Radian difference (longitudes)

    var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat / 2) * Math.sin(difflat / 2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2)));
    return d;
}




// ELEVATION STUFF ----------------------------------------------------------------

// async function loadPisgahElevation() {
//     const tiff = await GeoTIFF.fromUrl(pisgah_elevation_filename);
//     const image = await tiff.getImage();
//     const data = await image.readRasters();
// }

async function readElevation(lat, lng) {
    const tiff = await GeoTIFF.fromUrl(pisgah_elevation_filename);
    const image = await tiff.getImage();

    // method from this tutorial: https://towardsdatascience.com/geotiff-coordinate-querying-with-javascript-5e6caaaf88cf
    // note that our geotiff is in NAD83, which is in geographic coordinates so this sort of linear interpolation is correct
    // also note that NAD83 is very similar to WGS84 (the datum that google maps uses) - typically within a meter, so we don't need to reproject
    bbox = image.getBoundingBox();
    lng_deg_range = bbox[2] - bbox[0];
    lat_deg_range = bbox[3] - bbox[1];
    lng_percent = (lng - bbox[0]) / lng_deg_range;
    lat_percent = (lat - bbox[1]) / lat_deg_range;
    x_pixel_index = Math.floor(image.getWidth() * lng_percent);
    y_pixel_index = Math.floor(image.getHeight() * (1-lat_percent));
    one_pixel_window = [x_pixel_index, y_pixel_index, x_pixel_index + 1, y_pixel_index + 1];
    result = await image.readRasters({ window: one_pixel_window });
    elevation_meters = result[0][0];
    elevation_feet = elevation_meters * 3.2808399;
    console.log(elevation_feet, "ft");
}