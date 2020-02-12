class TNCMap {
  
  constructor(container) {
    require([
      'esri/Color',
      'esri/Graphic',
      'esri/WebMap',
      'esri/views/MapView',
      'esri/widgets/BasemapGallery',
      'esri/widgets/LayerList',
      'esri/widgets/Legend',
      'esri/widgets/Search',
      'esri/widgets/Print',
      'esri/widgets/Zoom',
      'esri/widgets/ScaleBar',
      'esri/tasks/Locator',
      'esri/layers/FeatureLayer',
      'esri/symbols/SimpleLineSymbol',
      'esri/symbols/SimpleFillSymbol'
    ],
      function(
          Color,
          Graphic,
          WebMap,
          MapView,
          BasemapGallery,
          LayerList,
          Legend,
          Search,
          Print,
          Zoom,
          ScaleBar,
          Locator,
          FeatureLayer,
          SimpleLineSymbol,
          SimpleFillSymbol
      ) {

      this.Color = Color;
      this.Graphic = Graphic;
      this.SimpleLineSymbol = SimpleLineSymbol
      this.SimpleFillSymbol = SimpleFillSymbol;
      this.prediosLayer = new FeatureLayer({
        url: "https://services9.arcgis.com/LQG65AprqDvQfUnp/arcgis/rest/services/TNCServices4/FeatureServer/1"
      });
      this.carbonoLayer = new FeatureLayer({
        url: "https://services9.arcgis.com/LQG65AprqDvQfUnp/ArcGIS/rest/services/TNCServices4/FeatureServer/11/query"
      });
      this.implementacionesLayer = new FeatureLayer({
        url: "https://services9.arcgis.com/LQG65AprqDvQfUnp/ArcGIS/rest/services/TNCServices4/FeatureServer/8"
      });
      this.biodiversidadLayer = new FeatureLayer({
        url: "https://services9.arcgis.com/LQG65AprqDvQfUnp/arcgis/rest/services/TNCServices4/FeatureServer/2"
      });
      this.coloresLayer = new FeatureLayer({
        url: "https://services9.arcgis.com/LQG65AprqDvQfUnp/arcgis/rest/services/TNCServices4/FeatureServer/12"
      });
      this.bioIconsLayer = new FeatureLayer({
        url: "https://services9.arcgis.com/LQG65AprqDvQfUnp/ArcGIS/rest/services/iconos_biodiversidad/FeatureServer/0"
      });
      this.prediosQuery = this.prediosLayer.createQuery();
      this.prediosQuery.outFields  = ["Id_predio"];
      this.prediosQuery.returnGeometry = false;
      this.carbonoQuery = this.carbonoLayer.createQuery();
      this.carbonoQuery.outFields = ["*"];
      this.implementacionesQuery = this.implementacionesLayer.createQuery();
      this.implementacionesQuery.outFields = ["*"];
      this.biodiversityQuery = this.biodiversidadLayer.createQuery();
      this.biodiversityQuery.returnGeometry = false;
      this.biodiversityGroups = ["grupo_tnc", "cobertura"];
      this.biodiversityCountField = "genero";
      this.colorQuery = this.coloresLayer.createQuery();
      this.colorQuery.where = "1=1";
      this.colorQuery.outFields = ["*"];
      this.bioIconsQuery = this.bioIconsLayer.createQuery();
      this.bioIconsQuery.outFields = ["grupo_tnc", "url"];
      this.bioQuery = this.biodiversidadLayer.createQuery();
      this.bioQuery.returnGeometry = false;
      this.bioQuery.outFields = ['ID_region', 'cantidad_individuos', 'grupo_tnc'];
      const sumPopulation = {
        onStatisticField: "grupo_tnc",
        outStatisticFieldName: "cantidad",
        statisticType: "count"
      };
      this.bioQuery.outStatistics = [sumPopulation];
      this.bioQuery.groupByFieldsForStatistics = ['grupo_tnc'];
      
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

      new Print({
        view: this.view,
        printServiceUrl: 'https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',
        container: 'print-map'
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
        window.tnc_map.layers.items.find(item => item.title === "Predios").outFields = ["*"];
        window.tnc_map.layers.items.find(item => item.title === "Regiones").outFields = ["*"];
        const estrategiaInitial = getEstrategiaInitial();
        let definitionExpression = null;

        if (estrategiaInitial) {
          changeSelectionContext()
          EstrategiaRepository.getColor(estrategiaInitial).then(color => { changeThemeColor(color); });
          ProyectoRepository.getProyectosOfEstrategia(estrategiaInitial).then(proyectos => {
            definitionExpression = `ID_proyecto in (${proyectos.map(item => `'${item}'`).join(',')})`;
          });
        }
        const proyecto = getProyectoInitial();
        if(proyecto) {
          ProyectoRepository.getColor(proyecto).then(color => {
            changeThemeColor(color);
          });
          definitionExpression = `ID_proyecto='${proyecto}'`;
        }
        
        this.filterLayers(definitionExpression);
          
        this.view.on("click", this.mapClick.bind(this));
      });

      this.view.ui.remove('zoom');

      this.coloresLayer.queryFeatures(this.colorQuery)
      .then(r => {
        const colors = this.colorsToObject(r.features);
        this.treeMap = new TreeMap("#graph__coberturas", colors);
      })
      this.stackedAreaChart = new StackedAreaChart("#graph__carbono");
      this.barChart = new BarChart("#graph__implementaciones");
    }.bind(this));
  }


  mapClick(event) {
    this.view.hitTest(event).then((response) => {
      const { predio, region } = this.extractIds(response.results);
      eventBus.emitEventListeners('mapClick', { predio, region });
      document.querySelectorAll(".js-panel-warning").forEach(span => {
        span.style.display = "none";
      });
      if (predio || region) {
        let layerTitle;
        if (predio) {
          layerTitle = "Predios";
        } else if (region) {
          layerTitle = "Regiones";
        }
        const layer = response.results.find(item => item.graphic.layer.title === layerTitle);
        const projectId = layer.graphic.attributes["ID_proyecto"];
        const regionId = layer.graphic.attributes["ID_region"];
        this.changeSelectionContext(projectId);
        this.changeSelectionSubContext(regionId);
        this.highlightFeature(layer.graphic.geometry);
      } else {
        this.view.graphics.removeAll();
        d3.selectAll("svg.treemap").remove();
        d3.selectAll("svg.bar").remove();
        d3.selectAll("svg.area").remove();
        d3.selectAll("svg.pie").remove();
      }
      if(predio) {
        // eventBus.emitEventListeners('predioClicked');
        CoberturasRepository.getUniqueYearsByPredio(predio).then(years => {
          CoberturasRepository.getCoberturasByPredio(predio).then(results => {
            this.treeMap.renderGraphic(results, "project", "predio", years, years[0], true);
          });
        });
        
        this.implementacionesQuery.where = `ID_predio = '${predio}'`;
        this.implementacionesLayer.queryFeatures(this.implementacionesQuery).then(result => {
          const feat = result.features[0].attributes;
          const data = [
            {"name": "Manejo Sostenible", "value": feat.area_manejo_sostenible},
            {"name": "Bosque", "value": feat.area_bosque},
            {"name": "Restauración", "value": feat.area_restauracion},
            {"name": "Producción Sostenible", "value": feat.areas_p_sostenibles}
          ]
          this.barChart.renderGraphic(data);
        });

        d3.selectAll(".group__container").remove();
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
            });
          });

          const prediosList = prediosIds.map(el => `'${el}'`).join(",");
          this.implementacionesQuery.where = `ID_predio in (${prediosList})`;
          this.implementacionesLayer.queryFeatures(this.implementacionesQuery).then(result => {
            const data = [
              {"name": "Manejo Sostenible", "value": 0},
              {"name": "Bosque", "value": 0},
              {"name": "Restauración", "value": 0},
              {"name": "Producción Sostenible", "value": 0}
            ];
            result.features.forEach(el => {
              const feat = el.attributes;
              data[0].value += feat.area_manejo_sostenible;
              data[1].value += feat.area_bosque;
              data[2].value += feat.area_restauracion;
              data[3].value += feat.areas_p_sostenibles;
            });
            this.barChart.renderGraphic(data);
          });
        });

        this.carbonoQuery.where = `ID_region = '${region}'`;
        this.carbonoLayer.queryFeatures(this.carbonoQuery).then(result => {
          this.stackedAreaChart.renderGraphic(result.features, null);
        });

        this.getBiodiversityPerLandcoverData(region).then(res => {
          d3.selectAll(".group__container").remove();
          res.forEach(el => {
            const group = el.name;
            this.biodiversityQuery.where = `ID_region = '${region}' AND grupo_tnc = '${group}'`;
            this.biodiversityQuery.returnDistinctValues = true;
            this.biodiversityQuery.returnCountOnly = false;
            this.biodiversityQuery.outFields = ["especie"];
            this.biodiversidadLayer.queryFeatures(this.biodiversityQuery).then(species => {
              const iconsQuery = this.bioIconsLayer.createQuery();
              iconsQuery.outFields = ["grupo_tnc", "url"];
              iconsQuery.where = `grupo_tnc = '${group}'`;
              this.bioIconsLayer.queryFeatures(iconsQuery).then(icon => {
                const iconUrl = icon.features[0].attributes.url;
                const count = species.features.length;
                const groupContainer = d3.select("#container__biodiversidad").append("div").attr("class", "group__container");
                const header = groupContainer.append("div").attr("class", "group__header");
                header.append("h5").text(group);
                header.append("h6").text(count);
                const graphic = groupContainer
                  .append("div")
                    .attr("class", "group__graphic")
                    .attr("id", `graph__${group}`);
                graphic.append("img")
                  .attr("src", iconUrl)
                  .attr("class", "biodiversity__icon");
                const pieChart = new PieChart(`#graph__${group}`);
                pieChart.renderGraphic(el.values);
              });
            });
          });
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
    const promise = new Promise ((resolve, reject) => {
      const startingWhere = `ID_region = '${region}'`
      this.biodiversityQuery.where = startingWhere;
      this.biodiversityQuery.outFields = this.biodiversityGroups;
      this.biodiversityQuery.returnDistinctValues = true;
      this.biodiversidadLayer.queryFeatures(this.biodiversityQuery).then(result => {
        this.biodiversityQuery.outFields = this.biodiversityCountField;
        this.biodiversityQuery.returnCountOnly = true;
        const promises = [];
        const idx = [];
        result.features.forEach(el => {
          this.biodiversityQuery.where = `${startingWhere} AND grupo_tnc = '${el.attributes.grupo_tnc}' AND cobertura = '${el.attributes.cobertura}'`;
          promises.push(this.biodiversidadLayer.queryFeatures(this.biodiversityQuery));
          idx.push({"grupo_tnc": el.attributes.grupo_tnc, "cobertura": el.attributes.cobertura});
        });
        const data = [];
        Promise.all(promises).then(values => {
          values.forEach((el, i) => {
            const grupo_tnc = idx[i].grupo_tnc;
            const cobertura = idx[i].cobertura;
            const count = el.features.length;
            const groupExists = !!data.filter(item => item.name === grupo_tnc).length;
            if (!groupExists) {
              const obj = {
                "name": grupo_tnc, 
                "values": []
              };
              obj.values.push({
                "name": cobertura,
                "value": count
              });
              data.push(obj);
            } else {
              const group = data.filter(item => item.name === grupo_tnc)[0];
              group.values.push({
                "name": cobertura,
                "value": count
              });
            }
          });
          resolve(data);
        });
      });
    });
    return promise;
  }
  
  changeEstrategia(estrategiaId) {
    ProyectoRepository.getProyectosOfEstrategia(estrategiaId).then(proyectos => {
      const definitionExpression = `ID_proyecto in (${proyectos.map(item => `'${item}'`).join(',')})`;
      this.filterLayers(definitionExpression);
    });
    // EstrategiaRepository.getEstrategia(estrategiaId).then(estrategia => {
    //   document.querySelectorAll(".panel__selection-context").forEach(div => {
    //     div.innerHTML =  estrategia.nombre;
    //   });
    // });
  }

  changeProyecto(proyectoId) {
    const definitionExpression = `ID_proyecto='${proyectoId}'`;
    this.filterLayers(definitionExpression);
    ProyectoRepository.getProyecto(proyectoId).then(proyecto => {
      document.querySelectorAll(".panel__selection-context").forEach(div => {
        div.innerHTML = proyecto.nombre;
      });
    });
  }

  changeSelectionContext(projectId) {
    ProyectoRepository.getProyecto(projectId).then(proyecto => {
      document.querySelectorAll(".panel__selection-context").forEach(div => {
        div.innerHTML = proyecto.nombre;
      });
    });
  }

  changeSelectionSubContext(regionId) {
    RegionRepository.getRegion(regionId).then(region => {
      document.querySelectorAll(".panel__selection-subcontext").forEach(div => {
        div.innerHTML = region.nombre;
      });
    })
  }

  filterLayers(definitionExpression) {
    const layers = window.tnc_map.layers.filter(layer => layer.title === 'Predios' || layer.title === 'Regiones');
    layers.forEach(layer => {
      layer.when(() => {
        layer.definitionExpression = definitionExpression;
      });
    });
  }

  highlightFeature(geometry) {
    if (geometry.type === "polygon") {
      const symbol = new this.SimpleFillSymbol(
        "solid",
        new this.SimpleLineSymbol("solid", new this.Color([232,104,80]), 2),
        new this.Color([232,104,80,0.25])
      );
      const graphic = new this.Graphic(geometry, symbol);
      this.view.graphics.removeAll();
      this.view.graphics.add(graphic);
    }
  }
}
