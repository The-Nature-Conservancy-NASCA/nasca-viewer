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
      'esri/tasks/Locator',
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
          Locator,
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
      this.biodiversityQuery = this.biodiversidadLayer.createQuery();
      this.biodiversityQuery.returnGeometry = false;
      this.biodiversityGroups = ["grupo_tnc", "cobertura"];
      this.biodiversityCountField = "genero";
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
        sources: [{
          locator: new Locator({ url: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer'}),
          countryCode: 'COL',
          singleLineFieldName: 'SingleLine',
          name: 'Custom Geocoding Service',
          localSearchOptions: {
            minScale: 300000,
            distance: 50000
          },
          placeholder: window.tncConfig.strings.buscar,
          maxResults: 3,
          maxSuggestions: 6,
          suggestionsEnabled: true,
          minSuggestCharacters: 0
        }],
        view: this.view,
        includeDefaultSources: false,
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
        
        this._filterLayers(definitionExpression);
          
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
        // eventBus.emitEventListeners('predioClicked');
        CoberturasRepository.getUniqueYearsByPredio(predio).then(years => {
          CoberturasRepository.getCoberturasByPredio(predio).then(results => {
            this.treeMap.renderGraphic(results, "project", "predio", years, years[0], true);
          });
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
            CoberturasRepository.getUniqueYearsByPredios(prediosIds).then(years => {
              this.treeMap.renderGraphic(res, "project", "region", years, years[0], true);
            })
          });
        });
      
        this.getBiodiversityPerLandcoverData(region);
        this.barChart.renderGraphic();
        // BiodiversidadRepository.getRegionData(region).then(feats => {
        //   const data = {};
        //   feats.forEach(el => {
        //     const key = el.grupo_tnc;
        //     const cover = el.cobertura;
        //     if (!key in data) {
        //       data[key] = {};
        //     }
        //     if (cover in data[key]) {
        //       data[key][cover] += 1;
        //     } else {
        //       data[key][cover] = 1;
        //     }
        //   });
        //   console.log(data);
        // })

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

  getBiodiversityPerLandcoverData(region) {
    const startingWhere = `ID_region = '${region}'`
    this.biodiversityQuery.where = startingWhere;
    this.biodiversityQuery.outFields = this.biodiversityGroups;
    this.biodiversityQuery.returnDistinctValues = true;
    this.biodiversidadLayer.queryFeatures(this.biodiversityQuery).then(result => {
      this.biodiversityQuery.outFields = this.biodiversityCountField;
      this.biodiversityQuery.returnCountOnly = true;
      const promises = [];
      const data = [];
      result.features.forEach(el => {
        this.biodiversityQuery.where = `${startingWhere} AND grupo_tnc = '${el.attributes.grupo_tnc}' AND cobertura = '${el.attributes.cobertura}'`;
        promises.push(this.biodiversidadLayer.queryFeatures(this.biodiversityQuery));
      });
      Promise.all(promises).then(values => {
        console.log(values);
      });
    });
  }
  
  changeEstrategia(estrategiaId) {
    ProyectoRepository.getProyectosOfEstrategia(estrategiaId).then(proyectos => {
      const definitionExpression = `ID_proyecto in (${proyectos.map(item => `'${item}'`).join(',')})`;
      this._filterLayers(definitionExpression);
    });
  }

  changeProyecto(proyectoId) {
    const definitionExpression = `ID_proyecto='${proyectoId}'`;
    this._filterLayers(definitionExpression);
  }

  _filterLayers(definitionExpression) {
    const layers = window.tnc_map.layers.filter(layer => layer.title === 'Predios' || layer.title === 'Regiones');
    if(definitionExpression) {
      layers.forEach(layer => {
        layer.when(() => {
          layer.definitionExpression = definitionExpression;
        });
      });
    }
  }
}
