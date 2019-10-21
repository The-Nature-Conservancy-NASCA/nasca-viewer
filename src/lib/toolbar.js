const selectors = {
  TOOLBAR_MENU_ITEM: '.toolbar__menu-item',
  BASEMAP_SELECTORS: '#menu-base .menu-panel__menu-item'
}

const classes = {
  ACTIVE_MENU_ITEM: 'toolbar__menu-item--active',
  MENU_PANEL_EXPANDED: 'menu-panel--expanded'
}

const events = {
  CLICK: 'click'
}

class ToolBar {

  constructor() {
    this.init();
  }

  init() {
    this.menuItems = document.querySelectorAll(selectors.TOOLBAR_MENU_ITEM);
    this.handleEvents();
  }

  handleEvents() {
    this.menuItems.forEach(menuItem => {
      menuItem.addEventListener(events.CLICK, this.toggleToolbarMenu.bind(this))
    })

    // Seleccionar nuevo basemap
    document.querySelectorAll(selectors.BASEMAP_SELECTORS).forEach(item => {
      item.addEventListener(events.CLICK, basemapItem => {
        const basemap = basemapItem.currentTarget.dataset.basemap
        window.tnc_map.basemap = basemap
      })
    })
  }

  /**
   * Abre o cierra un menú del toolbar
   * @param {*} event
   */
  toggleToolbarMenu(event) {
    event.stopPropagation()
    const item = event.currentTarget
    const panelId = item.dataset.menu
    this.closeOpenMenu(panelId)
    this.toggleMenuItem(panelId, item)
  }

  closeOpenMenu(panelId) {
    try {
      const panel = document
        .querySelector(`.${classes.MENU_PANEL_EXPANDED}`)
        .getAttribute('id')
      if (panel === panelId) {
        return
      }
      document
        .querySelector(`.${classes.ACTIVE_MENU_ITEM}`)
        .classList.remove(classes.ACTIVE_MENU_ITEM)
      document
        .querySelector(`.${classes.MENU_PANEL_EXPANDED}`)
        .classList.remove(classes.MENU_PANEL_EXPANDED)
    } catch (error) { }
  }

  toggleMenuItem(menuId, item) {
    document.getElementById(menuId).classList.toggle(classes.MENU_PANEL_EXPANDED)
    item.classList.toggle(classes.ACTIVE_MENU_ITEM)
  }

}
