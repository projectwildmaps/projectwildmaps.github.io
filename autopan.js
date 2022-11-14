function autoPan(info_window_content){
    //function to replace google's auto panning when we open an info window, so we can pan
    //to avoid our legend, which is fatter than the default controls

    let margin = { //min px margin from the info window's CONTENT viewing box (not full info window)
        left: 23,
        right: 115,
        top: window.innerWidth > 400 ? 73 : 113,
        bottom: 33
    }
    // google's default margins are ish {left:73, right:79, top:73, bottom:83}

    //Get content box, getting parents so we have the fixed height viewing box,
    //in case the actual content is big and doesn't fit in the viewing box
    let view_div = info_window_content.parentElement;
    if(!view_div.classList.contains("gm-style-iw-d")){view_div = view_div.parentElement;}
    let box = info_window_content.parentElement.parentElement.getBoundingClientRect();

    let dx_needed_left = Math.min(0, box.x - margin.left);
    let dx_needed_right = Math.max(0, (box.x + box.width) - (window.innerWidth - margin.right));
    let dy_needed_top = Math.min(0, box.y - margin.top);
    let dx_needed_bottom = Math.max(0, (box.y + box.height) - (window.innerHeight - margin.bottom));

    let dx_pan = dx_needed_left + dx_needed_right; //eh it works
    let dy_pan = dy_needed_top + dx_needed_bottom;

    map.panBy(dx_pan, dy_pan);
}