var inputInfoWindow;
var usersMarker;

function initInputInfoWindow(){
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