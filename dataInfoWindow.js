var dataInfoWindow = new google.maps.InfoWindow({ disableAutoPan: true });

function openDataInfoWindow(feature){
    //feature is the Feature object of the point we clicked on
    
    var content = document.createElement("div");

    setDataInfoWindowHTML(content, feature); //see below in this file

    content.addEventListener("click", function (e) {
        if (e.target.classList.contains("set_archived")) {
            //toggle archived state of this point
            let ref = feature.getProperty('ref');
            update(ref, { 'archived': !feature.getProperty('archived') }); //triggers onChildChanged -> updates HTML of content
        }
        else if (e.target.classList.contains("add_comment") && !content.querySelector(".new_comment")) {
            content.innerHTML += "<div class='new_comment'>" +
                "<hr><b>New Comment:</b><br>" +
                "<input placeholder='Enter your name here'></input><br>" +
                "<textarea placeholder='Enter comment text...'></textarea><br>" +
                "<button class='submit_comment'>Submit</button>" +
                "<p class='cancel_new_comment'>Cancel</p>"
            "</div>";
            content.parentElement.scrollTo(0, content.scrollHeight);
            autoPan(content);
        }
        else if (e.target.classList.contains("cancel_new_comment")) {
            content.removeChild(content.querySelector('.new_comment'));
        }
        else if (e.target.classList.contains("submit_comment")) {
            content.removeChild(content.querySelector('.new_comment'));
            //TODO
        }
    });

    dataInfoWindow.setContent(content);
    dataInfoWindow.setPosition(feature.getGeometry().get());
    dataInfoWindow.open(map);

    //auto pan (timeout is to wait for the element to be displayed so we can get bounding boxes)
    window.setTimeout(function () {
        autoPan(content)
    }, 10);
}


function setDataInfoWindowHTML(div, feature) {
    //div is the content div for the data info window
    //feature is the Feature object of the point we clicked on

    //this function is separate because we call it in onChildChanged (see init()), to update the HTML if the point's data changes

    var timeStamp = feature.getProperty('date');
    var category = feature.getProperty('category');
    var markerDescription = feature.getProperty('description');
    var contributorName = feature.getProperty('name');
    var archived = feature.getProperty('archived');

    div.dataset.key = feature.getProperty('key'); //data attribute, used for updating comments in onChildChanged

    div.innerHTML = (archived ? "<b><i>[ARCHIVED]</i></b><br>" : "") + 
        (category ? "<b>" + category + "</b>" : "") +
        "<p>" + markerDescription + "</p>" +
        "Contributed By: " + contributorName + "<br>" +
        "<i>" + timeStamp + "</i><br>" +
        "<div class='info_window_actions'>" +
        "<u class='add_comment'>Add Comment</u>" +
        "<u class='set_archived'>" + (archived ? "Unarchive" : "Archive") + "</u>" +
        "</div>"
    //comments HTML - TODO
}