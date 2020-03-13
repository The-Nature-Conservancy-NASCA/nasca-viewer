class ProyectoRepository {

  static getTabla() {
    return  {
      name: this.TABLE_NAME,
      columns: {
        ID_proyecto: { primaryKey: true, dataType: 'string' },
        ID_estrategia: { dataType: 'string' },
        nombre: { dataType: 'string' },
        descripcion: { dataType: 'string' },
        descripcion_carbono: { dataType: 'string' },
        descripcion_coberturas: { dataType: 'string' },
        descripcion_implementaciones: { dataType: 'string' },
        descripcion_biodiversidad: { dataType: 'string' },
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

  static async listProyectos(estrategia) {
    const results = await window.store.select(this.TABLE_NAME, {
      ID_estrategia: estrategia
    });
    
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

  static async getProyectosOfEstrategia(estrategia) {
    const results = await window.store.select(this.TABLE_NAME, {
      ID_estrategia: estrategia
    });

    if (results && results.length > 1) {
      return results.map(proyecto => proyecto.ID_proyecto);
    }
  }

  static async getColor(id) {
    const result = await window.store.select(this.TABLE_NAME, {
      ID_proyecto: id
    });

    return result[0].color;
  }

  static async getProyecto(id) {
    try {
      const results = await window.store.select(this.TABLE_NAME, {
        ID_proyecto: id
      });
      return results[0];
      
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  static async getSpecificInformationText(id, field) {
    const result = await window.store.select(this.TABLE_NAME, {
      ID_proyecto: id
    });

    return result[0][field];
  }

  static async getClosingYear(id) {
    const result = await window.store.select(this.TABLE_NAME, {
      ID_proyecto: id
    });

    return new Date(result[0].fecha_cierre).getFullYear();
  }
}

ProyectoRepository.TABLE_NAME = 'Proyectos'