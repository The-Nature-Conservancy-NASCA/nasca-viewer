class CoberturasRepository {

  static getTabla() {
    return {
      name: this.TABLE_NAME,
      columns: {
        OBJECTID: { primaryKey: true, dataType: 'number' },
        ID_predio: { dataType: 'string' }
      }
    };
  }

  static async loadData() {
    require(['esri/request'], esriRequest => {
      const queryOptions = {
        query: {
          f: 'json',
          where: '1=1',
          outFields: ["OBJECTID", "ID_predio", "ID_cobertura", "corine1", "corine2", "cobertura_proyecto", "verificacion", "porcentaje_area", "fecha_visita", "carbono_biomasa", "carbono_suelos", "carbono_madera", "subcobertura_proyecto", "porcentaje_region"]
        },
        responseType: 'json'
      };
      const request = esriRequest(window.tncConfig.urls.coberturas, queryOptions);
      request.then(response => {
        const coberturasData = response.data.features.map(feature => {
          const {
            OBJECTID,
            ID_predio,
            ID_cobertura,
            corine1,
            corine2,
            cobertura_proyecto,
            verificacion,
            porcentaje_area,
            fecha_visita,
            carbono_biomasa,
            carbono_suelos,
            carbono_madera,
            subcobertura_proyecto,
            porcentaje_region
          } = feature.attributes;
          
          const visita = new Date(fecha_visita).getFullYear();

          return {
            OBJECTID,
            ID_predio,
            ID_cobertura,
            corine1,
            corine2,
            cobertura_proyecto,
            verificacion,
            porcentaje_area,
            visita,
            carbono_biomasa,
            carbono_suelos,
            carbono_madera,
            subcobertura_proyecto,
            porcentaje_region
          };
        });
        window.store.insertRows(this.TABLE_NAME, coberturasData).then(result => {
          eventBus.emitEventListeners('coberturaLoaded');
        });
      });
    });
  }

  static async getCoberturasByPredio(predio) {
    const results = await window.store.select(this.TABLE_NAME, { ID_predio: predio });
    return !!results ? results : [];
  }

  static async getCoberturasByPredios(predios) {
    const results = await window.store.select(this.TABLE_NAME, {ID_predio: {in: predios}});
    return !!results ? results : [];
  }

  static async getUniqueYearsByPredio(predio) {
    const results = await window.store.groupBy(
      this.TABLE_NAME,
      {ID_predio: predio},
      "visita"
    );
    if (results) {
      const years = [];
      results.forEach(el => {
        years.push(el.visita);
      });
      years.reverse();
      return years;
    } else {
      return [];
    }
  }

  static async getUniqueYearsByPredios(predios) {
    const results = await window.store.groupBy(
      this.TABLE_NAME,
      {ID_predio: {in: predios}},
      "visita"
    );
    if (results) {
      const years = [];
      results.forEach(el => {
        years.push(el.visita);
      });
      years.reverse();
      return years;
    } else {
      return [];
    }
  }
}

CoberturasRepository.TABLE_NAME = 'Coberturas';