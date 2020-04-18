class Eventbus {
  constructor() {
    this._eventTopics = {};
  }

  addEventListener(event, listener) {
    if (!this._eventTopics[event] || this._eventTopics[event].length < 1) {
      this._eventTopics[event] = [];
    }
    this._eventTopics[event].push(listener);
  }

  emitEventListeners(event, params) {
    if (!this._eventTopics[event] || this._eventTopics[event].length < 1) {
      return;
    }
    this._eventTopics[event].forEach(listener => {
      listener(!!params ? params : {});
    });
  }

  removeListener(event, listener) {
    if (!this._eventTopics[event] || this._eventTopics[event].length < 1) {
      return;
    }
    delete this._eventTopics[event];
  }

  getListener(event) {
    return this._eventTopics[event];
  }
}