class TNCMap {
  
  constructor(container) {
    this._biodiversidad = new Biodiversidad('biodiversidad-resultados');
    require(['esri/WebMap',
      'esri/views/MapView',
      'esri/widgets/BasemapGallery',
      'esri/widgets/LayerList',
      'esri/widgets/Legend',
      'esri/widgets/Search',
      'esri/widgets/Zoom',
      'esri/widgets/ScaleBar',
      'esri/layers/FeatureLayer'],
      function(
          WebMap,
          MapView,
          BasemapGallery,
          LayerList,
          Legend,
          Search,
          Zoom,
          ScaleBar,
          FeatureLayer) {
      this.prediosLayer = new FeatureLayer({
        url: "https://services9.arcgis.com/LQG65AprqDvQfUnp/arcgis/rest/services/TNCServices4/FeatureServer/1"
      });
      this.biodiversidadLayer = new FeatureLayer({
        url: "https://services9.arcgis.com/LQG65AprqDvQfUnp/arcgis/rest/services/TNCServices4/FeatureServer/2"
      });
      this.coloresLayer = new FeatureLayer({
        url: "https://services9.arcgis.com/LQG65AprqDvQfUnp/arcgis/rest/services/TNCServices4/FeatureServer/12"
      });
      this.prediosQuery = this.prediosLayer.createQuery();
      this.prediosQuery.outFields  = ["Id_predio"];
      this.prediosQuery.returnGeometry = false; 
      this.bioQuery = this.biodiversidadLayer.createQuery();
      this.colorQuery = this.coloresLayer.createQuery();
      this.bioQuery.returnGeometry = false;
      this.colorQuery.where = "1=1";
      this.bioQuery.outFields = ['ID_region', 'cantidad_individuos', 'grupo_tnc'];
      const sumPopulation = {
        onStatisticField: "grupo_tnc",
        outStatisticFieldName: "cantidad",
        statisticType: "count"
      };
      this.bioQuery.outStatistics = [sumPopulation];
      this.bioQuery.groupByFieldsForStatistics = ['grupo_tnc'];
      this.colorQuery.outFields = ["*"];
      
      window.tnc_map = new WebMap({
        portalItem: {
          id: "9b5f3da3a6ae4558bbaa25d50754e286"
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

      const search = new Search({
        view: this.view,
        container: 'search-map'
      });
      
      const zoom = new Zoom({
        view: this.view
      });
      
      this.view.ui.add([zoom, scaleBar], {
        position: 'bottom-left'
      });
      
      window.tnc_map.when(() => {
        window.tnc_map.layers.items[1].outFields = ["*"];
        window.tnc_map.layers.items[2].outFields = ["*"];
        const estrategiaInitial = this._getEstrategiaInitial();
        let definitionExpression = null;

        if (estrategiaInitial) {
          EstrategiaRepository.getColor(estrategiaInitial).then(color => { changeThemeColor(color); });
          ProyectoRepository.getProyectosOfEstrategia(estrategiaInitial).then(proyectos => {
            definitionExpression = `ID_proyecto in (${proyectos.map(item => `'${item}'`).join(',')})`;
          });
        }
        const proyecto = this._getProyectoInitial();
        if(proyecto) {
          ProyectoRepository.getColor(proyecto).then(color => {
            changeThemeColor(color);
          });
          definitionExpression = `ID_proyecto='${proyecto}'`;
        }
        
        const layer = window.tnc_map.layers.find(layer => layer.title === 'Predios');
        if(definitionExpression) {
          layer.when(() => {
            layer.definitionExpression = definitionExpression;
          });
        }
          
        this.view.on("click", this.mapClick.bind(this));
      });

      this.view.ui.remove('zoom');

      this.coloresLayer.queryFeatures(this.colorQuery)
      .then(r => {
        const colors = this.colorsToObject(r.features);
        this.treeMap = new TreeMap("#graph__coberturas", colors);
      })
      this.barChart = new BarChart("#graph__biodiversidad");
    }.bind(this));
  }

  _getEstrategiaInitial() {
    const estrategia = Urls.queryParam('estrategia');
    return estrategia ? estrategia : window.sessionStorage.getItem('estrategia');
  }

  _getProyectoInitial() {
    const proyecto = Urls.queryParam('proyecto');
    return proyecto ? proyecto : window.sessionStorage.getItem('proyecto'); 
  }

  mapClick(event) {
    this.view.hitTest(event).then((response) => {
      const { predio, region } = this.extractIds(response.results);
      if(predio) {
        eventBus.emitEventListeners('predioClicked');
        CoberturasRepository.getCoberturasByPredio(predio).then(results => {
          this.treeMap.renderGraphic(results, "project", "predio");
        });
      }
      else if(region) {
        eventBus.emitEventListeners('regionClicked');
        this.prediosQuery.where = `ID_region = '${region}'`;
        this.prediosLayer.queryFeatures(this.prediosQuery).then(results => {
          const prediosIds = [];
          results.features.forEach(feat => {
            prediosIds.push(feat.attributes.ID_predio);
          });
          CoberturasRepository.getCoberturasByPredios(prediosIds).then(res => {
            this.treeMap.renderGraphic(res, "project", "region");
          });
        });
      
        this.barChart.renderGraphic();

        window.sessionStorage.region = region;
        this.bioQuery.where = `ID_region = '${region}'`;
        this.biodiversidadLayer.queryFeatures(this.bioQuery).then(results => {
          this._biodiversidad.showSpeciesCards(results.features);
          d3.selectAll('.biodiversidad__card')
          .on('click', this.groupByLandCover)
        }).catch(error => {
          console.error(error);
        });
      }
    });
  }

  colorsToObject(features) {
    const colors = {};
    features.forEach(el => {
      colors[el.attributes.ID_cobertura] = el.attributes.color;
    });
    return colors;
  }

  extractIds(results) {
    const capaPredios = results.find(result => result.graphic.layer.title === 'Predios');
    const predio = capaPredios ? capaPredios.graphic.attributes['ID_predio'] : undefined;

    const capaRegiones = results.find(result => result.graphic.layer.title === 'Regiones');
    const region = capaRegiones ? capaRegiones.graphic.attributes['ID_region'] : undefined;
    return { predio, region };
  }

  groupByLandCover() {
    console.log(this);
    console.log(window.sessionStorage.getItem('region'))
  }
  
  changeEstrategia(estrategiaId) {
    ProyectoRepository.getProyectosOfEstrategia(estrategiaId).then(proyectos => {
      const definitionExpression = `ID_proyecto in (${proyectos.map(item => `'${item}'`).join(',')})`;
      const layer = window.tnc_map.layers.find(layer => layer.title === 'Predios');
      layer.definitionExpression = definitionExpression;
    });
  }

  changeProyecto(proyectoId) {
    const definitionExpression = `ID_proyecto='${proyectoId}'`;
    const layer = window.tnc_map.layers.find(layer => layer.title === 'Predios');
    layer.definitionExpression = definitionExpression;
  }
}
