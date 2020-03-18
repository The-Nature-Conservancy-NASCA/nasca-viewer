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
          outFields: ["OBJECTID", "ID_predio", "ID_cobertura", "cobertura_comun", "corine2", "cobertura_proyecto", "subcobertura_proyecto", "area", "momento"]
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
            cobertura_comun,
            corine2,
            cobertura_proyecto,
            subcobertura_proyecto,
            area,
            momento
          } = feature.attributes;

          return {
            OBJECTID,
            ID_predio,
            ID_cobertura,
            cobertura_comun,
            corine2,
            cobertura_proyecto,
            subcobertura_proyecto,
            area,
            momento
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
}

CoberturasRepository.TABLE_NAME = 'Coberturas';