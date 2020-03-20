class EstrategiaSelector {
  
  constructor(el) {
    this._el = document.getElementById(el);
    this._selectorToggle = document.getElementById('toggle-selector-estrategias');
  }

  createSelector(estrategias) {
    this._estrategias = estrategias;
    this._renderHTML(estrategias);
    this._createProjectSelectors();
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
    this._selectorToggle.addEventListener('mouseenter', event => {
      this._el.classList.add('navigation__selector--visible');
    });

    this._selectorToggle.addEventListener('mouseleave', event => {
      const abiertos = document.querySelectorAll('.navigation__selector--visible');
      if (abiertos.length > 0) {
        abiertos.forEach(el => {el.classList.remove('navigation__selector--visible')});
      }
    });

    const itemsEstrategia = document.querySelectorAll('.js-selector-item[data-estrategia]');

    if(itemsEstrategia) {
      itemsEstrategia.forEach(item => {
        item.addEventListener('click', event => {
          const estrategiaId = event.currentTarget.dataset.estrategia;
          if(estrategiaId !== '02') {
            window.modalPopup.openModal({header: window.tncConfig.strings.no_hay_predios, content: ''});
          } else {
            this._closeSelector();
            const estrategiaColor = event.currentTarget.dataset.color;
            window.map.changeEstrategia(estrategiaId);
            changeThemeColor(estrategiaColor);
          }
        });

        item.addEventListener('mouseenter', event => {
          const estrategiaId = event.currentTarget.dataset.estrategia;
          const abiertos = document.querySelectorAll('.proyecto-selector.navigation__selector--visible');
          if (abiertos.length > 0) {
            abiertos.forEach(el => {el.classList.remove('navigation__selector--visible')});
          }
          if (document.getElementById(`proyectos-${estrategiaId}`)) {
            document.getElementById(`proyectos-${estrategiaId}`).classList.add('navigation__selector--visible');
          }
        });
      });
    }

  }

  _createProjectSelectors() {
    this._estrategias.forEach((estrategia, index) => {
      const { id } = estrategia;
      ProyectoRepository.listProyectos(id).then(proyectos => {
        if (proyectos) {
          let div = document.createElement('div');
          div.setAttribute('class', 'navigation__selector proyecto-selector');
          div.setAttribute('id', `proyectos-${id}`);
          this._selectorToggle.append(div);
          let proyecto = new ProyectoSelector(`proyectos-${id}`, 38 * index);
          proyecto.createSelector(proyectos);
        }
      }); 
    });
  }

  _closeSelector() {
    this._el.classList.remove('navigation__selector--visible');
  }
}

class ProyectoSelector  {
  constructor(el, offsetTop) {
    this._el = document.getElementById(el);
    this._selectorToggle = document.getElementById('toggle-selector-proyecto');
    this._offsetTop = offsetTop;
    this._el.style.top = `${60 + offsetTop}px`;
    this._el.style.right = '-16px';
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