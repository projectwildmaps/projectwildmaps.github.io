function autoPan(info_window_content){
    /*Function to replace google's auto panning when we open an info window, so we can pan
    to avoid our legend, which is fatter than the default controls

    To use, pass a div element that's in the info window. Call the function after
    waiting about 10ms past when the info window is opened, so the browser has time
    to render the info window, allowing us to get width / height / position.
    */

    //Get dialog div (the highest up div that's part of the infowindow)
    let dialog_div = info_window_content;
    while(dialog_div.role != "dialog"){
        dialog_div = dialog_div.parentElement;
    }

    box = dialog_div.getBoundingClientRect();

    let needed_left = Math.min(0, box.x - autopan_margin.left);
    let needed_right = Math.max(0, box.right - (window.innerWidth - autopan_margin.right));
    let needed_top = Math.min(0, box.y - autopan_margin.top);
    let needed_bottom = Math.max(0, box.bottom - (window.innerHeight - autopan_margin.bottom));

    let dx_pan = needed_left + needed_right; //eh it works
    let dy_pan = needed_top + needed_bottom;

    map.panBy(dx_pan, dy_pan);
}