
require(['esri/Map', 'esri/views/MapView'], function (Map, MapView) {
  window.tnc_map = new Map({
    basemap: 'satellite',
    slider: false
  });

  var view = new MapView({
    container: 'viewDiv',
    map: window.tnc_map,
    center: [-73.5, 4.5],
    zoom: 6
  });

  view.ui.remove('zoom');
})
