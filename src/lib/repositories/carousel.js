class CarouselRepository {
  
  static getTabla() {
    return {
      name: this.TABLE_NAME,
      columns: {
        id: { primaryKey: true, dataType: 'number' },
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
      const carouselRequest = esriRequest(window.tncConfig.urls.carrusel, queryOptions);
      carouselRequest.then(response => {
        const carouselData = response.data.features.map(feature => {
          const { OBJECTID, Especie, URL, nombre_comun } = feature.attributes;
          return {
            id: OBJECTID,
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