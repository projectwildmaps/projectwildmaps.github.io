let polyline_coords = []    // list of LatLng objects
let polyline;
let elevation_data;
let pisgah_bbox_pixel_width;
let pisgah_bbox_pixel_height;


function initMeasurementFeature() {
    // add the UI to the map so it will still appear in fullscreen mode
    map.getDiv().children[0].append(document.getElementById("measure_ui"));

    let measure_control = document.getElementById("measure_control")
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(measure_control);

    // open and close event handlers
    measure_control.addEventListener("click", () => document.querySelector("#measure_ui.show") ? closeMeasureUI() : openMeasureUI());
    document.addEventListener("keydown", e => { if (e.key == "Escape") closeMeasureUI() });
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
    document.addEventListener("keypress", e => { if (e.code == "KeyZ" && e.ctrlKey && document.querySelector("#measure_ui.show")) undoPolylineStep() });
    document.getElementById("undo_polyline_point").addEventListener("click", undoPolylineStep);

    // elevation setup
    document.getElementById("uphill_arrow").style.color = uphill_color;
    document.getElementById("downhill_arrow").style.color = downhill_color;
    loadPisgahElevation();
}


function openMeasureUI() {
    let measure_ui = document.getElementById("measure_ui");
    measure_ui.classList.add("show");
    //remove things that could capture/divert clicks
    markerLayer.setMap(null);
    usersMarker.setMap(null);
    map.set('styles', [
        {
            featureType: "poi",
            elementType: "labels",
            stylers: [
                { visibility: "off" }
            ]
        },
        {
            featureType: "administrative",
            elementType: "labels",
            stylers: [
                { visibility: "off" }
            ]
        }
    ]);
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
    map.set('styles', []);
    map.setOptions({ draggableCursor: null });
}




function updatePolyline() {

    polyline.setPath(polyline_coords);

    // calculate distance and elevation along the path
    let total_miles = 0;
    let elevation_trajectory = [];
    let missing_elevation_data = false;
    for (let i = 1; i < polyline_coords.length; i++) {
        let segment_elevations = getElevationsAlongSegment(polyline_coords[i - 1], polyline_coords[i]);
        if (segment_elevations === null) missing_elevation_data = true;
        else {
            segment_elevations.forEach(obj => { obj.miles_from_start += total_miles });   // so it's measured from the start of the path, not start of segment
            elevation_trajectory = elevation_trajectory.concat(segment_elevations);
        }

        total_miles += haversine_distance(polyline_coords[i - 1], polyline_coords[i]);
    }
    if (missing_elevation_data) elevation_trajectory = [];

    // process and display distance and elevation
    document.getElementById("length_measurement").textContent = total_miles.toFixed(2);
    let cumulative_elevation_gain = 0;
    let cumulative_elevation_loss = 0;
    for (let i = 1; i < elevation_trajectory.length; i++) {
        const elevation_diff = elevation_trajectory[i].elevation_feet - elevation_trajectory[i - 1].elevation_feet;
        elevation_diff < 0 ? cumulative_elevation_loss += Math.abs(elevation_diff) : cumulative_elevation_gain += elevation_diff;
    }
    document.getElementById("elevation_gain").textContent = Math.round(cumulative_elevation_gain / 10) * 10;
    document.getElementById("elevation_loss").textContent = Math.round(cumulative_elevation_loss / 10) * 10;
    plotElevationTrajectory(elevation_trajectory);

    if (polyline_coords.length >= 2) {
        document.getElementById("measure_instructions").style.display = "none";
        document.getElementById("measure_results").style.display = "block";
    }
    document.getElementById("elevation_results").style.display = elevation_trajectory.length > 0 ? "block" : "none";
    document.getElementById("elevation_unavailable").style.display = elevation_trajectory.length > 0 ? "none" : "block";
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

async function loadPisgahElevation() {
    const tiff = await GeoTIFF.fromUrl(pisgah_elevation_filename);
    const image = await tiff.getImage();
    const bbox = image.getBoundingBox();

    // convert geographic coords of pisgah_bbox to pixel coords
    const bottom_left = latlng_to_pixel(pisgah_bbox[1], pisgah_bbox[0], bbox, image.getWidth(), image.getHeight());
    const top_right = latlng_to_pixel(pisgah_bbox[3], pisgah_bbox[2], bbox, image.getWidth(), image.getHeight());
    const pixel_window = [bottom_left[0], top_right[1], top_right[0], bottom_left[1]]; // weird ordering because y-inversion from NAD83
    pisgah_bbox_pixel_width = pixel_window[2] - pixel_window[0];
    pisgah_bbox_pixel_height = pixel_window[3] - pixel_window[1];

    const pool = new GeoTIFF.Pool();
    elevation_data = (await image.readRasters({ window: pixel_window, pool: pool }))[0];
    console.log("Pisgah elevation data finished loading");
}


function readElevation(lat, lng) {
    if (lng < pisgah_bbox[0] || lng > pisgah_bbox[2] || lat < pisgah_bbox[1] || lat > pisgah_bbox[3]) return null;
    if (!elevation_data) return null;

    const [x_pixel_index, y_pixel_index] = latlng_to_pixel(lat, lng, pisgah_bbox, pisgah_bbox_pixel_width, pisgah_bbox_pixel_height);
    const elevation_meters = elevation_data[pisgah_bbox_pixel_width * y_pixel_index + x_pixel_index];
    const elevation_feet = elevation_meters * 3.2808399;
    return elevation_feet;
}


function latlng_to_pixel(lat, lng, bbox, width_pixels, height_pixels) {
    // method from this tutorial: https://towardsdatascience.com/geotiff-coordinate-querying-with-javascript-5e6caaaf88cf
    // note that our geotiff is in NAD83, which is in geographic coordinates so this sort of linear interpolation is correct
    // also note that NAD83 is very similar to WGS84 (the datum that google maps uses) - typically within a meter, so we don't need to reproject
    const lng_deg_range = bbox[2] - bbox[0];
    const lat_deg_range = bbox[3] - bbox[1];
    const lng_percent = (lng - bbox[0]) / lng_deg_range;
    const lat_percent = (lat - bbox[1]) / lat_deg_range;
    const x_pixel_index = Math.floor(width_pixels * lng_percent);
    const y_pixel_index = Math.floor(height_pixels * (1 - lat_percent));    // y is inverted because NAD83 does that
    return [x_pixel_index, y_pixel_index];
}


function getElevationsAlongSegment(latlng1, latlng2) {
    // we just do linear interpolation in terms of latitude and longitude, since pisgah isn't that big

    let output = []

    const segment_miles = haversine_distance(latlng1, latlng2);
    for (let miles_from_start = 0; miles_from_start <= segment_miles; miles_from_start += elevation_sampling_interval_miles) {
        const t = miles_from_start / segment_miles;
        const lat = (1 - t) * latlng1.lat() + t * latlng2.lat();
        const lng = (1 - t) * latlng1.lng() + t * latlng2.lng();
        output.push({
            lat: lat,
            lng: lng,
            miles_from_start: miles_from_start,
            elevation_feet: readElevation(lat, lng)
        });
    }
    // add endpoint
    output.push({
        lat: latlng2.lat(),
        lng: latlng2.lng(),
        miles_from_start: segment_miles,
        elevation_feet: readElevation(latlng2.lat(), latlng2.lng())
    });
    // make sure we didn't have any null reads
    for (let i = 0; i < output.length; i++) {
        if (output[i].elevation_feet === null) return null;
    }
    return output;
}


function plotElevationTrajectory(elevation_trajectory) {
    const canvas = document.getElementById("elevation_trajectory_canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (elevation_trajectory.length < 2) return;

    const total_miles = elevation_trajectory[elevation_trajectory.length - 1].miles_from_start;
    const px_per_mile = canvas.width / total_miles;

    let min_elevation = Infinity;
    let max_elevation = -Infinity;
    elevation_trajectory.forEach(obj => {
        if (obj.elevation_feet < min_elevation) min_elevation = obj.elevation_feet;
        if (obj.elevation_feet > max_elevation) max_elevation = obj.elevation_feet;
    });
    const px_per_elevation_foot = canvas.height / (max_elevation - min_elevation);

    // gridlines

    ctx.lineWidth = 1;
    const contour_interval = 250;
    const first_contour = Math.ceil(min_elevation / contour_interval) * contour_interval
    for (let contour_elevation = first_contour; contour_elevation < max_elevation; contour_elevation += contour_interval) {
        ctx.beginPath();
        const y = (max_elevation - contour_elevation) * px_per_elevation_foot;
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.strokeStyle = contour_elevation % 1000 == 0 ? "#888" : "#ddd";
        ctx.closePath();
        ctx.stroke();
        if (max_elevation - min_elevation < 1500 || contour_elevation % 1000 == 0) {
            ctx.fillText(contour_elevation + "ft", 0, y);
        }
    }
    ctx.strokeStyle = "#888"
    for (let mile = 1; mile < total_miles; mile++) {
        ctx.beginPath();
        const x = mile * px_per_mile
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.closePath();
        ctx.stroke();
    }

    // elevation trajectory, color coded for uphill vs downhill

    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    for (let i = 1; i < elevation_trajectory.length; i++) {
        const x1 = elevation_trajectory[i - 1].miles_from_start * px_per_mile;
        const y1 = (max_elevation - elevation_trajectory[i - 1].elevation_feet) * px_per_elevation_foot;
        const x2 = elevation_trajectory[i].miles_from_start * px_per_mile;
        const y2 = (max_elevation - elevation_trajectory[i].elevation_feet) * px_per_elevation_foot;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = elevation_trajectory[i - 1].elevation_feet < elevation_trajectory[i].elevation_feet ? uphill_color : downhill_color;
        ctx.closePath();
        ctx.stroke();
    }

    // gridline labels

    for (let contour_elevation = first_contour; contour_elevation < max_elevation; contour_elevation += contour_interval) {
        if (max_elevation - min_elevation < 1500 || contour_elevation % 1000 == 0) {
            const y = (max_elevation - contour_elevation) * px_per_elevation_foot;
            ctx.fillText(contour_elevation + "ft", 0, y);
        }
    }
    for (let mile = 1; mile < total_miles; mile++) {
        const x = mile * px_per_mile
        ctx.fillText(mile + "mi", x + 1, canvas.height);
    }
}