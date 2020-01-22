class Urls {
  static queryParam(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  }

  static getRelativeUrl(url) {
    return window.location.pathname.includes('/en/') ? `..${url}` : `.${url}` ;
  }
}