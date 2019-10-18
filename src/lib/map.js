class TNCMap {

  constructor(container) {
    
    require(['esri/WebMap', 'esri/views/MapView'], function (WebMap, MapView) {
      window.tnc_map = new WebMap({
        portalItem: {
          id: "d4f6dbcfa8d341c39156c9c73e0576f1"
        },  
        basemap: 'satellite',
        slider: false
      });
    
      var view = new MapView({
        container,
        map: window.tnc_map,
        center: [-73.5, 4.5],
        zoom: 6
      });
    
      view.ui.remove('zoom');
    })

  }
}
