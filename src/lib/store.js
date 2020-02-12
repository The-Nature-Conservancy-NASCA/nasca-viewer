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

  async groupBy(table, where, field) {
    const results = await this._connection.select({
      from: table,
      where: where,
      groupBy: field
    });

    return results;
  }
  
  loadData() {
    RegionRepository.loadData();
    PredioRepository.loadData();
    CarouselRepository.loadData();
    CoberturasRepository.loadData();
  }

  _createConection() {
    const workerUrl = '/js/jsstore.worker.js';
    this._connection = new JsStore.Instance(new Worker(Urls.getRelativeUrl(workerUrl)));
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
      RegionRepository.getTabla(),
      PredioRepository.getTabla()
    ];
  }
}