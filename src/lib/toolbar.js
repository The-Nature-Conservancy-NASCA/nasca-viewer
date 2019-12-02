const selectors = {
  TOOLBAR_MENU_ITEM: '.toolbar__menu-item'
}

const classes = {
  ACTIVE_MENU_ITEM: 'toolbar__menu-item--active',
  MENU_PANEL_EXPANDED: 'menu-panel--expanded'
}

const events = {
  CLICK: 'click'
}

class ToolBar {

  constructor(el) {
    this._el = document.getElementById(el);
    this.init();
  }

  init() {
    this.renderHTML();
    this.menuItems = document.querySelectorAll(selectors.TOOLBAR_MENU_ITEM);
    this.handleEvents();
  }

  handleEvents() {
    this.menuItems.forEach(menuItem => {
      menuItem.addEventListener(events.CLICK, this.toggleToolbarMenu.bind(this))
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

  renderHTML() {
    this._el.innerHTML = /*html*/ `
      <div class="toolbar">
      <ul class="toolbar__menu">
        <li class="toolbar__menu-item" data-menu="menu-buscar">
          <i class="toolbar__menu-icon esri-icon-search" title="Buscar"></i>
        </li>
        <li class="toolbar__menu-item" data-menu="menu-capas">
          <i class="toolbar__menu-icon esri-icon-layers" title="Capas"></i>
        </li>
        <li class="toolbar__menu-item" data-menu="menu-leyenda">
          <i class="toolbar__menu-icon esri-icon-layer-list" title="Leyenda"></i>
        </li>
        <li class="toolbar__menu-item" data-menu="menu-base">
          <i class="toolbar__menu-icon esri-icon-basemap" title="Mapa base"></i>
        </li>
      </ul>
      <div id="menu-buscar" class="menu-panel">
        <div class="menu-panel__contenido" id="search-map">
        </div>
      </div>
      <div id="menu-capas" class="menu-panel">
        <h2 class="menu-panel__title">${window.tncConfig.strings.capas}</h2>
        <div class="menu-panel__contenido" id="layerList-map">
        </div>
      </div>
      <div id="menu-leyenda" class="menu-panel">
        <h2 class="menu-panel__title">${window.tncConfig.strings.leyenda}</h2>
        <div class="menu-panel__contenido" id="leyenda-map">
        </div>
      </div>
      <div id="menu-base" class="menu-panel">
        <h2 class="menu-panel__title">${window.tncConfig.strings.mapa_base}</h2>
        <div class="menu-panel__contenido" id="basemap-map"></div>
      </div>
    </div>
      `;
  }

}
