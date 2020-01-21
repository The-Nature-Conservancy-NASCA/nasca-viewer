const PANEL = {
  CLASSES: {
    PANEL_ACTIVE: 'panel__tab-panel--active',
    TAB_ACTIVE: 'panel__tab--active',
    TAB_DISABLED: 'panel__tab--disabled',
    EXPANDED: 'expanded'
  },
  SELECTORS: {
    PANEL_TAB: '.panel__tab-panel',
    TAB: '.panel__tab',
    INFO_ICONS: '.js-show-component-info',
    TOGGLE_PANEL: '.panel__expand'
  },
  EVENTS: {
    CLICK: 'click'
  }
}

class Panel {

  constructor(el) {
    this._el = document.getElementById(el);
    this._renderHTML();
    this._tabs = document.querySelectorAll(PANEL.SELECTORS.TAB);
    this._tabPanels = document.querySelectorAll(PANEL.SELECTORS.PANEL_TAB);
    this._informationIcons = document.querySelectorAll(PANEL.SELECTORS.INFO_ICONS);
    this._togglePanel = document.querySelector(PANEL.SELECTORS.TOGGLE_PANEL);
    eventBus.addEventListener('predioClicked', event => {
      this._disableTab('biodiversidad');
    });
    eventBus.addEventListener('regionClicked', event => {
      this._enableTab('biodiversidad');
    });
    eventBus.addEventListener('mapClick', event => {
      this._showPanel();
    });
    this.registerHandlers();
  }

  registerHandlers() {
    this._tabs.forEach(tab => {
      tab.addEventListener(PANEL.EVENTS.CLICK, event => {
        if (tab.classList.contains(PANEL.CLASSES.TAB_DISABLED)) {
          return;
        }
        this.activatePanel(event.currentTarget.dataset.tab);
        document.querySelector(`.${PANEL.CLASSES.TAB_ACTIVE}`).classList.remove(PANEL.CLASSES.TAB_ACTIVE);
        event.currentTarget.classList.add(PANEL.CLASSES.TAB_ACTIVE);
      });
    });

    this._informationIcons.forEach(icon => {
      icon.addEventListener('click', event => {
        const componente = event.target.dataset.component;
        if (componente) {
          window.modalPopup.openModal(window.tncConfig.specificInformation[componente]);
        }
      });
    });

    this._togglePanel.addEventListener(PANEL.EVENTS.CLICK, event => {
      this.togglePanelVisibility();
    });
    
    if(getProyectoInitial()) {
      ProyectoRepository.getProyecto(getProyectoInitial()).then(proyecto => {
        document.querySelectorAll(".panel__selection-context").forEach(div => {
          div.innerHTML =  proyecto.nombre;
        });
      });
    }

    if(getEstrategiaInitial()) {
      EstrategiaRepository.getEstrategia(getEstrategiaInitial()).then(estrategia => {
        document.querySelectorAll(".panel__selection-context").forEach(div => {
          div.innerHTML =  estrategia.nombre;
        });
      });
    }
  }

  togglePanelVisibility() {
    this._el.classList.toggle(PANEL.CLASSES.EXPANDED);
    this._togglePanel.classList.toggle(PANEL.CLASSES.EXPANDED);
  }

  _showPanel() {
    this._el.classList.add(PANEL.CLASSES.EXPANDED);
    this._togglePanel.classList.add(PANEL.CLASSES.EXPANDED);
  }

  activatePanel(tab) {
    document.querySelector(`.${PANEL.CLASSES.PANEL_ACTIVE}`).classList.remove(PANEL.CLASSES.PANEL_ACTIVE);
    document.getElementById(`panel-${tab}`).classList.add(PANEL.CLASSES.PANEL_ACTIVE);
    if(tab === 'biodiversidad') {
      eventBus.emitEventListeners('biodiversidadClicked');
    }
  }

  _disableTab(tab) {
    const tabElement = document.querySelector(`${PANEL.SELECTORS.TAB}[data-tab="${tab}"`);
    tabElement.classList.add(PANEL.CLASSES.TAB_DISABLED);
    tabElement.removeEventListener('click');
  }
 
  _enableTab(tab) {
    const tabElement = document.querySelector(`${PANEL.SELECTORS.TAB}[data-tab="${tab}"`);
    tabElement.classList.remove(PANEL.CLASSES.TAB_DISABLED);
    tabElement.addEventListener(PANEL.EVENTS.CLICK, event => {
      if (tabElement.classList.contains(PANEL.CLASSES.TAB_DISABLED)) {
        return;
      }
      this.activatePanel(event.currentTarget.dataset.tab);
      document.querySelector(`.${PANEL.CLASSES.TAB_ACTIVE}`).classList.remove(PANEL.CLASSES.TAB_ACTIVE);
      event.currentTarget.classList.add(PANEL.CLASSES.TAB_ACTIVE);
    });
  }

  _renderSelection() {
    return /* html */`<div class="panel__selection">
                        <h3 class="panel__selection-context"></h3>
                      </div>`;
  }

  _renderHTML() {
    const html = /* html */
      `
      <header class="panel__header">
        <ul class="panel__tabs">
          <li class="panel__tab panel__tab--active" data-tab='carbono'>
            ${window.tncConfig.strings.carbono}
          </li>
          <li class="panel__tab" data-tab='cobertura'>
            ${window.tncConfig.strings.coberturas}
          </li>
          <li class="panel__tab" data-tab='implementacion'>
            ${window.tncConfig.strings.implementaciones}
          </li>
          <li class="panel__tab" data-tab='biodiversidad'>
            ${window.tncConfig.strings.biodiversidad}
          </li>
        </ul>
      </header>
      <section class="resultados">
        <div class="panel__tab-panel panel__tab-panel--active" id="panel-carbono">
          ${this._renderSelection()}
          <p class="panel__information">${window.tncConfig.specificInformation.carbono.content}</p>
          <span class="js-panel-warning">${window.tncConfig.strings.warning_panel}</span>
          <div id="graph__carbono"></div>
          <div id="tooltip__carbono" class="tooltip"></div>
        </div>
        <div class="panel__tab-panel" id="panel-biodiversidad">
          ${this._renderSelection()}
          <p class="panel__information">${window.tncConfig.specificInformation.biodiversidad.content}</p>
          <div id="biodiversidad-resultados">
            <span class="js-panel-warning">${window.tncConfig.strings.warning_panel}</span>
          </div>
          <div id="container__biodiversidad"></div>
          <div id="tooltip__biodiversidad" class="tooltip"></div>
          <div id="resultado-carousel"></div>
        </div>
        <div class="panel__tab-panel" id="panel-cobertura">
          ${this._renderSelection()}
          <p class="panel__information">${window.tncConfig.specificInformation.cobertura.content}</p>
          <div id="graph__coberturas"></div>
          <select name="time__coberturas" id="time__coberturas" class="time__select"></select>
          <div id="tooltip__coberturas" class="tooltip"></div>
        </div>
        <div class="panel__tab-panel" id="panel-implementacion">
          ${this._renderSelection()}
          <p class="panel__information">${window.tncConfig.specificInformation.implementacion.content}</p>
          <span class="js-panel-warning">${window.tncConfig.strings.warning_panel}</span>
          <div id="graph__implementaciones"></div>
          <div id="tooltip__implementaciones" class="tooltip"></div>
        </div>
      </section>
      <div class="panel__expand">
        <img src="/img/keyboard_arrow_right.png" >
      </div>
      `;
    
      this._el.innerHTML = html;
  }
}