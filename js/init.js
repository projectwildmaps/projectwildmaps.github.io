function init() {
    //show instructions immediately
    document.getElementById("instructions").showModal();
    document.querySelector("#instructions button").blur(); //prevent weird autofocusing

    // MAP STUFF --------------------------------------------------------

    // get map config stuff from the default location
    let center_coords;
    let zoom;
    let mapTypeId;
    for (let name in locations) {
        let loc = locations[name];
        if (loc.default) {
            center_coords = loc.coords;
            zoom = loc.zoom ? loc.zoom : default_zoom_level;
            mapTypeId = loc.mapTypeId ? loc.mapTypeId : "roadmap";
        }
    }

    //configure the map
    const opts = {
        streetViewControl: true,
        mapTypeId: mapTypeId,
        backgroundColor: "rgb(220,220,220)",
        center: center_coords, //see top of function
        zoom: zoom, //see top of function
        zoomControl: false,
        scaleControl: true,
        fullscreenControl: false,
        mapTypeControlOptions: {
            mapTypeIds: [
                'Nat Geo', 'Open Street Map', 'USGS',
                google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE,
                google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN
            ],
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        }
    }
    map = new google.maps.Map(document.getElementById("map"), opts);

    // add maps defined in map_definitions.js to the map
    map.mapTypes.set('Nat Geo', natGeo);
    map.mapTypes.set('Open Street Map', openStreetMap);
    map.mapTypes.set('USGS', usgsTiff);


    // CUSTOM MAP CONTROLS ----------------------------------
    // order of initializing matters for layout if stuff being pushed to same map control area

    initLocationChangeDropdown(); //locationChange.js

    initLegend(); //legend.js

    initDateFilter(); //dateFilter.js

    //Init the map control that lets you download the data
    initDownloadButton(); //download.js

    // set up offline settings control
    initOfflineSettings(); //offline.js

    // set up info control to open the instructions panel
    const info_control = document.getElementById("info_control");
    const instructions = document.getElementById("instructions");
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(info_control);
    info_control.addEventListener("click", function () {
        instructions.showModal();
    });

    // copyright notice for open street map
    const osm_copyright_control = document.getElementById("osm_copyright_control");
    map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(osm_copyright_control);
    const updateOSMCopyright = () => {
        const osm_open = map.getMapTypeId() == 'Open Street Map';
        osm_copyright_control.style.display = osm_open ? "block" : "none";
    }
    google.maps.event.addListener(map, "maptypeid_changed", updateOSMCopyright);
    updateOSMCopyright();

    // DATA STUFF ------------------------------------------------------------------------------------

    // Create data layer to hold all the data people have added
    markerLayer = new google.maps.Data();

    // Add everything in the firebase database to the data layer and markers reference object
    // Use realtime listeners, so stuff updates cleanly to match the database
    onSnapshot(query(points_collection), (snapshot) => {
        snapshot.docChanges().forEach((change) => {

            if (change.type === "added") {
                const data = change.doc.data();
                const geowanted = new google.maps.Data.Point({
                    lat: data.location.latitude,
                    lng: data.location.longitude
                });
                const propswanted = {
                    //data attributes
                    name: data.name,
                    description: data.description,
                    category: data.category,
                    timestamp: data.timestamp,
                    archived: data.archived,
                    comments: data.comments,
                    //styling attributes
                    archived_visible: archived_visible, //see legend.js and globals_and_config.js
                    my_category_visible: true, //see legend.js, set to true even if category not visible, so users have confirmation their new point was created successfully
                    my_date_visible: true, //see dateFilter.js, set to true even if category not visible, so users have confirmation their new point was created successfully
                    //database attributes
                    id: change.doc.id, //document id in database
                    ref: change.doc.ref //database reference object
                };
                const new_feature = new google.maps.Data.Feature({ geometry: geowanted, properties: propswanted });
                markers[change.doc.id] = new_feature; //markers is a global variable
                markerLayer.add(new_feature);

                updateMinDate(data.timestamp); //see dateFilter.js
            }

            if (change.type === "modified") {
                console.log("Modified point: ", change.doc);
                //update archived
                markers[change.doc.id].setProperty('archived', change.doc.data().archived); //triggers style recompute
                //update comments
                markers[change.doc.id].setProperty('comments', change.doc.data().comments);
                //if data info window is open for this point, update its displayed information
                const content_div = document.querySelector("div[data-id = '" + change.doc.id + "']");
                if (content_div) {
                    setDataInfoWindowContent(content_div, markers[change.doc.id]); //dataInfoWindow.js
                    autoPan(content_div);
                }
            }

            if (change.type === "removed") {
                console.log("Removed point: ", change.doc);
                markerLayer.remove(markers[change.doc.id]);
                delete markers[change.doc.id];
            }
        });
    });


    // Color the data layer based on the category of the data, and give each point roll over text
    markerLayer.setStyle(function (feature) {
        let visible = feature.getProperty('my_category_visible') &&
            feature.getProperty('my_date_visible');
        if (feature.getProperty('archived') && !feature.getProperty('archived_visible')) {
            visible = false;
        }

        return {
            icon: getIcon(feature.getProperty('category'), dot_padding, feature.getProperty('archived')), //dot_padding is a global config var
            title: feature.getProperty('description'),
            visible: visible
        };
    });

    // When the data layer is clicked on, display the appropriate data
    markerLayer.addListener('click', function (event) {
        openDataInfoWindow(event.feature); //dataInfoWindow.js
    });

    // Put the data layer on the map
    markerLayer.setMap(map);

    // Initialize the big red marker and input form that allows people to add new points
    initInputInfoWindow(); //newPoint.js

    // Initialize the info window that lets you view data
    initDataInfoWindow(); //dataInfoWindow.js




    // TRAIL STUFF -----------------------------------------------------------------------------

    initMeasurementFeature();

    // trailLayer = new google.maps.Data();
    // trailLayer.loadGeoJson('trails/srw_data.geojson');
    // trailLayer.loadGeoJson('trails/graveyard.geojson');
    // trailLayer.loadGeoJson('trails/davidson.geojson');
    // trailLayer.loadGeoJson('trails/blueRidge.geojson');
    // trailLayer.loadGeoJson('trails/blackBalsam.geojson');
    // trailLayer.loadGeoJson('trails/mills.geojson');
    // trailLayer.loadGeoJson('trails/farlow.geojson');
    // trailLayer.loadGeoJson('trails/mount2sea.geojson');
    // trailLayer.setStyle({
    //     strokeColor: 'red'
    // })

    // trailLayer.setMap(map);
}
