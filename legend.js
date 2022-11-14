function initLegend() {
    var legend = document.getElementById('legend');
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(legend);

    let all_checkbox = document.createElement("input");
    all_checkbox.id = "all_checkbox";
    all_checkbox.type = "checkbox";
    all_checkbox.checked = true;
    all_checkbox.addEventListener("change", function () {
        let checkboxes = legend.querySelectorAll("input");
        if (all_checkbox.checked) {
            markerLayer.forEach((marker) => {
                markerLayer.revertStyle(marker);
            })
            checkboxes.forEach((box) => box.checked = true)
        }
        else {
            markerLayer.forEach((marker) => {
                markerLayer.overrideStyle(marker, { visible: false });
            })
            checkboxes.forEach((box) => box.checked = false)
        }
    });

    let all_label = document.createElement("label");
    all_label.htmlFor = all_checkbox.id;
    all_label.innerHTML = "<b><u>All Categories</u></b>";

    let all_category_entry = document.createElement("div");
    all_category_entry.appendChild(all_checkbox);
    all_category_entry.appendChild(all_label);
    legend.appendChild(all_category_entry);

    categories.forEach((category) => {
        //shorten long VAM description
        let display_name = (category == "VAM (View Appreciation Moment)") ? "VAM" : category;

        let legend_entry = document.createElement("div");

        let checkbox = document.createElement("input");
        checkbox.id = category + "_checkbox";
        checkbox.type = "checkbox";
        checkbox.checked = true;
        checkbox.addEventListener("change", function () {
            markerLayer.forEach((marker) => {
                let marker_category = marker.getProperty('category')
                if (marker_category == category ||
                    (category == "Other" && !categories.includes(marker_category))
                ) {
                    console.log(category, marker_category)
                    if (checkbox.checked) {
                        markerLayer.revertStyle(marker);
                    }
                    else {
                        markerLayer.overrideStyle(marker, { visible: false });
                    }
                }
            })
        })
        legend_entry.appendChild(checkbox);

        let label = document.createElement("label");
        label.htmlFor = checkbox.id;
        label.innerHTML = '<img src="' + getDot(category) + '"> ' + display_name;
        legend_entry.appendChild(label);

        legend.appendChild(legend_entry);
    });
}