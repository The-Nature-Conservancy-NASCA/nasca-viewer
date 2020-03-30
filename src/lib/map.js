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
      this.colorQuery = this.coloresLayer.createQuery();
      this.colorQuery.where = "1=1";
      this.colorQuery.outFields = ["*"];
      this.bioIconsQuery = this.bioIconsLayer.createQuery();
      this.bioIconsQuery.where = "1=1";
      this.bioIconsQuery.outFields = ["grupo_tnc", "url"];
      
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
          this.coloresLayer.queryFeatures(this.colorQuery),
          ProyectoRepository.getProjectsSpecificInformation()
        ];
        Promise.all(promises).then(result => {
          // inicializar nivel, valor y componente de visualizacion
          this.featureClicked = false;
          this.vizLevel;
          this.vizLevelValue;
          this.isNewFeature;
          this.renderedComponents = [];
  
          // definir momentos, iconos biodiversidad y colores coberturas
          this.moments = result[0];
          this.bioIcons = new Map(result[1].features.map(obj => [obj.attributes.grupo_tnc, obj.attributes.url]));
          this.colors = this.colorsToObject(result[2].features);

          // almacenar textos especificos de proyecto para cada componente
          this.specificInformation = result[3];

          // poner helper texts
          this.setHelperTexts();
  
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
        this.featureClicked = true;
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
        this.featureClicked = false;
        this.vizLevel = null;
        this.vizLevelValue = null;
        this.view.graphics.removeAll();
        d3.selectAll(".panel__stats *").remove();
        this.clearSpecificInformation();
        this.setHelperTexts();
      }
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
      const text = this.specificInformation[projectId][informationField];
      div.innerHTML = marked(text);
    });
  }

  clearSelectionSubContextPredio() {
    document.querySelectorAll(".panel__selection-predio").forEach(div => {
      div.innerHTML = "";
    });
  }

  clearSpecificInformation() {
    document.querySelectorAll(".panel__specific__information").forEach(div => {
      div.innerHTML = "";
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

  getSpeciesCountByLandcover(region) {
    const queryOptions = {
      where: `ID_region = '${region}'`,
      returnGeometry: false,
      groupByFieldsForStatistics: ["grupo_tnc", "momento", "cobertura", "especie"],
      outStatistics: JSON.stringify([{statisticType: "count", onStatisticField: "especie", outStatisticFieldName: "count"}]),
      f: "json"
    }
    const promise = new Promise(resolve => {
      this.esriRequest(this.biodiversityQueryUrl, {query: queryOptions}).then(response => {
        const uniqueSpeciesPerGroup = [];
        const data = [];
        response.data.features.forEach(feature => {
          var attributes = feature.attributes;
          let group = data.find(item => item.name === attributes.grupo_tnc);
          let groupCopy = uniqueSpeciesPerGroup.find(item => item.name === attributes.grupo_tnc);
          if (!group) {
            group = { name: attributes.grupo_tnc, data: [] };
            groupCopy = { name: attributes.grupo_tnc, data: [] };
            data.push(group);
            uniqueSpeciesPerGroup.push(groupCopy);
          }
          let momentData = group.data.find(item => item.moment === attributes.momento);
          let momentUniqueSpecies = groupCopy.data.find(item => item.moment === attributes.momento);
          if (!momentData) {
            momentData = { moment: attributes.momento, landcovers: [] };
            momentUniqueSpecies = { moment: attributes.momento, species: [] };
            group.data.push(momentData);
            groupCopy.data.push(momentUniqueSpecies);
          }
          let landcoverData = momentData.landcovers.find(item => item.name === attributes.cobertura);
          if(landcoverData) {
            landcoverData.count += 1;
          } else {
            landcoverData = { name: attributes.cobertura, count: 1 };
            momentData.landcovers.push(landcoverData);
          }
          if (!momentUniqueSpecies.species.includes(attributes.especie)) {
            momentUniqueSpecies.species.push(attributes.especie);
          }
        });
        uniqueSpeciesPerGroup.forEach(group => {
          group.data.forEach(moment => {
            data.find(item => item.name === group.name).data.find(item => item.moment === moment.moment).count = moment.species.length;
          });
        });
        resolve(data);
      })
    });
    return promise;
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
    if (!this.featureClicked) {
      return;
    }
    const component = d3.event.target.getAttribute("data-tab");
    if (this.isNewFeature) {
      this.isNewFeature = false;
      this.renderedComponents = [];
    } else {
      if (this.renderedComponents.includes(component)) {
        return;  // no se renderiza nada
      }
    }

    if (component === "biodiversidad") {
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
      d3.select("#panel-biodiversidad .panel__stats").selectAll("*").remove();
      if (level == "predio") {
        this.setBiodiverstiyHelperText();
        resolve(true);
      } else if (level == "region") {
        const container = new BiodiversityContainer("#panel-biodiversidad .panel__stats", this.colors, this.moments[this.projectId]);
        this.getSpeciesCountByLandcover(value).then(data => {
          container.destroyLoader();
          data.forEach(group => {
            container.addPieChart(group.name, group.data, this.bioIcons.get(group.name));
          });
          container.renderTimeSlider();
          resolve(true);
        });
      }
    });
    return promise;
  }

  renderCarbonComponent(level, value) {
    const promise = new Promise(resolve => {
      d3.select("#panel-carbono .panel__stats").selectAll("*").remove();
      if (level === "predio") {
        const carbonNumbersContainer = new CarbonNumbersContainer("#panel-carbono .panel__stats");
        PredioRepository.getStockAndCaptureValues(value).then(obj => {
          carbonNumbersContainer.renderTemplate(obj.stock, obj.capture);
          resolve(true);
        });
      } else if (level === "region") {
        this.stackedArea = new StackedArea("#panel-carbono .panel__stats");
        this.carbonoQuery.where = `ID_region = '${value}'`;
        this.carbonoLayer.queryFeatures(this.carbonoQuery).then(result => {
          ProyectoRepository.getClosingYearAndLandcoverStartYear(this.projectId).then(obj => {
            this.stackedArea.renderGraphic(result.features, null, obj.closingYear, obj.landcoverStartYear);
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
      d3.select("#panel-cobertura .panel__stats").selectAll("*").remove();
      this.treemap = new Treemap("#panel-cobertura .panel__stats", this.colors);
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

  setBiodiverstiyHelperText() {
    const template = `
      <div class="helper__text__container">
        <p class="helper__text">${window.tncConfig.strings.biodiversity_helper_text}</p>
      <div/>
    `;
    document.querySelector("#panel-biodiversidad .panel__stats").innerHTML = template;
  }

  setHelperTexts() {
    const template = `
      <div class="helper__text__container">
        <p class="helper__text">${window.tncConfig.strings.general_helper_text}</p>
      <div/>
    `;
    this.setBiodiverstiyHelperText();
    document.querySelector("#panel-carbono .panel__stats").innerHTML = template;
    document.querySelector("#panel-cobertura .panel__stats").innerHTML = template;
    document.querySelector("#panel-implementacion .panel__stats").innerHTML = template;
  }
}
