function autoPan(info_window_content, client_rect = undefined, autopan_margin_overwrite = undefined) {
    /*Function to replace google's auto panning when we open an info window, so we can pan
    to avoid our legend, which is fatter than the default controls.

    See autopan_margin config values in globals_and_config.js

    To use, pass a div element that's in the info window. Call the function after
    waiting about 10ms past when the info window is opened, so the browser has time
    to render the info window, allowing us to get width / height / position.

    Alternatively, pass in a client rect if you have one.
    */

    if (!client_rect) {
        //Get dialog div (the highest up div that's part of the infowindow)
        let dialog_div = info_window_content;
        while (dialog_div.role != "dialog") {
            dialog_div = dialog_div.parentElement;
        }
        box = dialog_div.getBoundingClientRect();
    }
    else {
        box = client_rect;
    }

    let margin = autopan_margin_overwrite ? autopan_margin_overwrite : autopan_margin;

    let needed_left = Math.min(0, box.x - margin.left);
    let needed_right = Math.max(0, box.right - (window.innerWidth - margin.right));
    let needed_top = Math.min(0, box.y - margin.top);
    let needed_bottom = Math.max(0, box.bottom - (window.innerHeight - margin.bottom));

    let dx_pan = needed_left + needed_right; //eh it works
    let dy_pan = needed_top + needed_bottom;

    map.panBy(dx_pan, dy_pan);
}