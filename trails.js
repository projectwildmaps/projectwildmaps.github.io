
function windowControlTrail(e, infoWindow, map) {
    e.infoWindowHtml = "<div class='googft-info-window'>" +
        "<h1>" + e.row['ns3:name'].value + "</h1>" +
        "<i>" + e.row['ns3:segment'].value + "</i>" +
        "<p>" + e.row['Description'].value + "</p>" +
        "<b>Overall Difficulty:</b> " + e.row['Overall Difficulty'].value + "<br>" +
        "<b>Length:</b> " + e.row['Length'].value + "<br>" +
        "<b>Steepness:</b> " + e.row['Steepness'].value + "<br>" +
        "<b>Trail/Tread Condition:</b> " + e.row['Trail/Tread Condition'].value + "<br>" +
        "<b>Blaze Color:</b> " + e.row['Blaze Color'].value + "<br>" +
        "<b>USGS/USFS Number:</b> " + e.row['USGS/USFS Number'].value + "<br>" +
        "<b>Allowed Uses:</b> " + e.row['Allowed Uses'].value + "<br>" +
        "<b>Hikes That Use This Trail:</b> " + e.row['Hikes That Use This Trail'].value + "<br>" +
        "</div>";
    infoWindow.setOptions({
        content: e.infoWindowHtml,
        position: e.latLng,
        pixelOffset: e.pixelOffset
    });
    infoWindow.open(map);
}
function TrailControl(controlDiv, map) { //Pertains to the button that controls whether or not to show trails

    // Set CSS styles for the DIV containing the control
    // Setting padding to 5 px will offset the control
    // from the edge of the map
    controlDiv.style.padding = '5px';

    // Set CSS for the control border
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = 'white';
    controlUI.style.borderStyle = 'solid';
    controlUI.style.borderWidth = '2px';
    controlUI.style.cursor = 'pointer';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to show/hide the trails';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior
    var controlText = document.createElement('div');
    controlText.style.fontFamily = 'Arial,sans-serif';
    controlText.style.fontSize = '12px';
    controlText.style.paddingLeft = '4px';
    controlText.style.paddingRight = '4px';
    controlText.innerHTML = '<b>Trails</b>';
    controlUI.appendChild(controlText);

    // Setup the click event listeners
    google.maps.event.addDomListener(controlUI, 'click', toggleTrails);

}
function toggleTrails() // This is to turn on and off the trails when the trails button is clicked
{
    if (trailLayer.getMap() === map)
        hideTrails();
    else
        showTrails();
}
function hideTrails() // This turns off the display of the trails. This function is called when toggleTrails happens.
{
    trailLayer.setMap(null);
}
function showTrails() // This turns on the display of the trails. This function is called when toggleTrails happens.
{
    trailLayer.setMap(map);
}