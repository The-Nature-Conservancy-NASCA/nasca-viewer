class Urls {
  static queryParam(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  }
}