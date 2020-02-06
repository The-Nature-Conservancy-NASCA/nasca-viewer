class Visor {

  constructor() {
    eventBus.addEventListener('coberturaLoaded', event => {
      document.querySelector('.loader').classList.add('hidden');
      window.modalPopup.openModal({header: window.tncConfig.strings.warning_panel});
    });
    this._loadData();
    new ToolBar('toolbar');
    new Panel('panel-resultados');
    window.map = new TNCMap('map-div');
    //new Carousel('resultado-carousel');
    const selectEstrategias = new EstrategiaSelector('selector-estrategias');
    window.modalPopup = new Modal();
  
    document.getElementById('nav-ver-todo').addEventListener('click', event => {
      window.map.filterLayers('');
    });
  
    document.querySelector('.js-show-general-info').addEventListener('click', event => {
      window.modalPopup.openModal(window.tncConfig.generalInformation);
    });
  
    const estrategiaRequest = EstrategiaRepository.listEstrategias().then(estrategias => {
      selectEstrategias.createSelector(estrategias);
    });

  }

  _loadData() {
    CarouselRepository.loadData();
    CoberturasRepository.loadData();
  }

}

const eventBus = new Eventbus();
fetch(Urls.getRelativeUrl('/json/config.json')).then(response => {
  response.json().then(config => {
    window.store = new Store();
    const lang =/* window.navigator.language.slice(0, 2) || */document.documentElement.lang;
    window.tncConfig = config[lang];
    new Visor();
  });

});

const changeThemeColor = (newColor) => {
  document.documentElement.style.setProperty('--theme-color', newColor);
  document.documentElement.style.setProperty('--theme-color-hover', pSBC(0.3, newColor));
  document.documentElement.style.setProperty('--theme-color-active', pSBC(-0.5, newColor));
};

function getEstrategiaInitial() {
  const estrategia = Urls.queryParam('estrategia');
  return estrategia ? estrategia : window.sessionStorage.getItem('estrategia');
}

function getProyectoInitial() {
  const proyecto = Urls.queryParam('proyecto');
  return proyecto ? proyecto : window.sessionStorage.getItem('proyecto'); 
}