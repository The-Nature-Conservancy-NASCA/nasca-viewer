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

const menuItems = document.querySelectorAll(selectors.TOOLBAR_MENU_ITEM)

menuItems.forEach(menuItem => {
  menuItem.addEventListener(events.CLICK, toggleToolbarMenu)
})

/**
 * Abre o cierra un menú del toolbar
 * @param {*} event
 */
function toggleToolbarMenu (event) {
  event.stopPropagation()
  const item = event.currentTarget
  const panelId = item.dataset.menu
  closeOpenMenu(panelId)
  toggleMenuItem(panelId, item)
}

function closeOpenMenu (panelId) {
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
  } catch (error) {}
}

function toggleMenuItem (menuId, item) {
  document.getElementById(menuId).classList.toggle(classes.MENU_PANEL_EXPANDED)
  item.classList.toggle(classes.ACTIVE_MENU_ITEM)
}

// Seleccionar nuevo basemap
document.querySelectorAll(selectors.BASEMAP_SELECTORS).forEach(item => {
  item.addEventListener(events.CLICK, basemapItem => {
    const basemap = basemapItem.target.dataset.basemap
    window.tnc_map.basemap = basemap
  })
})
