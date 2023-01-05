function initDateFilter(){
    var date_filter = document.getElementById("date_filter");
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(date_filter);

    //toggle visibility of the filter when user clicks on the header
    date_filter.querySelector("#date_filter_header").addEventListener("click", function(e){
        let open = date_filter.hasAttribute("open");
        open = !open;

        if(open) date_filter.setAttribute("open", "");
        else date_filter.removeAttribute("open");

        //update arrow image
        date_filter.querySelector(".arrow").src = "https://maps.gstatic.com/mapfiles/arrow-" + (open ? "up" : "down") + ".png";

        //trigger map control layout recalculation by adding and removing a div
        //layout recalculation doesn't happen by default, which is annoying
        let updater = document.createElement("div");
        map.controls[google.maps.ControlPosition.RIGHT_TOP].push(updater);
        updater.parentElement.removeChild(updater);
    });

    let start_date = date_filter.querySelector("#start_date");
    let end_date = date_filter.querySelector("#end_date");

    //reset inputs when the reset buttons are clicked
    date_filter.querySelector("#reset_start_date").addEventListener("click", function(){
        start_date.value = "";
        filterByDate(); //because change event isn't triggered
    });
    date_filter.querySelector("#reset_end_date").addEventListener("click", function(){
        end_date.value = "";
        filterByDate(); //because change event isn't triggered
    });

    //do the filtering when the date inputs are changed
    start_date.addEventListener("change", filterByDate);
    end_date.addEventListener("change", filterByDate);
}


function filterByDate(){
    //get start and end dates from the date filter control
    let start = document.querySelector("#start_date").valueAsDate;
    let end = document.querySelector("#end_date").valueAsDate;
    
    markerLayer.forEach(marker => {
        let date_components = marker.getProperty("date").split("/"); //month, day, year
        let month_index = date_components[0] - 1;
        let day = date_components[1];
        let year = date_components[2];
        let date = new Date(year, month_index, day);
    });
}