// GLOBAL CONFIG (you can change)

// Locations we can switch to. The only required property is coords.
// mapTypeId, if specified, is the map to switch to ("roadmap", "satellite", "terrain", "Nat Geo", etc)
// zoom, if specified, is the default zoom level for this location (bigger = more zoomed in)
// The default location has the default property set to true (exactly one location must have this)
const locations = {
    "Pisgah": {
        coords: new google.maps.LatLng(35.292621, -82.833716),
        mapTypeId: "Nat Geo",
        zoom: 13,
        default: true
    },
    "Duke": {
        coords: new google.maps.LatLng(36.001046, -78.938461),
        mapTypeId: "roadmap",
        zoom: 13
    },
    "Camp Raven Knob": {
        coords: new google.maps.LatLng(36.482337, -80.861160),
        mapTypeId: "terrain",
        zoom: 14
    }
}
const default_zoom_level = 13; // uses this if zoom not specified in the default location

const categories = [
    'VAM (View Appreciation Moment)',
    'Waterfall',
    'Water',
    'Safety',
    'Campsite',
    'Pro-Tip!',
    'Landmark',
    'Funny Story',
    'Solos',
    'Other' //default, see getIcon.js
];
const dot_colors = {
    "VAM (View Appreciation Moment)": "aqua",
    "Waterfall": "#0033cc", //dark blue
    "Water": "#8ba9e4", //medium pastel blue
    "Safety": "#ffff66", //slightly pale yellow
    "Campsite": "#4ffc4f", //light green
    "Pro-Tip!": "#ff4d4d", //pastel red
    "Landmark": "#009900", //dark green
    "Funny Story": "#ffa3ee", //pink
    "Solos": "orange",
    "Other": "white"
}
const dot_radius = 4; //px
const dot_padding = 3; //extra transparent px around the dot to make dots easier to click on the map

//pixel margins from the edge of the screen that the big red pin's position needs to stay within to remain visible
//this is used in newPoint.js
const usersMarkerMargins = {
    top: 85, //don't get hidden behind the dropdown menus
    bottom: 5,
    left: 15,
    right: 120 //don't get hidden behind the legend
}

//pixel margins from the edge of the screen that the data info window should pan to avoid
//see autopan.js for how this works
//if you add a new custom map control, you may need to twiddle with these margins to avoid overlapping it
const autopan_margin = { //min px margin from the info window
    left: 11,
    right: 115,
    top: 61,
    bottom: 33
}
// google's default margins are ish {left:61, right:79, top:61, bottom:83}




// GLOBALS (not config, only code should mess with these)
var map;
var markers = {}; //stores the marker features, format "database_key": Feature object. Allows getting a marker by the database key for when we need to modify it.
var markerLayer; //global because legend.js needs to see this
var trailLayer;
var archived_visible = false; //legend.js and archive button use this

/*other globals defined in more relevant scripts
    dataInfoWindow - see dataInfoWindow.js
    inputInfoWindow - see newPoint.js
    usersMarker - see newPoint.js
*/