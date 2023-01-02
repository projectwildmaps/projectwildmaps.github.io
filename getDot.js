function getDot(category, padding=0){
    // Given the category of a data point, spits out an image svg data URL for the point
    // Padding is the number of extra transparent px around the dot to make it easier to click a point on the map

    if(!categories.includes(category)) {
        category = "Other";
    }

    let width = 2*dot_radius + 2*padding + 2; //+2 so we don't chop off the sides
    let height = width;
    let svg = 
    `<svg version='1.1' width='${width}' height='${height}' xmlns='http://www.w3.org/2000/svg'>
        <circle cx='${width/2}' cy='${height/2}' r='${dot_radius}' fill='${dot_colors[category]}' stroke='black' stroke-width='1.25' />
    </svg>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}