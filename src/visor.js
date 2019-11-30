window.store = new Store();
const eventBus = new Eventbus();

class Visor {

  constructor() {
    window.store.loadData();
    window.map = new TNCMap('map-div');
    new ToolBar('toolbar');
    new Carousel('resultado-carousel');
    new Panel();
    const selectEstrategias = new EstrategiaSelector('selector-estrategias');
    const selectProyectos = new ProyectoSelector('selector-proyectos');
    const modalPopup = new Modal();
  
    document.getElementById('nav-ver-todo').addEventListener('click', event => {
      const layer = window.tnc_map.layers.find(layer => layer.title === 'Predios');
      layer.definitionExpression = '';
    });
  
    document.querySelector('.js-show-general-info').addEventListener('click', event => {
      modalPopup.openModal(window.tncConfig.generalInformation);
    });
  
    EstrategiaRepository.listEstrategias().then(estrategias => {
      selectEstrategias.createSelector(estrategias);
    });
  
    ProyectoRepository.listProyectos().then(proyectos => {
      selectProyectos.createSelector(proyectos);
    });
    
  }

}

fetch('/json/config.json').then(response => {
  response.json().then(config => {
    window.tncConfig = config;
    new Visor();
  });

});


const changeThemeColor = (newColor) => {
  document.documentElement.style.setProperty('--theme-color', newColor);
  document.documentElement.style.setProperty('--theme-color-hover', pSBC(0.3, newColor));
  document.documentElement.style.setProperty('--theme-color-active', pSBC(-0.5, newColor));
};

