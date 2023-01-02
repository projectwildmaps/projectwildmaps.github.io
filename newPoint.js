var inputInfoWindow;
var usersMarker;

//function to animate the big red pin when the instructions close or the map location changes, to draw attention to it
function animateUsersMarker(){
    usersMarker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(() => {
        usersMarker.setAnimation(null);
    }, 1000);
}

function initInputInfoWindow() {
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

    // Makes a big red pin, used for inputting data
    usersMarker = new google.maps.Marker({
        position: map.getCenter(),
        map: map,
        title: 'Use me to mark places',
        draggable: true,
        anchorPoint: new google.maps.Point(0, -30)
    });
    // Animate the pin when we close the instructions
    document.getElementById("instructions").addEventListener("close", animateUsersMarker); //see function at top of file

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
    usersMarker.addListener('position_changed', function () { inputInfoWindow.close(); });

    //When the user pans or resizes the screen, make sure the big red pin is still visible
    //Don't do this if the user is dragging the marker, since sometime that can pan the screen too
    let dragging = false;
    usersMarker.addListener("dragstart", function(){dragging = true;});
    usersMarker.addListener("dragend", function(){dragging = false;});
    map.addListener("bounds_changed", function (event) {
        if(dragging) return;
        
        //get map bounds NE and SW points
        //convert those to pixel coordinates
        //convert marker position to pixel coordinates
        //get how many pixels we need to shift the marker in the x and y directions based on the usersMarkerMargins global config var
        //get new marker pixel coords
        //convert to latlng, set the position

        let map_bounds = map.getBounds();
        let ne_px = fromLatLngToPixel(map_bounds.getNorthEast()); //see below for this function
        let sw_px = fromLatLngToPixel(map_bounds.getSouthWest());
        let marker_px = fromLatLngToPixel(usersMarker.getPosition());

        let m = usersMarkerMargins; //global config var
        let new_marker_px = {
            x: clamp(sw_px.x + m.left, marker_px.x, ne_px.x - m.right),
            y: clamp(ne_px.y + m.top, marker_px.y, sw_px.y - m.bottom)
        }
        let new_latlng = fromPixelToLatLng(new_marker_px);
        if(!usersMarker.getPosition().equals(new_latlng)){
            usersMarker.setPosition(new_latlng);
        }
    });
}

function clamp(min, value, max){
    return Math.max(Math.min(value, max), min);
}

//functions to convert between LatLng and pixel coordinates (from the top left of the world)
//see this documentation: https://developers.google.com/maps/documentation/javascript/coordinates
function fromLatLngToPixel(latlng){
    let world_coords = map.getProjection().fromLatLngToPoint(latlng);
    let scale = 2**(map.getZoom());
    return {
        x: world_coords.x * scale,
        y: world_coords.y * scale
    };
}
function fromPixelToLatLng(pixel_coords){
    //pixel coords should have properties x and y
    let scale = 2**(map.getZoom());
    let world_coord = {
        x: pixel_coords.x / scale,
        y: pixel_coords.y / scale
    }
    return map.getProjection().fromPointToLatLng(world_coord);
}


function saveData() { //What to do when the user hits the "submit" button on the user input form.
    // Awkwardly pulls what the user wrote on the input form
    var name = document.getElementById("name").value;
    var description = document.getElementById("markerDescription").value;
    var category = document.getElementById("categories").value;

    if (description.length == 0) {
        alert("Please input a description.");
        return;
    }

    if (name.length == 0) {
        let confirmed = confirm("You haven't provided a name, do you wish to remain anonymous?");
        if (!confirmed) return;
        name = "Unknown";
    }

    if (category.length == 0) {
        let confirmed = confirm("You haven't provided a category, are you sure you want to leave this field blank? It will default to 'Other' as the category.")
        if (!confirmed) return;
        category = "Other";
    }

    var pos = usersMarker.getPosition();
    var d = new Date();
    var dateString = (d.getMonth() + 1) + "-" + d.getDate() + "-" + d.getFullYear();

    // Adds the data to the database
    push(ref(database), {
        lat: pos.lat(),
        lon: pos.lng(),
        name: name,
        description: description,
        category: category,
        date: dateString,
        archived: false
    });

    inputInfoWindow.close(); // If we're saving data, we must be done with the input form, so let's close it.
}