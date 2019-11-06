class TNCMap {

  constructor(container) {

    require(['esri/WebMap', 'esri/views/MapView', 'esri/request', 'esri/layers/FeatureLayer'], function (WebMap, MapView, esriRequest, FeatureLayer) {
      window.tnc_map = new WebMap({
        portalItem: {
          id: "8555040c97e94a08ac159cda460f5020"
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

      window.tnc_map.when(() => {
        window.tnc_map.layers.items[2].outFields = ["*"];
        window.tnc_map.layers.forEach(layer => {
          if (layer.layerId !== 1) {
            layer.visible = false;
          } else {
            const queryOptions = {
              query: {
                f: 'json',
                where: 'ID_proyecto=01AB',
                outFields: '*',
                returnGeometry: false
              },
              responseType: 'json'
            };

            esriRequest(layer.url + '/' + layer.layerId, queryOptions).then(response => {
              console.log(response.data)
            });
          }
        });
        view.on("click", getPredioId);
      });



      view.ui.remove('zoom');

      const coberturasLayer = new FeatureLayer({
        url: "https://services9.arcgis.com/LQG65AprqDvQfUnp/ArcGIS/rest/services/TNCServices2/FeatureServer/3"
      });

      const query = coberturasLayer.createQuery();
      query.returnGeometry = false;
      query.outFields = ["ID_predio", "cobertura_actual", "sub_cobertura_actual", "porcentaje_area"];

      const treeMap = new TreeMap("#graph__coberturas");

      function getPredioId(evt) {
        view.hitTest(evt).then((response) => {
          const predioId = response.results[0].graphic.attributes["ID_predio"];
          query.where = `ID_predio = '${predioId}'`;
          coberturasLayer.queryFeatures(query)
            .then((r) => {
              treeMap.renderGraphic(r.features);
            });
        });
      };
    });
  }
}
