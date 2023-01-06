function getIcon(category, padding=0, archived=false){
    // Given the category of a data point, return the SVG icon for it
    // This is a colored circle for a normal point, and a larger colored circle with an X through it for an archived point
    // Return format: {url: "___", anchor: [google.maps.Point] } - this follows the Icon interface
    // Padding is the number of extra transparent px around the icon to make it easier to click a point on the map

    if(!categories.includes(category)) {
        category = "Other";
    }

    //Normal point --------------
    if(!archived){
        let margin = 1; //so we don't chop off the sides
        let width = 2*dot_radius + 2*padding + 2*margin;
        let height = width;
        let svg = 
        `<svg version='1.1' width='${width}' height='${height}' xmlns='http://www.w3.org/2000/svg'>
            <circle cx='${width/2}' cy='${height/2}' r='${dot_radius}' fill='${dot_colors[category]}' stroke='black' stroke-width='1.25' />
        </svg>`;
        return {
            url: "data:image/svg+xml;utf8," + encodeURIComponent(svg),
            anchor: new google.maps.Point(width/2, height/2)
        }
    }

    // Archived point -------------
    // base width is 2*dot diameter, to allow room for the x
    let margin = 1; //so we don't chop off the sides
    let width = 4*dot_radius + 2*padding + 2*margin;
    let height = width;
    let offset = margin + padding; //distance from side of each of the 4 line endpoints
    let svg =
    `<svg version='1.1' width='${width}' height='${height}' xmlns='http://www.w3.org/2000/svg'>
        <circle cx='${width/2}' cy='${height/2}' r='${1.5*dot_radius}' fill='${dot_colors[category]}' stroke='black' stroke-width='1.25' />
        <line x1='${offset}' y1='${offset}' x2='${width-offset}' y2='${width-offset}' stroke='black' stroke-width='2' />
        <line x1='${width-offset}' y1='${offset}' x2='${offset}' y2='${width-offset}' stroke='black' stroke-width='2' />
    </svg>`;
    return {
        url: "data:image/svg+xml;utf8," + encodeURIComponent(svg),
        anchor: new google.maps.Point(width/2, height/2)
    }   
}