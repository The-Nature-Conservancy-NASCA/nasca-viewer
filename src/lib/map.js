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
      'esri/symbols/SimpleFillSymbol',
      'esri/request'
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
          SimpleFillSymbol,
          esriRequest
      ) {

      this.Color = Color;
      this.Graphic = Graphic;
      this.SimpleLineSymbol = SimpleLineSymbol
      this.SimpleFillSymbol = SimpleFillSymbol;
      this.esriRequest = esriRequest;
      this.biodiversityQueryUrl = "https://services9.arcgis.com/LQG65AprqDvQfUnp/arcgis/rest/services/TNCServices4/FeatureServer/2/query";
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
      this.bioIconsQuery.where = "1=1";
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
        allPlaceholder: window.tncConfig.strings.all_placeholder,
        sources: [
          {
            locator: new Locator({ url: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer'}),
            countryCode: 'COL',
            singleLineFieldName: 'SingleLine',
            name: window.tncConfig.strings.sitios_interes,
            localSearchOptions: {
              minScale: 300000,
              distance: 50000
            },
            placeholder: window.tncConfig.strings.placeholder_locator,
            maxResults: 3,
            maxSuggestions: 6,
            suggestionsEnabled: true,
            minSuggestCharacters: 0
          },
          {
            layer: this.biodiversidadLayer,
            name: window.tncConfig.strings.biodiversidad,
            searchFields: ["especie"],
            displayField: "especie",
            exactMatch: false,
            placeholder: window.tncConfig.strings.placeholder_biodiversidad
          },
          {
            layer: this.prediosLayer,
            name: window.tncConfig.strings.predios,
            searchFields: ["ID_predio", "nombre"],
            displayField: "nombre",
            exactMatch: false,
            placeholder: window.tncConfig.strings.placeholder_predios
          }
      ],
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
      this.view.ui.remove('zoom');
      
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


        const promises = [
          ProyectoRepository.getMoments(),
          this.bioIconsLayer.queryFeatures(this.bioIconsQuery),
          this.coloresLayer.queryFeatures(this.colorQuery)
        ];
        Promise.all(promises).then(result => {
          // inicializar nivel, valor y componente de visualizacion
          this.vizLevel;
          this.vizLevelValue;
          this.isNewFeature;
          this.renderedComponents = [];
  
          // definir momentos, iconos biodiversidad y colores coberturas
          this.moments = result[0];
          this.bioIcons = new Map(result[1].features.map(obj => [obj.attributes.grupo_tnc, obj.attributes.url]));
          this.colors = this.colorsToObject(result[2].features);
  
          // agregar evento al click del mapa y paneles
          this.view.on("click", this.mapClick.bind(this));
          d3.selectAll(".panel__tab").on("click", this.panelClick.bind(this));
        });
      });
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
        this.previousVizLevel = this.vizLevel;
        this.previousVizLevelValue = this.vizLevelValue;
        if (predio) {
          layerTitle = "Predios";
          this.vizLevel = "predio";
          this.vizLevelValue = predio;
        } else if (region) {
          layerTitle = "Regiones";
          this.vizLevel = "region";
          this.vizLevelValue = region;
        }
        this.isNewFeature = (this.vizLevel !== this.previousVizLevel) || (this.vizLevel === this.previousVizLevel && this.vizLevelValue !== this.previousVizLevelValue); 
        const layer = response.results.find(item => item.graphic.layer.title === layerTitle);
        this.projectId = layer.graphic.attributes["ID_proyecto"];
        this.regionId = layer.graphic.attributes["ID_region"];
        this.changeSelectionContext(this.projectId);
        this.changeSelectionSubContextRegion(this.regionId);
        if (predio) {
          this.changeSelectionSubContextPredio(predio);
        } else if (region) {
          this.clearSelectionSubContextPredio();
        }
        this.changeSelectionSpecificInformation(this.projectId);
        this.highlightFeature(layer.graphic.geometry);
        d3.select(".panel__tab--active").node().click();
      } else {
        this.vizLevel = null;
        this.vizLevelValue = null;
        this.view.graphics.removeAll();
        d3.select("#graph__coberturas").selectAll("*").remove();
        d3.select("#graph__carbono").selectAll("*").remove();
        d3.select("#graph__implementaciones").selectAll("*").remove();
        d3.select("#wrapper__biodiversidad").select("svg").remove();
        d3.select("#container__biodiversidad").selectAll("*").remove();
      }
    });
  }

  clickRegion(region) {




    this.getBiodiversityGroups(region).then(groups => {
      d3.select("#wrapper__biodiversidad").select("svg").remove();
      d3.select("#container__biodiversidad").selectAll("*").remove();
      const groupCountPromises = [];
      groups.forEach(group => {
        let queryParameters =  {
          where: `ID_region = '${region}' AND grupo_tnc = '${group}'`,
          outFields: "especie",
          returnGeometry: false,
          returnDistinctValues: true,
          returnCountOnly: true,
          f: "json"
        };
        groupCountPromises.push(this.esriRequest(this.biodiversityQueryUrl, {query: queryParameters}));
      });
      Promise.all(groupCountPromises).then(responses => {
        responses.forEach((response, i) => {
          // create group label with count and initialize PieChart
          const group = groups[i];
          const groupCount = response.data.count;
          const groupContainer = 
          d3.select("#container__biodiversidad")
            .append("div")
              .attr("class", "group__container");
          const header = groupContainer.append("div").attr("class", "group__header");
          header.append("h5").text(group);
          header.append("h6").text(groupCount);
          groupContainer
            .append("div")
              .attr("class", "group__graphic")
              .attr("id", `graph__${group}`);
          const pieChart = new PieChart(`#graph__${group}`, this.colors, this.bioIcons.get(group));
        });

        // get container width
        // d3.select("#panel-biodiversidad").classed("panel__tab-panel--active", true);
        // const containerWidth = d3.select("#wrapper__biodiversidad").node().offsetWidth;
        const containerWidth = 458;
        // d3.select("#panel-biodiversidad").classed("panel__tab-panel--active", false);

        // add TimeSlider
        const timeSlider = new TimeSlider("#wrapper__biodiversidad", containerWidth, 70, "#container__biodiversidad", false);
        const timeButtons = timeSlider.render(this.moments);
      });
    });
  }

  colorsToObject(features) {
    const colors = {};
    features.forEach(el => {
      colors[el.attributes.cobertura] = el.attributes.color;
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

  getBiodiversityGroups(region) {
    const queryOptions = {
      where: `ID_region = '${region}'`,
      outFields: "grupo_tnc",
      returnGeometry: false,
      returnDistinctValues: true,
      f: "json"
    }
    const promise = new Promise(resolve => {
      this.esriRequest(this.biodiversityQueryUrl, {query: queryOptions}).then(response => {
        resolve(response.data.features.map(feature => feature.attributes.grupo_tnc));
      })
    });
    return promise;
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

  changeSelectionSubContextRegion(regionId) {
    RegionRepository.getRegion(regionId).then(region => {
      document.querySelectorAll(".panel__selection-region").forEach(div => {
        div.innerHTML = region.nombre;
      });
    })
  }

  changeSelectionSubContextPredio(predioId) {
    PredioRepository.getPredio(predioId).then(predio => {
      document.querySelectorAll(".panel__selection-predio").forEach(div => {
        div.innerHTML = `&nbsp| ${predio.nombre}`;
      });
    })
  }

  changeSelectionSpecificInformation(projectId) {
    document.querySelectorAll(".panel__specific__information").forEach(div => {
      const informationField = div.getAttribute("data-information-field");
      ProyectoRepository.getSpecificInformationText(projectId, informationField).then(text => {
        div.innerHTML = marked(text);
      });
    })
  }

  clearSelectionSubContextPredio() {
    document.querySelectorAll(".panel__selection-predio").forEach(div => {
      div.innerHTML = '';
    });
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
        new this.SimpleLineSymbol("solid", new this.Color([0,168,132]), 1),
        new this.Color([115,255,223,0.25])
      );
      const graphic = new this.Graphic(geometry, symbol);
      this.view.graphics.removeAll();
      this.view.graphics.add(graphic);
    }
  }

  panelClick() {
    const component = d3.event.target.getAttribute("data-tab");
    if (this.isNewFeature) {
      this.isNewFeature = false;
      this.renderedComponents = [];
    } else {
      if (this.renderedComponents.includes(component)) {
        return;  // no se renderiza nada
      }
    }

    if (this.component === "biodiversidad") {
      this.renderBiodiversityComponent(this.vizLevel, this.vizLevelValue).then(() => {this.renderedComponents.push(component)});
    } else if (component === "carbono") {
      this.renderCarbonComponent(this.vizLevel, this.vizLevelValue).then(() => {this.renderedComponents.push(component)});
    } else if (component === "implementacion") {
      this.renderImplementationsComponent(this.vizLevel, this.vizLevelValue).then(() => {this.renderedComponents.push(component)});
    } else if (component === "cobertura") {
      this.renderLandcoverComponent(this.vizLevel, this.vizLevelValue).then(() => {this.renderedComponents.push(component)});
    }
  }

  renderBiodiversityComponent(level, value) {
    const promise = new Promise(resolve => {
      d3.select("#wrapper__biodiversidad").select("svg").remove();
      d3.select("#container__biodiversidad").selectAll("*").remove();
      resolve(true);
    });
    return promise;
  }

  renderCarbonComponent(level, value) {
    const promise = new Promise(resolve => {
      d3.select("#graph__carbono").selectAll("*").remove();
      this.stackedArea = new StackedArea("#graph__carbono");
      if (level === "predio") {
        console.log("Carbono nivel predio no ha sido implementado todavia");
        resolve(true);
      } else if (level === "region") {
        this.carbonoQuery.where = `ID_region = '${value}'`;
        this.carbonoLayer.queryFeatures(this.carbonoQuery).then(result => {
          ProyectoRepository.getClosingYear(this.projectId).then(closingYear => {
            this.stackedArea.renderGraphic(result.features, null, closingYear);
            resolve(true);
          })
        });
      }
    });
    return promise;
  }

  renderImplementationsComponent(level, value) {
    const promise = new Promise(resolve => {
      d3.select("#panel-implementacion .panel__stats").selectAll("*").remove();
      this.barChart = new BarChart("#panel-implementacion .panel__stats");
      if (level === "predio") {
        this.implementacionesQuery.where = `ID_predio = '${value}'`;
        this.implementacionesLayer.queryFeatures(this.implementacionesQuery).then(result => {
          this.barChart.renderGraphic(result.features, this.moments[this.projectId], true);
          resolve(true);
        });
      } else if (level === "region") {
        this.prediosQuery.where = `ID_region = '${value}'`;
        this.prediosLayer.queryFeatures(this.prediosQuery).then(results => {
          const prediosIds = [];
          results.features.forEach(feat => {
            prediosIds.push(feat.attributes.ID_predio);
          });  
          const prediosList = prediosIds.map(el => `'${el}'`).join(",");
          this.implementacionesQuery.where = `ID_predio in (${prediosList})`;
          this.implementacionesLayer.queryFeatures(this.implementacionesQuery).then(result => {
            this.barChart.renderGraphic(result.features, this.moments[this.projectId], true);
            resolve(true);
          });
        });
      }
    });
    return promise;
  }

  renderLandcoverComponent(level, value) {
    const promise = new Promise(resolve => {
      d3.select("#graph__coberturas").selectAll("*").remove();
      this.treemap = new Treemap("#graph__coberturas", this.colors);
      if (level === "predio") {
        CoberturasRepository.getCoberturasByPredio(value).then(results => {
          this.treemap.renderGraphic(results, "project", this.moments[this.projectId], true);
          resolve(true);
        });
      } else if (level === "region") {
        this.prediosQuery.where = `ID_region = '${value}'`;
        this.prediosLayer.queryFeatures(this.prediosQuery).then(result => {
          const prediosIds = [];
          result.features.forEach(feat => {
            prediosIds.push(feat.attributes.ID_predio);
          });
          CoberturasRepository.getCoberturasByPredios(prediosIds).then(data => {
            this.treemap.renderGraphic(data, "project", this.moments[this.projectId], true);
            resolve(true);
          });
        });
      }
    });
    return promise
  }
}
