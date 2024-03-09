const mapBoundsUSGSTiff = new google.maps.LatLngBounds(
    new google.maps.LatLng(35.10503944154214, -83.01039847222899),
    new google.maps.LatLng(35.50779134029307, -82.61437567559813));
    const mapBoundsNatGeo = new google.maps.LatLngBounds(
    new google.maps.LatLng(35, -84),
    new google.maps.LatLng(35.81772435462227, -81.97995814172361));


const usgsTiff = new google.maps.ImageMapType({
    minZoom: 11,
    maxZoom: 15,
    getTileUrl: function (coord, zoom) {
        const proj = map.getProjection();
        const z2 = Math.pow(2, zoom);
        const tileXSize = 256 / z2;
        const tileYSize = 256 / z2;
        const tileBounds = new google.maps.LatLngBounds(
            proj.fromPointToLatLng(new google.maps.Point(coord.x * tileXSize, (coord.y + 1) * tileYSize)),
            proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * tileXSize, coord.y * tileYSize))
        );
        const y = coord.y;
        if (mapBoundsUSGSTiff.intersects(tileBounds) && (11 <= zoom) && (zoom <= 15))
            return "usgsTiff" + "/" + zoom + "/" + coord.x + "/" + y + ".png";
        else
            return "none.png";
    },
    tileSize: new google.maps.Size(256, 256),
    name: "USGS",
    alt: "USGS"
});


const natGeo = new google.maps.ImageMapType({
    minZoom: 12,
    maxZoom: 14,
    getTileUrl: function (coord, zoom) {
        const proj = map.getProjection();
        const z2 = Math.pow(2, zoom);
        const tileXSize = 256 / z2;
        const tileYSize = 256 / z2;
        const tileBounds = new google.maps.LatLngBounds(
            proj.fromPointToLatLng(new google.maps.Point(coord.x * tileXSize, (coord.y + 1) * tileYSize)),
            proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * tileXSize, coord.y * tileYSize))
        );
        const y = coord.y;
        if (mapBoundsNatGeo.intersects(tileBounds) && (12 <= zoom) && (zoom <= 14))
            return "natGeo" + "/" + zoom + "/" + coord.x + "/" + y + ".jpg";
        else
            return "none.png";
    },
    tileSize: new google.maps.Size(256, 256),
    name: "Nat Geo",
    alt: "Nat Geo"
});


const openStreetMap = new google.maps.ImageMapType({
    minZoom: 0,
    maxZoom: 20,
    getTileUrl: function (tile_coord, zoom) {
        return `https://tile.openstreetmap.org/${zoom}/${tile_coord.x}/${tile_coord.y}.png`
    },
    tileSize: new google.maps.Size(256, 256),
    name: "OSM",
    alt: "Open Street Map"
});