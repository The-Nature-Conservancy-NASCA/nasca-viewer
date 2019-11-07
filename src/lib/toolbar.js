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

  renderHTML() {
    this._el.innerHTML = 
      `  <div class="toolbar">
      <ul class="toolbar__menu">
        <li class="toolbar__menu-item" data-menu="menu-capas">
          <i class="toolbar__menu-icon esri-icon-layers" title="Capas"></i>
        </li>
        <li class="toolbar__menu-item" data-menu="menu-otro">
          <i class="toolbar__menu-icon esri-icon-layer-list"></i>
        </li>
        <li class="toolbar__menu-item" data-menu="menu-base">
          <i class="toolbar__menu-icon esri-icon-basemap" title="Mapa base"></i>
        </li>
      </ul>
      <div id="menu-capas" class="menu-panel">
        <h2 class="menu-panel__title">Capas</h2>
        <div class="menu-panel__contenido">
          <ul class="menu-panel__menu">
            <li class="menu-panel__menu-item" data-proyecto="about">Ganadería Colombiana</li>
            <li class="menu-panel__menu-item" data-proyecto="links">Agroforestería</li>
          </ul>
        </div>
      </div>
      <div id="menu-otro" class="menu-panel">
        <h2 class="menu-panel__title">Capas</h2>
        <div class="menu-panel__contenido">
          <ul class="menu-panel__menu">
            <li class="menu-panel__menu-item" data-proyecto="about">Ganadería Colombiana</li>
            <li class="menu-panel__menu-item" data-proyecto="links">Agroforestería</li>
          </ul>
        </div>
      </div>
      <template>
        <div id="menu-info" class="menu-panel">
          <h2 class="menu-panel__title">Información</h2>
          <div class="menu-panel__contenido">
            <ul class="menu-panel__menu">
              <li class="menu-panel__menu-item" data-info="about">About</li>
              <li class="menu-panel__menu-item" data-info="links">Links & Science</li>
              <li class="menu-panel__menu-item" data-info="privacy">Privacy Policy</li>
              <li class="menu-panel__menu-item" data-info="login">Login</li>
            </ul>
          </div>
        </div>
        <div id="menu-idioma" class="menu-panel">
          <h2 class="menu-panel__title">Idioma</h2>
          <div class="menu-panel__contenido">
            <ul class="menu-panel__menu">
              <li class="menu-panel__menu-item" data-language="es">Español</li>
              <li class="menu-panel__menu-item" data-language="fr">Français</li>
              <li class="menu-panel__menu-item" data-language="en">English</li>
            </ul>
          </div>
        </div>
      </template>
      <div id="menu-base" class="menu-panel">
        <h2 class="menu-panel__title">Mapa Base</h2>
        <div class="menu-panel__contenido">
          <ul class="menu-panel__menu menu-panel__menu--grid">
            <li class="menu-panel__menu-item menu-panel__menu-item--vertical" data-basemap="satellite">
              <img src="img/basemap/satellite.jpg" alt="" width="80">
              <p>Satellite</p>
            </li>
            <li class="menu-panel__menu-item menu-panel__menu-item--vertical" data-basemap="streets">
              <img src="img/basemap/streets.jpg" alt="" width="80">
              <p>Streets</p>
            </li>
            <li class="menu-panel__menu-item menu-panel__menu-item--vertical" data-basemap="topo">
              <img src="img/basemap/topo.jpg" alt="" width="80">
              <p>Topographic</p>
            </li>
            <li class="menu-panel__menu-item menu-panel__menu-item--vertical" data-basemap="dark-gray">
              <img src="img/basemap/dark.png" alt="" width="80">
              <p>Dark</p>
            </li>
            <li class="menu-panel__menu-item menu-panel__menu-item--vertical" data-basemap="gray">
              <img src="img/basemap/gray.jpg" alt="" width="80">
              <p>Gray</p>
            </li>
            <li class="menu-panel__menu-item menu-panel__menu-item--vertical" data-basemap="national-geographic">
              <img src="img/basemap/natgeo.jpg" alt="" width="80">
              <p>National Geographic</p>
            </li>
            <li class="menu-panel__menu-item menu-panel__menu-item--vertical" data-basemap="terrain">
              <img src="img/basemap/terrain.jpg" alt="" width="80">
              <p>Terrain</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
      `;
  }

}
