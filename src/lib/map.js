class TNCMap {
  
  constructor(container) {
    this._biodiversidad = new Biodiversidad('biodiversidad-resultados');
    require(['esri/WebMap',
      'esri/views/MapView',
      'esri/widgets/BasemapGallery',
      'esri/widgets/LayerList',
      'esri/widgets/Legend',
      'esri/widgets/Zoom',
      'esri/widgets/ScaleBar',
      'esri/layers/FeatureLayer'],
      function(
          WebMap,
          MapView,
          BasemapGallery,
          LayerList,
          Legend,
          Zoom,
          ScaleBar,
          FeatureLayer) {
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
      this.query.outFields = ["ID_predio", "cobertura_actual", "sub_cobertura_actual", "area_ha"];
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

      const legend = new Legend({
        view: this.view,
        container: 'leyenda-map'
      });

      const layerList = new LayerList({
        view: this.view,
        container: 'layerList-map'
      });

      const basemap = new BasemapGallery({
        view: this.view,
        container: 'basemap-map'
      });

      var scaleBar = new ScaleBar({
        view: this.view,
        unit: 'metric'
      });
      
      const zoom = new Zoom({
        view: this.view
      });
      
      this.view.ui.add([zoom, scaleBar], {
        position: 'bottom-left'
      });
      
      window.tnc_map.when(() => {
        window.tnc_map.layers.items[2].outFields = ["*"];
        window.tnc_map.layers.items[3].outFields = ["*"];
        const estrategiaLanding = window.sessionStorage.getItem('estrategia');
        let definitionExpression = null;
        if (estrategiaLanding) {
          EstrategiaRepository.getColor(estrategiaLanding).then(color => { changeThemeColor(color); });
          // TODO: Lógica para mostrar predios de los propyectos de la estrategia
        }
        const proyecto = window.sessionStorage.getItem('proyecto');
        if(proyecto) {
          ProyectoRepository.getColor(proyecto).then(color => {
            changeThemeColor(color);
          });
          definitionExpression = `ID_proyecto='${proyecto}'`;
        }

        const layer = window.tnc_map.layers.find(layer => layer.title === 'Predios');

        if(definitionExpression) {
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
      const { predio, region } = this.extractIds(response.results);
      
      if(predio) {
        this.query.where = `ID_predio = '${predio}'`;
        this.coberturasLayer.queryFeatures(this.query)
        .then((r) => {
          this.treeMap.renderGraphic(r.features);
        });
      }
      
      if(region) {
        this.bioQuery.where = `ID_region = '${region}'`;
        this.biodiversidadLayer.queryFeatures(this.bioQuery).then(results => {
          this._biodiversidad.showSpeciesCards(results.features);
        }).catch(error => {
          console.error(error);
        });
      }
    });
  }

  extractIds(results) {
    const capaPredios = results.find(result => result.graphic.layer.title === 'Predios');
    const predio = capaPredios ? capaPredios.graphic.attributes['ID_predio'] : undefined;

    const capaRegiones = results.find(result => result.graphic.layer.title === 'Regiones');
    const region = capaRegiones ? capaRegiones.graphic.attributes['ID_region'] : undefined;
    return { predio, region };
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

  changeEstrategia(estrategiaId) {
    const definitionExpression = `ID_estrategia='${estrategiaId}'`;
    const layer = window.tnc_map.layers.find(layer => layer.title === 'Predios');
    layer.definitionExpression = definitionExpression;
  }

  changeProyecto(proyectoId) {
    const definitionExpression = `ID_proyecto='${proyectoId}'`;
    const layer = window.tnc_map.layers.find(layer => layer.title === 'Predios');
    layer.definitionExpression = definitionExpression;
  }
}
