class EstrategiaRepository {

  static getTabla() {
    return {
      name: this.TABLE_NAME,
      columns: {
        ID_estrategia: { primaryKey: true, dataType: 'string' },
        nombre: { dataType: 'string' },
        descripcion: { dataType: 'string' },
        color: { dataType: 'string' },
        fondo: { dataType: 'string' },
        icono: { dataType: 'string' }
      }
    };
  }

  static async listEstrategias() {
    const results = await window.store.select(this.TABLE_NAME);
    
    if(results.length && results.length > 1 ) {
      return results.map(result => {
        const {ID_estrategia, nombre, color } = result;
        return {
          id: ID_estrategia,
          nombre,
          color
        };
      });
    }
  }

}

EstrategiaRepository.TABLE_NAME = 'Estrategias';