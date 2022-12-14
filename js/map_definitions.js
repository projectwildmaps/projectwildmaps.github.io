var mapBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(35, -84), //sw
    new google.maps.LatLng(35.8, -82)); //ne
var mapBoundsUSGS2013 = new google.maps.LatLngBounds(
    new google.maps.LatLng(35.25, -83),
    new google.maps.LatLng(35.5, -82.625));
var mapBoundsUSGSTiff = new google.maps.LatLngBounds(
    new google.maps.LatLng(35.10503944154214, -83.01039847222899),
    new google.maps.LatLng(35.50779134029307, -82.61437567559813));
var mapBoundsUSGSStolen = new google.maps.LatLngBounds(
    new google.maps.LatLng(34.88696759970738, -83.31711443749998),
    new google.maps.LatLng(35.746423376157786, -82.2638002285156));
var mapBoundsNatGeo = new google.maps.LatLngBounds(
    new google.maps.LatLng(35, -84),
    new google.maps.LatLng(35.81772435462227, -81.97995814172361));

var usgs2013 = new google.maps.ImageMapType({
    minZoom: 11,
    maxZoom: 15,
    getTileUrl: function (coord, zoom) {
        var proj = map.getProjection();
        var z2 = Math.pow(2, zoom);
        var tileXSize = 256 / z2;
        var tileYSize = 256 / z2;
        var tileBounds = new google.maps.LatLngBounds(
            proj.fromPointToLatLng(new google.maps.Point(coord.x * tileXSize, (coord.y + 1) * tileYSize)),
            proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * tileXSize, coord.y * tileYSize))
        );
        var y = coord.y;
        if (mapBoundsUSGS2013.intersects(tileBounds) && (11 <= zoom) && (zoom <= 15))
            return "usgs2013" + "/" + zoom + "/" + coord.x + "/" + y + ".png";
        else
            return "none.png";
    },
    tileSize: new google.maps.Size(256, 256),
    isPng: true,
    name: "USGS 2013",
    alt: "USGS 2013"
});
var usgsStolen = new google.maps.ImageMapType({
    minZoom: 10,
    maxZoom: 16,
    getTileUrl: function (coord, zoom) {
        var proj = map.getProjection();
        var z2 = Math.pow(2, zoom);
        var tileXSize = 256 / z2;
        var tileYSize = 256 / z2;
        var tileBounds = new google.maps.LatLngBounds(
            proj.fromPointToLatLng(new google.maps.Point(coord.x * tileXSize, (coord.y + 1) * tileYSize)),
            proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * tileXSize, coord.y * tileYSize))
        );
        var y = coord.y;
        if (mapBoundsUSGSStolen.intersects(tileBounds) && (10 <= zoom) && (zoom <= 16))
            return "usgsStolen" + "/" + zoom + "/" + coord.x + "/" + y + ".png";
        else
            return "none.png";
    },
    tileSize: new google.maps.Size(256, 256),
    isPng: true,
    name: "USGS",
    alt: "USGS"
});
var usgsTiff = new google.maps.ImageMapType({
    minZoom: 11,
    maxZoom: 15,
    getTileUrl: function (coord, zoom) {
        var proj = map.getProjection();
        var z2 = Math.pow(2, zoom);
        var tileXSize = 256 / z2;
        var tileYSize = 256 / z2;
        var tileBounds = new google.maps.LatLngBounds(
            proj.fromPointToLatLng(new google.maps.Point(coord.x * tileXSize, (coord.y + 1) * tileYSize)),
            proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * tileXSize, coord.y * tileYSize))
        );
        var y = coord.y;
        if (mapBoundsUSGSTiff.intersects(tileBounds) && (11 <= zoom) && (zoom <= 15))
            return "usgsTiff" + "/" + zoom + "/" + coord.x + "/" + y + ".png";
        else
            return "none.png";
    },
    tileSize: new google.maps.Size(256, 256),
    isPng: true,
    name: "USGS TIFF",
    alt: "USGS TIFF"
});
var natGeo = new google.maps.ImageMapType({
    minZoom: 12,
    maxZoom: 14,
    getTileUrl: function (coord, zoom) {
        var proj = map.getProjection();
        var z2 = Math.pow(2, zoom);
        var tileXSize = 256 / z2;
        var tileYSize = 256 / z2;
        var tileBounds = new google.maps.LatLngBounds(
            proj.fromPointToLatLng(new google.maps.Point(coord.x * tileXSize, (coord.y + 1) * tileYSize)),
            proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * tileXSize, coord.y * tileYSize))
        );
        var y = coord.y;
        if (mapBoundsNatGeo.intersects(tileBounds) && (12 <= zoom) && (zoom <= 14))
            return "natGeo" + "/" + zoom + "/" + coord.x + "/" + y + ".jpg";
        else
            return "none.png";
    },
    tileSize: new google.maps.Size(256, 256),
    name: "Nat Geo",
    alt: "Nat Geo",
    isPng: true
});