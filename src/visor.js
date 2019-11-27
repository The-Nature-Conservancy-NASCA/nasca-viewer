window.store = new Store();
const eventBus = new Eventbus();

window.addEventListener('DOMContentLoaded', event => {
  window.map = new TNCMap('map-div');
  new ToolBar('toolbar');
  new Carousel('resultado-carousel');
  new Panel();
  const selectEstrategias = new EstrategiaSelector('selector-estrategias');
  const selectProyectos = new ProyectoSelector('selector-proyectos');

  document.getElementById('nav-ver-todo').addEventListener('click', event => {
    const layer = window.tnc_map.layers.find(layer => layer.title === 'Predios');
    layer.definitionExpression = '';
  });

  EstrategiaRepository.listEstrategias().then(estrategias => {
    selectEstrategias.createSelector(estrategias);
  });

  ProyectoRepository.listProyectos().then(proyectos => {
    selectProyectos.createSelector(proyectos);
  });

});

const changeThemeColor = (newColor) => {
  document.documentElement.style.setProperty('--theme-color', newColor);
  document.documentElement.style.setProperty('--theme-color-hover', pSBC(0.3, newColor));
  document.documentElement.style.setProperty('--theme-color-active', pSBC(-0.5, newColor));
};