const elementosProyecto = document.querySelectorAll('.proyectos__card');

elementosProyecto.forEach(proyecto => {
  proyecto.addEventListener('click', event => {
    const selectedId = event.currentTarget.getAttribute('id');
    elementosProyecto.forEach(element => {
      if(element.getAttribute('id') !== selectedId) {
          element.classList.add('not-selected');
          element.classList.remove('selected');
      } else {
        element.classList.add('selected');
        element.classList.remove('not-selected');
      }
    });
  });
});
