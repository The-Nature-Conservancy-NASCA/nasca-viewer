const elementosEstrategias = document.querySelectorAll('.estrategias__card');

elementosEstrategias.forEach(estrategia => {
  estrategia.addEventListener('click', event => {
    const selectedId = event.currentTarget.dataset.estrategia ;
    document.querySelector('.estrategias').classList.add('collapsed');
    showProyectos(selectedId);
  });
});

function showProyectos(estrategiaId) {
  const proyecto = document.querySelector(`.proyectos#${estrategiaId}`);
  proyecto.classList.remove('hidden');
}
