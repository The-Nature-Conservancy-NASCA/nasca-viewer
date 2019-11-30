class CoberturasRepository {

  static getTabla() {
    return {
      name: this.TABLE_NAME,
      columns: {
        OBJECTID: { primaryKey: true, dataType: 'number' },
        ID_predio: { dataType: 'string'}
      }
    };
  }

  static async loadData() {
    require(['esri/request'], esriRequest => {
      const queryOptions = {
        query: {
          f: 'json',
          where: '1=1',
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

  static async getCoberturasByPredio(predio) {
    const results = await window.store.select(this.TABLE_NAME, { ID_predio: predio });
    return !!results ? results : [];
  }

  static async getCoberturasByPredios(predios) {
    const results = await window.store.select(this.TABLE_NAME, {ID_predio: {in: predios}});
    return !!results ? results : [];
  }
}

CoberturasRepository.TABLE_NAME = 'Coberturas';