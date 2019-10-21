const SERVICIO = 'https://citydata.init.uji.es/server/rest/services/TNC/TNCServices/MapServer';
const urlEstrategias = SERVICIO + '/2/query';
const urlProyectos = SERVICIO + '/3/query'

class Landing {
  
  constructor() {
    this.loadLandingData();
  }
  
  registerHandlers() {
    const elementosEstrategias = document.querySelectorAll('.estrategias__card');
    elementosEstrategias.forEach(estrategia => {
      estrategia.addEventListener('click', event => {
        const selectedId = event.currentTarget.dataset.estrategia;
        document.querySelector('.estrategias').classList.add('collapsed');
        showProyectos(selectedId);
      });
    });
  }
  
  showProyectos(estrategiaId) {
    const proyecto = document.querySelector(`.proyectos#${estrategiaId}`);
    proyecto.classList.remove('hidden');
  }
  
  loadLandingData() {
   /* window.setTimeout(() => {
     document.querySelector('.content').classList.remove('hidden');
     document.querySelector('.loader').classList.add('hidden');
    }, 2000);*/
    
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
      
      esriRequest(urlEstrategias, queryOptions).then(response => {
        let estrategias = [];
        if (response.data && response.data.features) {
          const { features } = response.data;
          estrategias = features.map(feature => feature.attributes);
        }
        let estrategiasHML = this.createHTMLEstrategias(estrategias);
        document.querySelector('.estrategias').innerHTML = estrategiasHML;
        this.registerHandlers();
        document.querySelector('.content').classList.remove('hidden');
        document.querySelector('.loader').classList.add('hidden');
      });
    });
  }
  
  createHTMLEstrategias(estrategias) {
    let html = '';
    
    estrategias.forEach(estrategia => {
      html += this.hidrateCard({
        nivel: 'estrategias',
        ...estrategia
      })
    })
    
    return html;
  }
  
  hidrateCard(options) {
    return `
      <section class="${options.nivel}__card" 
      ${options.ID_proyecto ? 
        'id=' + options.nombre_estrategia :
        'data-estrategia="' + options.nombre_estrategia + '"'}>
      <div class="${options.nivel}__text">
        <h2 class="${options.nivel}__title">${options.nombre_estrategia}</h2>
        <p class="${options.nivel}__description">${options.descripcion}</p>
      </div>
      </section>
    `;
      
  }

}

new Landing();
