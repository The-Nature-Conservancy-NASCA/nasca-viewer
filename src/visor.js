class Visor {

  constructor() {
    eventBus.addEventListener('coberturaLoaded', event => {
      document.querySelector('.loader').classList.add('hidden');
      window.modalPopup.openModal({header: window.tncConfig.strings.warning_panel});
    });
    this._loadData();
    new ToolBar('toolbar');
    new Panel('panel-resultados');
    window.map = new TNCMap('map-div');
    //new Carousel('resultado-carousel');
    const selectEstrategias = new EstrategiaSelector('selector-estrategias');
    window.modalPopup = new Modal();
  
    document.getElementById('nav-ver-todo').addEventListener('click', event => {
      window.map.filterLayers('');
    });
  
    document.querySelectorAll('.js-show-general-info').forEach(show=> {
      show.addEventListener('click', event => {
        window.modalPopup.openModal(window.tncConfig.generalInformation);
      });
    });

    document.querySelector('.js-toggle-mobile-navigation').addEventListener('click', event => {
      event.currentTarget.classList.toggle('esri-icon-drag-horizontal');
      event.currentTarget.classList.toggle('esri-icon-close');
      const navigation = document.querySelector('.navigation');
      if (navigation.classList.contains('navigation--expanded')) {
        document.querySelector('.navigation').style.overflow="hidden";
      } else {
        setTimeout(() => {
          document.querySelector('.navigation').style.overflow="visible";
        }, 350);
      }
      navigation.classList.toggle('navigation--expanded');
    });
  
    const estrategiaRequest = EstrategiaRepository.listEstrategias().then(estrategias => {
      selectEstrategias.createSelector(estrategias);
    });

  }

  _loadData() {
    CarouselRepository.loadData();
    CoberturasRepository.loadData();
    RegionRepository.loadData();
    PredioRepository.loadData();
    this.loadLandingData();
  }

  loadLandingData() {
    require(['esri/request'], esriRequest => {
     const queryOptions = {
       query: {
         f: 'json',
         where: '1=1',
         outFields: '*',
         returnGeometry: false
       },
       responseType: 'json'
     };

     const estrategiasRequest = esriRequest(window.tncConfig.urls.estrategias, queryOptions);
     const proyectosRequest = esriRequest(window.tncConfig.urls.proyectos, queryOptions);
     
     Promise.all([estrategiasRequest, proyectosRequest]).then(this.processResponse.bind(this));
   });
 }

  processResponse(responses) {
    const estrategiasResponse = responses[0];
    const proyectosResponse = responses[1];

    this.insertEstrategiaData(estrategiasResponse);
    this.insertProyectosData(proyectosResponse);
  }

  insertEstrategiaData(estrategiasResponse) {
    let estrategias = [];
    if (estrategiasResponse.data && estrategiasResponse.data.features) {
      const { features } = estrategiasResponse.data;
      estrategias = features.map(feature => feature.attributes);
      window.store.insertRows('Estrategias', estrategias);
    }
  }

  insertProyectosData(proyectosResponse) {
    let proyectos = {};
    if (proyectosResponse.data && proyectosResponse.data.features) {
      const { features } = proyectosResponse.data;
      const proyectosRaw = Array.from(features, f => f.attributes);
      window.store.insertRows('Proyectos', proyectosRaw);
    }
  }
}

const eventBus = new Eventbus();
fetch(Urls.getRelativeUrl('/json/config.json')).then(response => {
  response.json().then(config => {
    window.store = new Store();
    const lang =/* window.navigator.language.slice(0, 2) || */document.documentElement.lang;
    window.tncConfig = config[lang];
    new Visor();
  });

});

const changeThemeColor = (newColor) => {
  document.documentElement.style.setProperty('--theme-color', newColor);
  document.documentElement.style.setProperty('--theme-color-hover', pSBC(0.3, newColor));
  document.documentElement.style.setProperty('--theme-color-active', pSBC(-0.5, newColor));
};

function getEstrategiaInitial() {
  const estrategia = Urls.queryParam('estrategia');
  return estrategia ? estrategia : window.sessionStorage.getItem('estrategia');
}

function getProyectoInitial() {
  const proyecto = Urls.queryParam('proyecto');
  return proyecto ? proyecto : window.sessionStorage.getItem('proyecto'); 
}