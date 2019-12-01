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

  constructor() {
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
}