var dataInfoWindow;

function initDataInfoWindow(){
    dataInfoWindow = new google.maps.InfoWindow({ disableAutoPan: true });
}

function openDataInfoWindow(feature) {
    //feature is the Feature object of the point we clicked on

    //create a new content div (because we need event listeners specific to this feature)
    let template = document.getElementById("dataInfoWindow_template");
    let content = template.content.cloneNode(true).firstElementChild;
    content.dataset.key = feature.getProperty('key'); //data attribute, used for updating comments in onChildChanged

    content.addEventListener("click", function (e) {
        if (e.target.classList.contains("set_archived")) {
            //toggle archived state of this point
            let ref = feature.getProperty('ref');
            update(ref, { 'archived': !feature.getProperty('archived') }); //triggers onChildChanged -> updates HTML of content
        }
        else if (e.target.classList.contains("add_comment")) {
            // clear previous content and display the add comment HTML
            content.querySelector(".comment_name").value = "";
            content.querySelector(".comment_text").value = "";
            content.querySelector(".new_comment").style.display = "block";
            content.parentElement.scrollTo(0, content.scrollHeight);
            autoPan(content);
        }
        else if (e.target.classList.contains("cancel_new_comment")) {
            content.querySelector(".new_comment").style.display = "none";
        }
        else if (e.target.classList.contains("submit_comment")) {
            let name = content.querySelector(".comment_name").value;
            let text = content.querySelector(".comment_text").value;

            //do checks for if we have valid values
            let good_to_push = true;
            if (text.length == 0) {
                good_to_push = false;
                alert("Please input some comment text.");
            }
            else if (name.length == 0) {
                good_to_push = confirm("You haven't provided a name, do you wish to remain anonymous?");
                name = "Unknown";
            }

            //push comment to the database
            if (good_to_push) {
                let dateString = new Date().toLocaleDateString("en-us"); // month/day/year
                let comment = {
                    name: name,
                    text: text,
                    date: dateString,
                    deleted: false //when "deleting" a comment, we only change this value to true so it doesn't display, don't actually delete it
                };
                let comments_ref = child(feature.getProperty('ref'), "comments");
                push(comments_ref, comment);
                // the push triggers onChildChanged, which will refresh the HTML, clearing the input form
                // and displaying the new comment

                content.querySelector(".new_comment").style.display = "none";
            }
        }
        else if (e.target.classList.contains("delete_comment")) {
            let yes_confirm = confirm("Are you sure you really want to delete this comment? You won't be able to undo this action.\n\nNote that deleted comments can still be seen by clicking 'show deleted'.");
            if (yes_confirm){
                let comment_key = e.target.dataset.comment_key;
                let ref = child(feature.getProperty('ref'), "comments/" + comment_key);
                update(ref, { deleted: true }); //triggers onChildChanged, which triggers recreating the info window content
            }
        }
        else if (e.target.classList.contains("toggle_deleted_comments")){
            //use a class on this element to indicate deleted, setDataInfoWindowContent will pick up on it
            e.target.classList.toggle("show_deleted");
            setDataInfoWindowContent(content, feature);
            autoPan(content);
        }
    });

    setDataInfoWindowContent(content, feature); //see below in this file
    dataInfoWindow.setContent(content);
    dataInfoWindow.setPosition(feature.getGeometry().get());
    dataInfoWindow.open(map);

    //auto pan (timeout is to wait for the element to be displayed so we can get bounding boxes)
    window.setTimeout(function () {
        autoPan(content)
    }, 10);
}

function setDataInfoWindowContent(div, feature) {
    //div is the content div for the data info window
    //feature is the Feature object of the point we clicked on
    //this function is separate because we call it in onChildChanged (see init()), to update the HTML if the point's data changes

    //NOTE: we use templates and .innerText instead of an innerHTML string to avoid XSS vulnerabilities

    let archived = feature.getProperty("archived");

    div.querySelector(".archived").innerText = archived ? "[ARCHIVED]\n" : "";
    div.querySelector(".category").innerText = feature.getProperty("category");
    div.querySelector(".description").innerText = feature.getProperty("description");
    div.querySelector(".name").innerText = feature.getProperty("name");
    div.querySelector(".date").innerText = feature.getProperty("date");
    div.querySelector(".set_archived").innerText = archived ? "Unarchive" : "Archive";

    //comments

    //clear comments from last time
    div.querySelectorAll(".comment").forEach(el => el.parentElement.removeChild(el));

    //get comments
    let comments = feature.getProperty('comments');

    //show header if any comments exist, deleted or not, and update deleted toggle's text appropriately
    let deleted_toggle = div.querySelector(".toggle_deleted_comments");
    let show_deleted = deleted_toggle.classList.contains("show_deleted"); //flag used when showing comments below
    div.querySelector(".comments_header").style.display = comments ? "block" : "none";
    deleted_toggle.innerText = show_deleted ? "(hide deleted)" : "(show deleted)";

    //add comments
    let deleted_comment_exists = false; //if false, will hide the deleted comments toggle - confusing if it's present when no deleted comments
    if(comments){
        for(let key in comments){
            let c = comments[key];
            if(c.deleted){
                deleted_comment_exists = true;
                if(!show_deleted) continue;
            }

            let new_comment = document.getElementById("comment_template").content.cloneNode(true);
            new_comment.querySelector(".deleted").innerText = c.deleted ? "[DELETED]" : "";
            new_comment.querySelector(".name").innerText = c.name;
            new_comment.querySelector(".date").innerText = c.date;
            new_comment.querySelector(".text").innerText = c.text;

            new_comment.querySelector(".delete_comment").dataset.comment_key = key; //used to tell which comment was deleted in event listener
            if(c.deleted){new_comment.querySelector(".delete_comment").style.visibility = "hidden";} //don't allow deleting deleted comments

            div.querySelector(".comments").appendChild(new_comment);
        }
    }
    deleted_toggle.style.display = deleted_comment_exists ? "block" : "none";
}