class PredioRepository {

  static getTabla() {
    return  {
      name: this.TABLE_NAME,
      columns: {
        ID_predio: { primaryKey: true, dataType: 'string' },
        nombre: { dataType: 'string' }
      }
    };
  }

  static async loadData() {
    require(['esri/request'], esriRequest => {
      const queryOptions = {
        query: {
          f: 'json',
          where: '1=1',
          outFields: ["ID_predio", "nombre", "stock_carbono", "captura_carbono"],
          returnGeometry: false
        },
        responseType: 'json'
      };
      const request = esriRequest(window.tncConfig.urls.predios, queryOptions);
      request.then(response => {
        const prediosData = response.data.features.map(feature => {
          const { ID_predio, nombre, stock_carbono, captura_carbono } = feature.attributes;
          return { ID_predio, nombre, stock_carbono, captura_carbono };
        });
        window.store.insertRows(this.TABLE_NAME, prediosData).then(() => {
          eventBus.emitEventListeners('prediosLoaded');
        });
      });
    });
  }


  static async getPredio(id) {
    const results = await window.store.select(this.TABLE_NAME, {
      ID_predio: id
    });

    return results[0];
  }

}

PredioRepository.TABLE_NAME = 'Predios'