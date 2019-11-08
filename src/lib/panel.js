const PANEL = {
  CLASSES: {
    PANEL_ACTIVE: 'panel__tab-panel--active',
    TAB_ACTIVE: 'panel__tab--active'
  },
  SELECTORS: {
    PANEL_TAB: '.panel__tab-panel',
    TAB: '.panel__tab'
  },
  EVENTS: {
    CLICK: 'click'
  }
}

class Panel {

  constructor() {
    this._tabs = document.querySelectorAll(PANEL.SELECTORS.TAB);
    this._tabPanels = document.querySelectorAll(PANEL.SELECTORS.PANEL_TAB);
    this.registerHandlers();
  }

  registerHandlers() {
    this._tabs.forEach(tab => {
      tab.addEventListener(PANEL.EVENTS.CLICK, event => {
        this.activatePanel(event.currentTarget.dataset.tab);
        document.querySelector(`.${PANEL.CLASSES.TAB_ACTIVE}`).classList.remove(PANEL.CLASSES.TAB_ACTIVE);
        event.currentTarget.classList.add(PANEL.CLASSES.TAB_ACTIVE);
      });
    });
  }

  activatePanel(tab) {
    document.querySelector(`.${PANEL.CLASSES.PANEL_ACTIVE}`).classList.remove(PANEL.CLASSES.PANEL_ACTIVE);
    document.getElementById(`panel-${tab}`).classList.add(PANEL.CLASSES.PANEL_ACTIVE);
  }
}