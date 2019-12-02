class BiodiversidadRepository {

  static getTabla() {
    return {
      name: this.TABLE_NAME,
      columns: {
        id: { primaryKey: true, autoIncrement: true },
        ID_region: { dataType: 'string' },
        ID_proyecto: { dataType: 'string' },
        grupo_tnc: { dataType: 'string' },
        cobertura: { dataType: 'string' },
        nombre_comun: { dataType: 'string' }
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
      const biodiversidadRequest = esriRequest(window.tncConfig.urls.biodiversidad, queryOptions);
      biodiversidadRequest.then(response => {
        const data = response.data.features.map(feature => {
          const  {
            ID_region,
            ID_proyecto,
            grupo_tnc,
            cobertura,
            nombre_comun
          } = feature.attributes;
          return {
            ID_region,
            ID_proyecto,
            grupo_tnc,
            cobertura,
            nombre_comun
          }
        });
        return window.store.insertRows(this.TABLE_NAME, data);
      });
    });
  }

  static async getData() {
    const results = await window.store.select(this.TABLE_NAME);
    
    return !!results ? results : [];
  }

  static async getRegionData (region) {
    const results = await window.store.select(this.TABLE_NAME, {ID_region: region});
    
    return !!results ? results : [];
  }

  static async getUniqueSpeciesPerGroupAndCover () {
    const results = await window.store.count(this.TABLE_NAME, {nombre_comun: {
      groupBy: ["grupo_tnc", "cobertura"],
      distinct: true
    }});
    return !!results ? results : [];
  }

}

BiodiversidadRepository.TABLE_NAME = 'Biodiversidad';