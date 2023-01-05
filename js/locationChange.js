function initLocationChangeDropdown(){
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
                animateUsersMarker(); //newPoint.js
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
    });
}