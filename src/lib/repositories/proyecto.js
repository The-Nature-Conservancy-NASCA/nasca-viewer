class ProyectoRepository {

  static getTabla() {
    return  {
      name: this.TABLE_NAME,
      columns: {
        ID_proyecto: { primaryKey: true, dataType: 'string' },
        ID_estrategia: { dataType: 'string' },
        nombre: { dataType: 'string' },
        descripcion: { dataType: 'string' },
        color: { dataType: 'string' },
        fondo: { dataType: 'string' },
        icono: { dataType: 'string' }
      }
    };
  }

  static async listProyectos() {
    const results = await window.store.select(this.TABLE_NAME);
    
    if(results.length && results.length > 1 ) {
      return results.map(result => {
        const {ID_estrategia, ID_proyecto, nombre, color } = result;
        return {
          id: ID_proyecto,
          estrategia: ID_estrategia,
          nombre,
          color
        };
      });
    }
  }

}

ProyectoRepository.TABLE_NAME = 'Proyectos'