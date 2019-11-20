class Store {

  constructor() {
    this._createConection();
    this._createDatabase();
  }

  async insertRow(table, data) {
    const inserted = await this._connection.insert({
      into: table,
      values: [data]
    });

    if (inserted > 0) {
      console.info('Fila insertada');
    }
  }

  async insertRows(table, data) {
    const inserted = await this._connection.insert({
      into: table,
      values: data
    });

    if (inserted > 0) {
      console.info(inserted, 'Filas insertadas');
    }
  }

  _createConection() {
    this._connection = new JsStore.Instance(new Worker('js/jsstore.worker.js'));
  }

  async _createDatabase() {
    const tables = this._createTables();
    const databaseOptions = {
      name: 'tnc',
      tables
    }

    const isDatabaseCreated = await this._connection.initDb(databaseOptions);
    if (isDatabaseCreated) {
      console.log('DB iniciada');
    }

  }

  _createTables() {
    const estrategias = {
      name: 'Estrategias',
      columns: {
        ID_estrategia: { primaryKey: true, dataType: 'string' },
        nombre: { dataType: 'string' },
        descripcion: { dataType: 'string' },
        color: { dataType: 'string' },
        fondo: { dataType: 'string' },
        icono: { dataType: 'string' }
      }
    };

    const proyectos = {
      name: 'Proyectos',
      columns: {
        ID_proyecto: { primaryKey: true, dataType: 'string' },
        ID_estrategia: { dataType: 'string' },
        nombre: { dataType: 'string' },
        descripcion: { dataType: 'string' },
        color: { dataType: 'string' },
        fondo: { dataType: 'string' },
        icono: { dataType: 'string' }
      }
    }

    return [estrategias];
  }
}