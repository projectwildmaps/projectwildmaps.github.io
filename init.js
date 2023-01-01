function init() {
    //show instructions immediately
    document.getElementById("instructions").showModal();
    document.querySelector("#instructions button").blur(); //prevent weird autofocusing
 
    // MAP STUFF --------------------------------------------------------
    
    // get map config stuff from the default location
    let center_coords;
    let zoom;
    let mapTypeId;
    for(let name in locations){
        let loc = locations[name];
        if(loc.default){
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

    initLegend(); //legend.js


    



    // set up location changing widget

    let location_dropdown = document.getElementById("change_location");
    let location_button = document.getElementById("change_location_button");
    let location_list = document.getElementById("locations");

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(location_dropdown);

    //populate location list
    for(let name in locations){ //global config var
        let li = document.createElement("li");
        li.textContent = name;
        if(locations[name].default){li.style.fontWeight = 500;}
        location_list.appendChild(li);
    }
    //add event handler to make menu appear/disappear and to handle location changes
    document.addEventListener("click", function(e){
        if(location_dropdown.contains(e.target)){
            // menu appear / disappear
            if(location_button.contains(e.target) && location_list.style.display != "none"){
                location_list.style.display = "none";
            }
            else {
                location_list.style.display = "block";
            }
            // location change
            if(e.target.tagName == "LI"){
                //switch which one is bold
                location_list.querySelectorAll("li").forEach(li => {li.style.fontWeight = "initial";});
                e.target.style.fontWeight = 500;

                //change location
                let name = e.target.textContent;
                let L = locations[name];
                map.setCenter(L.coords);
                usersMarker.setPosition(L.coords); // so people can add points here

                //change map features
                if(L.mapTypeId){
                    map.setMapTypeId(L.mapTypeId);
                }
                if(L.zoom){
                    map.setZoom(L.zoom);
                }

                //animate the big red pin in case they didn't realize it came along
                animateUsersMarker(); //inputInfoWindow.js
            }
        }
    });
    //event handlers to hide the menu - the mouseleave/mouseenter one is just for convenience, and copying google
    document.addEventListener("mousedown", function(e){
        if(!location_dropdown.contains(e.target)){
            location_list.style.display = "none";
        }
    });
    document.addEventListener("touchstart", function(e){ //for mobile compatibility
        if(!location_dropdown.contains(e.target)){
            location_list.style.display = "none";
        }
    });
    let hide_timeout;
    location_dropdown.addEventListener("mouseleave", function(){
        hide_timeout = setTimeout(function(){location_list.style.display = "none";}, 1000);
    });
    location_dropdown.addEventListener("mouseenter", function(){
        clearTimeout(hide_timeout);
    })


    // DATA STUFF ------------------------------------------------------------------------------------

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
            comments: data.comments,

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
        markers[snapshot.key].setProperty('comments', snapshot.val().comments);

        //if data info window is open for this point, update it's displayed information
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

    // Initialize the big red marker and input form that allows people to add new points
    initInputInfoWindow(); //inputInfoWindow.js

    //Init the map control that lets you download the data
    let download_button = document.getElementById("download_data");
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(download_button);
    download_button.addEventListener("click", function(){
        // we use the get function to get a fresh and correct copy of the data from the database, in case we messed up tracking data in the markers object upon onChildChanged etc.
        get(ref(database)).then((snapshot) => {
            const data = JSON.stringify(snapshot.val(), null, 4); // use 4 spaces as whitespace indent
            const blob = new Blob([data], {type: "application/json"});
            const url = URL.createObjectURL(blob);

            let d = new Date();
            const dateString = (d.getMonth() + 1) + "-" + d.getDate() + "-" + d.getFullYear();

            let a = document.createElement("a");
            a.href = url;
            a.download = "PMAPS Data Backup " + dateString;

            a.click();

            URL.revokeObjectURL(url); // saves memory, since the created URL stays around until page unload by default
        });
    });


    

    // TRAIL STUFF -----------------------------------------------------------------------------

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


    // MISC ----------------------------------------------------------------------------------------

    // set up info control to open the instructions panel
    // this is in misc. because it needs to happen after we add the download data map control
    let info_control = document.getElementById("info_control");
    let instructions = document.getElementById("instructions");
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(info_control);
    info_control.addEventListener("click", function(){
        instructions.showModal();
    });
}
