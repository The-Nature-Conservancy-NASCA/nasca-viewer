class TNCMap {

  constructor(container) {

        
    require(['esri/WebMap', 'esri/views/MapView', 'esri/layers/FeatureLayer'], function(WebMap, MapView, FeatureLayer) {
      this.coberturasLayer = new FeatureLayer({
        url: "https://services9.arcgis.com/LQG65AprqDvQfUnp/ArcGIS/rest/services/TNCServices2/FeatureServer/3"
      });
      
      this.biodiversidadLayer = new FeatureLayer({
        url: "https://services9.arcgis.com/LQG65AprqDvQfUnp/ArcGIS/rest/services/TNCServices2/FeatureServer/2"
      });
      this.query = this.coberturasLayer.createQuery();
      this.bioQuery = this.biodiversidadLayer.createQuery();
      this.query.returnGeometry = false;
      this.bioQuery.returnGeometry = false;
      this.query.outFields = ["ID_predio", "cobertura_actual", "sub_cobertura_actual", "porcentaje_area"];
      this.bioQuery.outFields = ['ID_region', 'cantidad_individuos', 'grupo_tnc'];
      const sumPopulation = {
        onStatisticField: "grupo_tnc",
        outStatisticFieldName: "cantidad",
        statisticType: "count"
      };
      this.bioQuery.outStatistics = [sumPopulation];
      this.bioQuery.groupByFieldsForStatistics = ['grupo_tnc']
      
      window.tnc_map = new WebMap({
        portalItem: {
          id: "8555040c97e94a08ac159cda460f5020"
        },
        basemap: 'satellite',
        slider: false
      });

      this.view = new MapView({
        container,
        map: window.tnc_map,
        center: [-73.5, 4.5],
        zoom: 6
      });

      window.tnc_map.when(() => {
        window.tnc_map.layers.items[2].outFields = ["*"];
        window.tnc_map.layers.items[3].outFields = ["*"];
        const definition = this.createDefinitionExpression();
        const layer = window.tnc_map.layers.find(layer => layer.title === 'Predios');

        if(definition) {
          layer.definitionExpression = definition;
        }
          
        this.view.on("click", this.mapClick.bind(this));
      });

      this.view.ui.remove('zoom');


      this.treeMap = new TreeMap("#graph__coberturas");
    }.bind(this));
  }

  mapClick(event) {
    this.view.hitTest(event).then((response) => {
      document.querySelector('.panel').classList.add('panel--visible');
      const { predio, region } = this.extractIds(response.results);
      
      if(predio) {
        this.query.where = `ID_predio = '${predio}'`;
        this.coberturasLayer.queryFeatures(this.query)
        .then((r) => {
          this.treeMap.renderGraphic(r.features);
        });
      }
      
      this.bioQuery.where = `ID_region = '${region}'`;
      this.biodiversidadLayer.queryFeatures(this.bioQuery).then(results => {
        this.showBiodiversidad(results.features);
      }).catch(error => {
        console.error(error);
      });
    });
  }

  extractIds(results) {
    const capaPredios = results.find(result => result.graphic.layer.title === 'Predios');
    const predio = capaPredios ? capaPredios.graphic.attributes['ID_predio'] : undefined;

    const capaRegiones = results.find(result => result.graphic.layer.title === 'Regiones');
    const region = capaRegiones.graphic.attributes['ID_region'];
    return { predio, region };
  }

  showBiodiversidad(features) {
    let html = '<section class="biodiversidad">';
    features.forEach(feature => {
      const {cantidad, grupo_tnc} = feature.attributes;
      html += `<div class="biodiversidad__card" data-grupo="${grupo_tnc}">
                  <h4 class="biodiversidad__card-title">${grupo_tnc}</h4>
                  <h3 class="biodiversidad__card-count">${cantidad}</h3>
                </div>`;
    });
    html += '</section>';
    document.getElementById('biodiversidad-resultados').innerHTML = html;
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
