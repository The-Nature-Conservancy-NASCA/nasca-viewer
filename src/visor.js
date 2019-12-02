class Visor {

  constructor() {
    eventBus.addEventListener('coberturaLoaded', event => {
      document.querySelector('.loader').classList.add('hidden');
    });
    this._loadData();
    new ToolBar('toolbar');
    new Panel('panel-resultados');
    window.map = new TNCMap('map-div');
    new Carousel('resultado-carousel');
    const selectEstrategias = new EstrategiaSelector('selector-estrategias');
    const selectProyectos = new ProyectoSelector('selector-proyectos');
    window.modalPopup = new Modal();
  
    document.getElementById('nav-ver-todo').addEventListener('click', event => {
      const layer = window.tnc_map.layers.find(layer => layer.title === 'Predios');
      layer.definitionExpression = '';
    });
  
    document.querySelector('.js-show-general-info').addEventListener('click', event => {
      window.modalPopup.openModal(window.tncConfig.generalInformation);
    });
  
    EstrategiaRepository.listEstrategias().then(estrategias => {
      selectEstrategias.createSelector(estrategias);
    });
  
    ProyectoRepository.listProyectos().then(proyectos => {
      selectProyectos.createSelector(proyectos);
    });
    
  }

  _loadData() {
    CarouselRepository.loadData();
    CoberturasRepository.loadData();
  }

}

const eventBus = new Eventbus();
fetch('/json/config.json').then(response => {
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
