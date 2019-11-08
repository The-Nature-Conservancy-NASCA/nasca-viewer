class TNCMap {

  constructor(container) {

    require(['esri/WebMap', 'esri/views/MapView', 'esri/layers/FeatureLayer'], (WebMap, MapView, FeatureLayer) => {
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
        window.tnc_map.layers.items[3].outFields = ["*"];
        const definition = this.createDefinitionExpression();
        const layer = window.tnc_map.layers.find(layer => layer.title === 'Predios');

        if(definition) {
          layer.definitionExpression = definition;
        }
          
        view.on("click", getPredioId);
      });

      view.ui.remove('zoom');

      const coberturasLayer = new FeatureLayer({
        url: "https://services9.arcgis.com/LQG65AprqDvQfUnp/ArcGIS/rest/services/TNCServices2/FeatureServer/3"
      });

      const query = coberturasLayer.createQuery();
      query.returnGeometry = false;
      query.outFields = ["ID_predio", "cobertura_actual", "sub_cobertura_actual", "area_ha"];

      const treeMap = new TreeMap("#graph__coberturas");

      function getPredioId(evt) {
        view.hitTest(evt).then((response) => {
          console.log(response);
          document.querySelector('.panel').classList.add('panel--visible');
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

  createDefinitionExpression() {
    const estrategia = window.sessionStorage.getItem('estrategia');
    if (estrategia) {
      return `ID_estrategia='${estrategia}'`;
    }
    const proyecto = window.sessionStorage.getItem('proyecto');
    if(proyecto) {
      return `ID_proyecto='${proyecto}'`;
    }
    return undefined;
  }
}
