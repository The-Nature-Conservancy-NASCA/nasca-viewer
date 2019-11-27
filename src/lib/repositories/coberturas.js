class CoberturasRepository {

  static getTabla() {
    return {
      name: this.TABLE_NAME,
      columns: {
        OBJECTID: { primaryKey: true, dataType: 'number' }
      }
    };
  }

  static async loadData() {
    require(['esri/request'], esriRequest => {
      const queryOptions = {
        query: {
          f: 'json',
          where: '1=1',
          maxRecordCountFactor: 5,
          outFields: ["OBJECTID", "ID_predio", "ID_cobertura", "corine1", "corine2", "cobertura_proyecto", "verificacion", "porcentaje_area", "fecha_visita", "carbono_biomasa", "carbono_suelos", "carbono_madera", "subcobertura_proyecto"]
        },
        responseType: 'json'
      };
      const request = esriRequest(window.tncConfig.urls.coberturas, queryOptions);
      request.then(response => {
        const coberturasData = response.data.features.map(feature => {
          return feature.attributes;
        });
        return window.store.insertRows(this.TABLE_NAME, coberturasData);
      });
    });
  }
}

CoberturasRepository.TABLE_NAME = 'Coberturas';