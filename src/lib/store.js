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
    try {
      const inserted = await this._connection.insert({
        into: table,
        values: data,
        upsert: true
      });

      if (inserted > 0) {
        console.info(inserted, 'Filas insertadas');
      }
    } catch (error) {
      console.error(error);
    }
  }

  async select(table, where) {
    const results = await this._connection.select({
      from: table,
      where
    });

    return results;
  }
  
  loadData() {
    CarouselRepository.loadData();
    CoberturasRepository.loadData();
    BiodiversidadRepository.loadData();
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
    return [
      EstrategiaRepository.getTabla(),
      ProyectoRepository.getTabla(),
      CarouselRepository.getTabla(),
      CoberturasRepository.getTabla(),
      BiodiversidadRepository.getTabla()
    ];
  }
}