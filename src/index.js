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
        this.showProyectos(selectedId);
      });
    });
  }
  
  showProyectos(estrategiaId) {
    const proyecto = document.querySelector(`.proyectos#${estrategiaId}`);
    proyecto.classList.remove('hidden');
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

      const estrategiasRequest = esriRequest(urlEstrategias, queryOptions);
      const proyectosRequest = esriRequest(urlProyectos, queryOptions);
      
      Promise.all([estrategiasRequest, proyectosRequest]).then(this.processResponse.bind(this));
    });
  }
  
  processResponse(responses) {
    const estrategiasResponse = responses[0];
    const proyectosResponse = responses[1];

    this.buildEstrategiasHTML(estrategiasResponse);
    this.buildProyectosHTML(proyectosResponse);

    this.registerHandlers();
    document.querySelector('.content').classList.remove('hidden');
    document.querySelector('.loader').classList.add('hidden');
    
  }

  buildEstrategiasHTML(estrategiasResponse) {
    let estrategias = [];
    if (estrategiasResponse.data && estrategiasResponse.data.features) {
      const { features } = estrategiasResponse.data;
      estrategias = features.map(feature => feature.attributes);
    }

    let estrategiasHTML = this.createHTML(estrategias, 'estrategias');
    document.querySelector('.estrategias').innerHTML = estrategiasHTML;
  }

  buildProyectosHTML(proyectosResponse) {
    let proyectos = {};
    if (proyectosResponse.data && proyectosResponse.data.features) {
      const { features } = proyectosResponse.data;
      Array.from(features, f => f.attributes).forEach(proyecto => {
        if (!proyectos[proyecto.ID_estrategia]) {
          proyectos[proyecto.ID_estrategia] = new Array();
        }
        proyectos[proyecto.ID_estrategia].push(proyecto);
      });
    }

    for (const estrategiaID in proyectos) {
      let divProyecto = document.createElement('div');
      divProyecto.setAttribute('id', `estrategia_${estrategiaID}`);
      divProyecto.classList.add('proyectos', 'hidden');
      divProyecto.innerHTML = this.createHTML(proyectos[estrategiaID], 'proyectos');
      document.querySelector('.content').appendChild(divProyecto);
    }
  }

  createHTML(sections, nivel) {
    let html = '';
    
    sections.forEach(section => {
      html += this.hidrateCard({
        nivel,
        ...section
      })
    });
    
    return html;
  }
  
  hidrateCard(options) {
    return `
      <section class="${options.nivel}__card" 
        ${options.ID_proyecto ? '':
        'data-estrategia="estrategia_' + options.ID_estrategia + '"'}>
      <div class="${options.nivel}__text">
        <h2 class="${options.nivel}__title">${options.nombre_estrategia}</h2>
        <p class="${options.nivel}__description">${options.descripcion}</p>
      </div>
      </section>
    `;
      
  }

}

new Landing();
