window.addEventListener('DOMContentLoaded', event => {
  new TNCMap('viewDiv');
  new ToolBar('toolbar');
  //new Carousel('resultado-carousel');
  new Panel();

  document.getElementById('nav-ver-todo').addEventListener('click', event => {
    const layer = window.tnc_map.layers.find(layer => layer.title === 'Predios');
    layer.definitionExpression = '';
  });
});