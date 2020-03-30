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

  static async getProjectsSpecificInformation() {
    const projects = await window.store.select(this.TABLE_NAME);
    const result = {};
    projects.forEach(project => {
      result[project.ID_proyecto] = {
        descripcion_biodiversidad: project.descripcion_biodiversidad,
        descripcion_carbono: project.descripcion_carbono,
        descripcion_coberturas: project.descripcion_coberturas,
        descripcion_implementaciones: project.descripcion_implementaciones
      };
    });
    return result;
  }

  static async getClosingYearAndLandcoverStartYear(id) {
    const result = await window.store.select(this.TABLE_NAME, {
      ID_proyecto: id
    });

    const closingYear = new Date(result[0].fecha_cierre).getFullYear();
    const landcoverStartYear = result[0].inicio_coberturas;

    return { closingYear, landcoverStartYear } ;
  }

  static async getMoments() {
    const moments = {
      "Línea base": { field: "fecha_linea_base", value: "0" },
      "Seguimiento 1": { field: "fecha_seguimiento1", value: "1" },
      "Seguimiento 2" : { field: "fecha_seguimiento2", value: "2" },
      "Cierre": { field: "fecha_cierre", value: "3"}
    };
    const result = {};
    const projects = await window.store.select(this.TABLE_NAME);
    projects.forEach(project => {
      const projectMoments = [];
      for (let label in moments) {
        const obj = moments[label];
        if (project[obj.field]) {
          projectMoments.push(
            {
              name: label,
              value: obj.value,
              year: new Date(project[obj.field]).getFullYear()
            }
          )
        }
      }
      result[project.ID_proyecto] = projectMoments;
    });
    return result;
  }
}

ProyectoRepository.TABLE_NAME = 'Proyectos'