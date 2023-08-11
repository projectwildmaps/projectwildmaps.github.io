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
    var opts = {
        streetViewControl: true,
        mapTypeId: mapTypeId,
        backgroundColor: "rgb(220,220,220)",
        center: center_coords, //see top of function
        zoom: zoom, //see top of function
        zoomControl: false,
        scaleControl: true,
        mapTypeControlOptions: {
            mapTypeIds: [
                'USGS 2013', 'USGS TIFF', 'Nat Geo', 'USGS',
                google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE,
                google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN
            ],
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        }
    }
    map = new google.maps.Map(document.getElementById("map"), opts);

    // add maps defined in map_definitions.js to the map
    map.mapTypes.set('USGS 2013', usgs2013);
    map.mapTypes.set('USGS TIFF', usgsTiff);
    map.mapTypes.set('Nat Geo', natGeo);
    //map.mapTypes.set('USGS', usgsStolen); // basically the same as USGS TIFF but worse quality


    // CUSTOM MAP CONTROLS ----------------------------------
    // order of initializing matters for layout if stuff being pushed to same map control area

    initLocationChangeDropdown(); //locationChange.js

    initLegend(); //legend.js

    initDateFilter(); //dateFilter.js

    //Init the map control that lets you download the data
    initDownloadButton(); //download.js

    // set up info control to open the instructions panel
    let info_control = document.getElementById("info_control");
    let instructions = document.getElementById("instructions");
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(info_control);
    info_control.addEventListener("click", function () {
        instructions.showModal();
    });


    // DATA STUFF ------------------------------------------------------------------------------------

    // Create data layer to hold all the data people have added
    markerLayer = new google.maps.Data();

    // Add everything in the firebase database to the data layer and markers reference object
    // This callback triggers once for each point, and then again for new points added
    onChildAdded(ref(database, "points"), (snapshot => {
        let data = snapshot.val()
        var geowanted = new google.maps.Data.Point({ lat: data.lat, lng: data.lon });
        var propswanted = {
            //data attributes
            name: data.name,
            description: data.description,
            category: data.category,
            date: data.date,
            archived: data.archived,
            comments: data.comments,
            //styling attributes
            archived_visible: archived_visible, //see legend.js
            my_category_visible: true, //see legend.js, set to true even if category not visible, so users have confirmation their new point was created successfully
            my_date_visible: true, //see dateFilter.js, set to true even if category not visible, so users have confirmation their new point was created successfully
            //database attributes
            ref: snapshot.ref, //database reference object
            key: snapshot.key //data location in database
        };
        var new_feature = new google.maps.Data.Feature({ geometry: geowanted, properties: propswanted });
        markers[snapshot.key] = new_feature; //markers is a global variable
        markerLayer.add(new_feature);

        updateMinDate(data.date); //see dateFilter.js
    }));
    // Handle points being modified (archive/unarchive, comments)
    onChildChanged(ref(database, "points"), (snapshot => {
        //update archived
        markers[snapshot.key].setProperty('archived', snapshot.val().archived); //triggers style recompute

        //update comments
        markers[snapshot.key].setProperty('comments', snapshot.val().comments);

        //if data info window is open for this point, update it's displayed information
        let content_div = document.querySelector("div[data-key = '" + snapshot.key + "']");
        if (content_div) {
            setDataInfoWindowContent(content_div, markers[snapshot.key]); //dataInfoWindow.js
            autoPan(content_div);
        }
    }));
    // Handle points being removed. This will only happen if someone deletes a point from the firebase console.
    // We're not allowing clients to delete points, only archive them.
    onChildRemoved(ref(database, "points"), (snapshot => {
        console.log("Removing: ", snapshot.val());
        markerLayer.remove(markers[snapshot.key]);
        delete markers[snapshot.key];
    }));


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
