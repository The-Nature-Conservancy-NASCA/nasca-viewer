const PANEL = {
  CLASSES: {
    PANEL_ACTIVE: 'panel__tab-panel--active',
    TAB_ACTIVE: 'panel__tab--active',
    TAB_DISABLED: 'panel__tab--disabled'
  },
  SELECTORS: {
    PANEL_TAB: '.panel__tab-panel',
    TAB: '.panel__tab',
    INFO_ICONS: '.js-show-component-info'
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
    eventBus.addEventListener('predioClicked', event => {
      this._disableTab('biodiversidad');
    });
    eventBus.addEventListener('regionClicked', event => {
      this._enableTab('biodiversidad');
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
      if (tab.classList.contains(PANEL.CLASSES.TAB_DISABLED)) {
        return;
      }
      this.activatePanel(event.currentTarget.dataset.tab);
      document.querySelector(`.${PANEL.CLASSES.TAB_ACTIVE}`).classList.remove(PANEL.CLASSES.TAB_ACTIVE);
      event.currentTarget.classList.add(PANEL.CLASSES.TAB_ACTIVE);
    });
  }

  _renderHTML() {
    const html = /* html */
      `
      <header class="panel__header">
        <ul class="panel__tabs">
          <li class="panel__tab panel__tab--active" data-tab='carbono'>
            Carbono
          </li>
          <li class="panel__tab" data-tab='cobertura'>
            Coberturas
          </li>
          <li class="panel__tab" data-tab='implementacion'>
            Implementaciones
          </li>
          <li class="panel__tab" data-tab='biodiversidad'>
            Biodiversidad
          </li>
        </ul>
      </header>
      <section class="resultados">
        <div class="panel__tab-panel panel__tab-panel--active" id="panel-carbono">
          <i class="panel__information esri-icon-description js-show-component-info" data-component="carbono"></i>
          Select a plot to see details
        </div>
        <div class="panel__tab-panel" id="panel-biodiversidad">
          <i class="panel__information esri-icon-description js-show-component-info" data-component="biodiversidad"></i>
          <div id="biodiversidad-resultados">
            Select a plot to see details
          </div>
          <div id="graph__biodiversidad"></div>
          <div id="tooltip__biodiversidad" class="tooltip"></div>
          <div id="resultado-carousel"></div>
        </div>
        <div class="panel__tab-panel" id="panel-cobertura">
          <i class="panel__information esri-icon-description js-show-component-info" data-component="cobertura"></i>
          <div id="graph__coberturas"></div>
          <div id="tooltip__coberturas" class="tooltip"></div>
        </div>
        <div class="panel__tab-panel" id="panel-implementacion">
          <i class="panel__information esri-icon-description js-show-component-info" data-component="implementacion"></i>
          Select a plot to see details
        </div>
      </section>
      `;
    
      this._el.innerHTML = html;
  }
}