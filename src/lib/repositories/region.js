class RegionRepository {

  static getTabla() {
    return  {
      name: this.TABLE_NAME,
      columns: {
        ID_region: { primaryKey: true, dataType: 'string' },
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
          outFields: ["ID_region", "nombre"]
        },
        responseType: 'json'
      };
      const request = esriRequest(window.tncConfig.urls.regiones, queryOptions);
      request.then(response => {
        const regionesData = response.data.features.map(feature => {
          const { ID_region, nombre } = feature.attributes;

          return { ID_region, nombre };
        });
        window.store.insertRows(this.TABLE_NAME, regionesData).then(result => {
          eventBus.emitEventListeners('regionesLoaded');
        });
      });
    });
  }


  static async getRegion(id) {
    const results = await window.store.select(this.TABLE_NAME, {
      ID_region: id
    });

    return results[0];
  }

}

RegionRepository.TABLE_NAME = 'Regiones'