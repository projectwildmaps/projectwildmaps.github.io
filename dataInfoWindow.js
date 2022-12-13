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
                "<input id='comment_name' placeholder='Enter your name here'></input><br>" +
                "<textarea id='comment_text' placeholder='Enter comment text...'></textarea><br>" +
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
            let name = content.querySelector("#comment_name").value;
            let text = content.querySelector("#comment_text").value;

            //do checks for if we have valid values
            let good_to_push = true;
            if(text.length == 0){
                good_to_push = false;
                alert("Please input some comment text.");
            }
            else if(name.length == 0){
                good_to_push = confirm("You haven't provided a name, do you wish to remain anonymous?");
                name = "Unknown";
            }

            //push comment to the database
            if(good_to_push){
                let d = new Date();
                let dateString = (d.getMonth() + 1) + "-" + d.getDate() + "-" + d.getFullYear();
                let comment = {
                    name: name,
                    text: text,
                    date: dateString
                };
                let feature_ref = feature.getProperty('ref');
                let comments_ref = child(feature_ref, "comments");
                push(comments_ref, comment);
    
                // the push triggers onChildChanged, which will refresh the HTML, clearing the input form
                // and displaying the new comment
            }
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
    var comments = feature.getProperty('comments');

    div.dataset.key = feature.getProperty('key'); //data attribute, used for updating comments in onChildChanged

    let commentsHTML = "";
    if(comments){
        commentsHTML += "<hr><b>Comments:</b>";
        for(let comment_key in comments){
            let comment = comments[comment_key];
            commentsHTML += "<br><br>" + 
                            "<div class='comment_header'>" + //styled as a flexbox with justify-content: space-between;
                                "<u>" + comment.name + "</u>" +
                                "<i>" + comment.date + "&nbsp;</i>" + //&nbsp; (non breaking space) so the date doesn't get cut off by overflow
                            "</div>" +
                            comment.text;
        }
    }

    div.innerHTML = (archived ? "<b><i>[ARCHIVED]</i></b><br>" : "") + 
        (category ? "<b>" + category + "</b>" : "") +
        "<p>" + markerDescription + "</p>" +
        "Contributed By: " + contributorName + "<br>" +
        "<i>" + timeStamp + "</i><br>" +
        "<div class='info_window_actions'>" +
        "<u class='add_comment action'>Add Comment</u>" +
        "<u class='set_archived action'>" + (archived ? "Unarchive" : "Archive") + "</u>" +
        "</div>" +
        commentsHTML
}