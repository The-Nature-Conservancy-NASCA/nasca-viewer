class CarouselRepository {
  
  static getTabla() {
    return {
      name: this.TABLE_NAME,
      columns: {
        id: { primaryKey: true, dataType: 'number' },
        region: { dataType: 'string' },
        nombre: { dataType: 'string' },
        especie: { dataType: 'string' },
        url: { dataType: 'string' },
      }
    };
  }

  static async loadData() {
    require(['esri/request'], esriRequest => {
      const queryOptions = {
        query: {
          f: 'json',
          where: '1=1',
          outFields: '*',
          returnGeometry: false
        },
        responseType: 'json'
      };
      const carouselRequest = esriRequest(`${window.tncConfig.urls.service}/10/query`, queryOptions);
      carouselRequest.then(response => {
        const carouselData = response.data.features.map(feature => {
          const { OBJECTID, ID_region, Especie, URL, nombre_comun } = feature.attributes;
          return {
            id: OBJECTID,
            region: ID_region,
            especie: Especie,
            url: URL,
            nombre: nombre_comun
          }
        });
        return window.store.insertRows(this.TABLE_NAME, carouselData);
      });
    });
  }

  static async getData() {
    const results = await window.store.select(this.TABLE_NAME);
    
    return !!results ? results : [];
  }
}

CarouselRepository.TABLE_NAME = 'Carrusel';