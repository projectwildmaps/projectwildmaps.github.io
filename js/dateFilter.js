function initDateFilter(){
    const date_filter = document.getElementById("date_filter");
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(date_filter);

    //toggle visibility of the filter when user clicks on the header
    date_filter.querySelector("#date_filter_header").addEventListener("click", function(e){
        let open = date_filter.hasAttribute("open");
        open = !open;

        if(open) date_filter.setAttribute("open", "");
        else date_filter.removeAttribute("open");

        //update arrow image, borrow a google icon
        date_filter.querySelector(".arrow").src = "https://maps.gstatic.com/mapfiles/arrow-" + (open ? "up" : "down") + ".png";

        //trigger map control layout recalculation by adding and removing a div
        //layout recalculation doesn't happen by default, which is annoying
        const updater = document.createElement("div");
        map.controls[google.maps.ControlPosition.RIGHT_TOP].push(updater);
        updater.parentElement.removeChild(updater);
    });

    const start_date = date_filter.querySelector("#start_date");
    const end_date = date_filter.querySelector("#end_date");

    //set max date to today
    const today = new Date().toISOString().substring(0, 10);
    start_date.max = today;
    end_date.max = today;

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
    const start = document.querySelector("#start_date").value; // yyyy-mm-dd
    const end = document.querySelector("#end_date").value;

    markerLayer.forEach(marker => {
        //get yyyy-mm-dd representation so we can compare with start and end
        const yyyy_mm_dd = marker.getProperty("timestamp").toDate().toISOString().substring(0, 10);

        //compare date - if no bound set for start or end, length will be zero
        const after_start = start.length == 0 || yyyy_mm_dd >= start;
        const before_end = end.length == 0 || yyyy_mm_dd <= end;
        marker.setProperty("my_date_visible", after_start && before_end);
    });
}


let min_date;
function updateMinDate(timestamp){
    //This function gets called when points are added (see init.js)
    //It sets the min date for the date filter inputs to the earliest date in the database
    //This helps with the user experience of using the date inputs
    const date = timestamp.toDate(); //firestore Timestamp object
    const yyyy_mm_dd = date.toISOString().substring(0, 10);
    if(!min_date || yyyy_mm_dd < min_date){
        min_date = yyyy_mm_dd;
        document.querySelector("#start_date").min = min_date;
        document.querySelector("#end_date").min = min_date;
    }
}