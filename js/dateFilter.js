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

    //set max date to today
    let today = US_date_to_yyyy_mm_dd(new Date().toLocaleDateString("en-us"));
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
    let start = document.querySelector("#start_date").value; // yyyy-mm-dd
    let end = document.querySelector("#end_date").value;

    markerLayer.forEach(marker => {
        //get yyyy-mm-dd representation so we can compare with start and end
        let date = US_date_to_yyyy_mm_dd(marker.getProperty("date"));

        let after_start = start.length == 0 || date >= start; //if no start date specified, length is 0, always consider true
        let before_end = end.length == 0 || date <= end;
        marker.setProperty("my_date_visible", after_start && before_end);
    });
}

function US_date_to_yyyy_mm_dd(input){
    let date_components = input.split("/"); //month, day, year
    let month = date_components[0].padStart(2, "0");
    let day = date_components[1].padStart(2, "0");
    let year = date_components[2];
    return year + "-" + month + "-" + day;
}


let min_date;
function updateMinDate(date_string){
    //This function gets called by onChildAdded (see init.js) whenever a new data point is added
    //It sets the min date for the date filter inputs to the earliest date in the database
    //This helps with the user experience of using the date inputs
    let formatted = US_date_to_yyyy_mm_dd(date_string);
    if(!min_date || formatted < min_date){
        min_date = formatted;
        document.querySelector("#start_date").min = min_date;
        document.querySelector("#end_date").min = min_date;
    }
}