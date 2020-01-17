class EstrategiaSelector {
  
  constructor(el) {
    this._el = document.getElementById(el);
    this._selectorToggle = document.getElementById('toggle-selector-estrategias');
  }

  createSelector(estrategias) {
    this._renderHTML(estrategias);
  }

  _renderHTML(options) {
    const markup = /* html */`
      <ul class="selector selector-estrategias">
        ${options.map(estrategia => 
          `<li class="js-selector-item" 
              data-estrategia="${estrategia.id}"
              data-color="${estrategia.color}"
              style="border-left: 4px solid ${estrategia.color}"
              >${estrategia.nombre}</li>`).join('')}
      </ul>
    `;

    this._el.innerHTML = markup;
    this._registerEventHandlers();
  }

  _registerEventHandlers() {
    this._selectorToggle.addEventListener('click', event => {
      this._el.classList.toggle('navigation__selector--visible');
      document.getElementById('selector-proyectos').classList.remove('navigation__selector--visible');
    });

    const itemsEstrategia = document.querySelectorAll('.js-selector-item[data-estrategia]');

    if(itemsEstrategia) {
      itemsEstrategia.forEach(item => {
        item.addEventListener('click', event => {
          const estrategiaId = event.currentTarget.dataset.estrategia;
          if(estrategiaId !== '02') {
            alert('No hay predios para la estrategia seleccionada');
          } else {
            this._closeSelector();
            const estrategiaColor = event.currentTarget.dataset.color;
            window.map.changeEstrategia(estrategiaId);
            changeThemeColor(estrategiaColor);
          }
        });

        item.addEventListener('mouseenter', event => {
          //console.log(event.currentTarget.dataset.estrategia);
        });
      });
    }

  }

  _closeSelector() {
    this._el.classList.remove('navigation__selector--visible');
  }
}

class ProyectoSelector  {
  constructor(el) {
    this._el = document.getElementById(el);
    this._selectorToggle = document.getElementById('toggle-selector-proyecto');
  }

  createSelector(proyectos) {
    this._renderHTML(proyectos);
  }

  _renderHTML(options) {
    const markup = `
      <ul class="selector selector-proyecto">
        ${options.map(proyecto => 
          `<li class="js-selector-item" 
              data-proyecto="${proyecto.id}"
              data-color="${proyecto.color}"
              style="border-left: 4px solid ${proyecto.color}"
              >${proyecto.nombre}</li>`).join('')}
      </ul>
    `;

    this._el.innerHTML = markup;
    this._registerEventHandlers();
  }

  _registerEventHandlers() {
    this._selectorToggle.addEventListener('click', event => {
      this._el.classList.toggle('navigation__selector--visible');
      document.getElementById('selector-estrategias').classList.remove('navigation__selector--visible');
    });

    const itemsProyecto = document.querySelectorAll('.js-selector-item[data-proyecto]');

    if(itemsProyecto) {
      itemsProyecto.forEach(item => {
        item.addEventListener('click', event => {
          this._closeSelector();
          const proyectoId = event.currentTarget.dataset.proyecto;
          const proyectoColor = event.currentTarget.dataset.color;
          window.map.changeProyecto(proyectoId);
          changeThemeColor(proyectoColor);
        });
      });
    }

  }

  _closeSelector() {
    this._el.classList.remove('navigation__selector--visible');
  }
}