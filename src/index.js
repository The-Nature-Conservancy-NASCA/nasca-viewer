const SERVICIO = 'https://services9.arcgis.com/LQG65AprqDvQfUnp/arcgis/rest/services/TNCServices2/FeatureServer';
const urlEstrategias = SERVICIO + '/4/query';
const urlProyectos = SERVICIO + '/5/query'

class Landing {
  
  constructor() {
    this.loadLandingData();
  }
  
  registerHandlers() {
    const landingCards = document.querySelectorAll('.card');
    landingCards.forEach(card => {
      card.addEventListener('mouseover', event => {
        event.currentTarget.classList.add('hover');
      });
      card.addEventListener('mouseleave', event => {
        event.currentTarget.classList.remove('hover');
      });

      if(card.classList.contains('estrategia')) {
        card.addEventListener('click', event => {
          const selectedId = event.currentTarget.dataset.estrategia;
          this.showProyectos(selectedId);
          document.querySelector('.estrategias').classList.add('collapsed');
        });
      }
    });

    document.querySelectorAll('.proyecto.card').forEach(el => {
      el.addEventListener('click', event => {
        const { currentTarget } = event;
        const proyectoId = currentTarget.dataset.proyecto;
        sessionStorage.setItem('proyecto', proyectoId);
        window.location = '/visor.html'
      });
    });

    document.querySelector('.cta-back').addEventListener('click', event => {
      document.querySelector('.estrategias').classList.remove('collapsed');
      document.querySelector('.cta-back').classList.add('hidden');
    });
  }
  
  showProyectos(estrategiaId) {
    document.querySelector('.cta-back').classList.remove('hidden');
    document.querySelectorAll('.proyectos').forEach(el => {
      el.classList.add('hidden');
    })
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
      divProyecto.setAttribute('style', `background-color: #999;`);
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
      <section class="card ${options.ID_proyecto ? 'proyecto' : 'estrategia'}" 
        ${options.ID_proyecto ? 'data-proyecto="' + options.ID_proyecto + '"' :
        'data-estrategia="estrategia_' + options.ID_estrategia + '"'}
        style="background-color: ${options.color};">
      <div class="card-background">
        <div class="card-overlay"></div>
        <img src="${options.fondo}" >
      </div>
      <div class="card__text">
        <h2 class="card__title"
          style="border-bottom: .6rem solid ${options.color};"
        >${options.nombre}</h2>
        <p class="card__description">${options.descripcion}</p>
      </div>
      </section>
    `;
      
  }

}

new Landing();
