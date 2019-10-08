require(['esri/Map', 'esri/views/MapView'], function (Map, MapView) {
  var map = new Map({
    basemap: 'satellite'
  })

  var view = new MapView({
    container: 'viewDiv',
    map: map,
    center: [-73.5, 4.5],
    zoom: 6
  })
})
