function init() {
    var opts = {
        streetViewControl: true,
        mapTypeId: 'Nat Geo',
        backgroundColor: "rgb(220,220,220)",
        center: center_coords, //global config var
        zoom: 13,
        mapTypeControlOptions: {
            mapTypeIds: [
                'USGS 2013', 'USGS TIFF', 'Nat Geo', 'USGS',
                google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE,
                google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN
            ]
        }
    }
    map = new google.maps.Map(document.getElementById("map"), opts);
    map.setTilt(45);

    // add maps defined in map_definitions.js to the map
    //map.mapTypes.set('USGS 2013', usgs2013);
    map.mapTypes.set('USGS TIFF', usgsTiff);
    map.mapTypes.set('Nat Geo', natGeo);
    //map.mapTypes.set('USGS', usgsStolen);

    initLegend(); //legend.js

    // Things above this point deal with the maps. Things below this point deals with the data.

    /*
        var trailDataLayer = new google.maps.Data();
        trailDataLayer.loadGeoJson('trails/srw_data.geojson');
        trailDataLayer.loadGeoJson('trails/graveyard.geojson');
        trailDataLayer.loadGeoJson('trails/davidson.geojson');
        trailDataLayer.loadGeoJson('trails/blueRidge.geojson');
        trailDataLayer.loadGeoJson('trails/blackBalsam.geojson');
        trailDataLayer.loadGeoJson('trails/mills.geojson');
        trailDataLayer.loadGeoJson('trails/farlow.geojson');
        trailDataLayer.loadGeoJson('trails/mount2sea.geojson');
    
        trailDataLayer.addListener('click', function(event) {
            var content = "<div class='googft-info-window'>"+
                            "<h1>"+event.feature.getProperty('name')+"</h1>"+
                            "<i>"+event.feature.getProperty('segment')+"</i>"+
                            "</div>";
            infowindow.setContent(content);
            infowindow.setPosition(event.feature.getGeometry().get()); //This doesn't work. This would be right if it were points, not trails.
            infowindow.open(map);
        });
        trailDataLayer.setMap(map);
    */

    // Create data layer to hold all the data people have added
    markerLayer = new google.maps.Data();

    // Add everything in the firebase database to the data layer and markers reference object
    // This callback triggers once for each point, and then again for new points added
    onChildAdded(ref(database), (snapshot => {
        let data = snapshot.val()
        var geowanted = new google.maps.Data.Point({ lat: data.lat, lng: data.lon });
        var propswanted = {

            name: data.name,
            description: data.description,
            category: data.category,
            date: data.date,
            archived: data.archived,
            //comments: data.comments

            archived_visible: archived_visible, //styling attribute
            my_category_visible: true, //styling attribute, set to true even if category not visible, so users have confirmation their new point was created successfully
            ref: snapshot.ref, //database reference object
            key: snapshot.key //data location in database

        };
        var new_feature = new google.maps.Data.Feature({ geometry: geowanted, properties: propswanted });
        markers[snapshot.key] = new_feature; //markers is a global variable
        markerLayer.add(new_feature);
    }));
    // Handle points being modified (archive/unarchive, comments)
    onChildChanged(ref(database), (snapshot => {
        //update archived
        markers[snapshot.key].setProperty('archived', snapshot.val().archived); //triggers style recompute

        //update comments
        //NOT READY YET - markers[snapshot.key].setProperty('comments', snapshot.val().comments)

        //if data info window is open for this point, update it
        let content_div = document.querySelector("div[data-key = '" + snapshot.key + "']");
        if (content_div) {
            setDataInfoWindowHTML(content_div, markers[snapshot.key]); //dataInfoWindow.js
            autoPan(content_div);
        }
    }));
    // Handle points being removed. This will only happen if someone deletes a point from the firebase console.
    // We're not allowing clients to delete points, only archive them.
    onChildRemoved(ref(database), (snapshot => {
        console.log("Removing: ", snapshot.val());
        markerLayer.remove(markers[snapshot.key]);
        delete markers[snapshot.key];
    }));


    // Color the data layer based on the category of the data, and give each point roll over text
    markerLayer.setStyle(function (feature) {
        let visible = feature.getProperty('my_category_visible'); //messed with in legend.js
        if (feature.getProperty('archived') && !feature.getProperty('archived_visible')) {
            visible = false;
        }

        let icon; //an object that will follow the google.maps.Icon interface
        if (feature.getProperty('archived')) {
            icon = {
                url: "dots/archived.png",
                anchor: new google.maps.Point(6, 6) //center point, image is 12x12 px
            }
        }
        else {
            icon = {
                url: getDot(feature.getProperty('category')),
                anchor: new google.maps.Point(4.5, 4.5) //center point, image is 9x9 px
            }
        }

        return {
            icon: icon,
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

    // Fill category options and make an info window for showing the data input form.
    var category_datalist = document.getElementById("category");
    categories.forEach((category) => {
        let option = document.createElement("option");
        option.value = category;
        category_datalist.appendChild(option);
    });
    inputInfoWindow = new google.maps.InfoWindow({ disableAutoPan: true }); //assigned to global var
    inputInfoWindow.setContent(document.getElementById("input_form_content")); //beginning of body tag
    document.getElementById("submit").addEventListener("click", saveData);
    //if mobile device, squish size of input fields to better fit
    if (isMobileBrowser()) { //detect_mobile.js
        document.querySelectorAll(".input_field").forEach((el) => {
            el.style.width = "200px";
        })
    }

    // Makes a big red pin, used for inputting data
    usersMarker = new google.maps.Marker({
        position: map.getCenter(),
        map: map,
        title: 'Use me to mark places',
        draggable: true,
        animation: google.maps.Animation.DROP,
        anchorPoint: new google.maps.Point(0, -30)
    });
    // When the user clicks on the big red pin, open up the form for data input.
    google.maps.event.addListener(usersMarker, 'click', function () {
        inputInfoWindow.open(map, usersMarker);

        //auto pan (timeout is to wait for the element to be displayed so we can get bounding boxes)
        setTimeout(function () {
            autoPan(document.getElementById("input_form_content"))
        }, 10);

        //reset fields (have to do it after opening, in order to access the elements)
        document.getElementById("name").value = "";
        document.getElementById("markerDescription").value = "";
        document.getElementById("categories").value = "";
    });
    // When the user moves the big red pin, close the data input form. They clearly don't need it. You know what? We don't need them either!
    google.maps.event.addListener(usersMarker, 'position_changed', function () { inputInfoWindow.close(); });


    // Trails Stuff
    /*trailLayer = new google.maps.FusionTablesLayer({
        query: {
            select: 'ns1:coordinates',
            from: '1Rk-HToZ45a3mpLbWfBf9sY_5cmaVP0ibBFVk_GA',
            where: 'id3 > 1'
        },
        map: null,
        suppressInfoWindows: true,
        styles: [{
            polylineOptions: {
                strokeWeight: 1
            }
        }]
    });
    google.maps.event.addListener(trailLayer, 'click', function (e) {
        windowControlTrail(e, infoWindow, map);
    });
    var trailControlDiv = document.createElement('div');
    var trailControl = new TrailControl(trailControlDiv, map);
    trailControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(trailControlDiv);
    */
}
