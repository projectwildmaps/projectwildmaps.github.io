function autoPan(info_window_content){
    //function to replace google's auto panning when we open an info window, so we can pan
    //to avoid our legend, which is fatter than the default controls

    let margin = { //min px margin from the info window
        left: 11,
        right: 115,
        top: window.innerWidth > 400 ? 61 : 101,
        bottom: 33
    }
    // google's default margins are ish {left:61, right:79, top:61, bottom:83}

    //Get dialog div (the highest up div that's part of the infowindow)
    let dialog_div = info_window_content;
    while(dialog_div.role != "dialog"){
        dialog_div = dialog_div.parentElement;
    }

    box = dialog_div.getBoundingClientRect();

    let needed_left = Math.min(0, box.x - margin.left);
    let needed_right = Math.max(0, box.right - (window.innerWidth - margin.right));
    let needed_top = Math.min(0, box.y - margin.top);
    let needed_bottom = Math.max(0, box.bottom - (window.innerHeight - margin.bottom));

    let dx_pan = needed_left + needed_right; //eh it works
    let dy_pan = needed_top + needed_bottom;

    map.panBy(dx_pan, dy_pan);
}