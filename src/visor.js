window.addEventListener('DOMContentLoaded', event => {
  const store = new Store();
  new TNCMap('map-div');
  new ToolBar('toolbar');
  new Carousel('resultado-carousel');
  new Panel();

  document.getElementById('nav-ver-todo').addEventListener('click', event => {
    const layer = window.tnc_map.layers.find(layer => layer.title === 'Predios');
    layer.definitionExpression = '';
  });
});