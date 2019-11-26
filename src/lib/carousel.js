class Carousel {

  constructor (el) {
    this._el = document.getElementById(el);
    this._queryData();
  }
  
  init () {
    this.carousel = document.querySelector("[data-target='carousel']")
    this.card = this.carousel.querySelector("[data-target='card']")
    this.leftButton = document.querySelector("[data-action='slideLeft']")
    this.rightButton = document.querySelector("[data-action='slideRight']")
    this.carouselWidth = this.carousel.clientWidth
    this.cardStyle = this.card.currentStyle || window.getComputedStyle(this.card)
    this.cardMarginRight = Number(this.cardStyle.marginRight.match(/\d+/g)[0])
    this.cardCount = this.carousel.querySelectorAll("[data-target='card']").length

    let offset = 0
    const maxX = -(
      this.cardCount * this.carouselWidth +
      this.cardMarginRight * this.cardCount -
      this.carouselWidth -
      this.cardMarginRight
    )

    this.leftButton.addEventListener('click', () => {
      if (offset !== 0) {
        offset += this.carouselWidth + this.cardMarginRight
        this.carousel.style.transform = `translateX(${offset}px)`
      }
    })

    this.rightButton.addEventListener('click', () => {
      if (offset !== maxX) {
        offset -= this.carouselWidth + this.cardMarginRight
        this.carousel.style.transform = `translateX(${offset}px)`
      }
    })
  }

  _queryData() {
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
      const estrategiasRequest = esriRequest('https://services9.arcgis.com/LQG65AprqDvQfUnp/ArcGIS/rest/services/TNCServiceV2/FeatureServer/10/query', queryOptions);
      estrategiasRequest.then(response => {
        const carouselData = response.data.features.map(feature => {
          const { Especie, URL, nombre_comun } = feature.attributes;
          return {
            especie: Especie,
            url: URL,
            nombreComun: nombre_comun
          }
        });

        this.renderHTML(carouselData);
      });
    });
  }
  
  renderHTML(options) {
    const template = `
    <div class="carousel">
    <ul class="carousel__list" data-target="carousel">
    ${options.map(item => `
    <li class="carousel__card" data-target="card">
    <img class="carousel__image" src="${item.url}" alt="${item.nombreComun}">
    <p class="carousel__text">${item.especie} - ${item.nombreComun}</p>
    </li>
    `).join('')}
    </ul>
    <div class="carousel__buttons">
    <img class="carousel__button" src="img/keyboard_arrow_left.png" data-action="slideLeft">
    <img class="carousel__button" src="img/keyboard_arrow_right.png" data-action="slideRight">
    </button>
    </div>
    </div>
    `;
    
    this._el.innerHTML = template;
    setTimeout(() => {
      this.init();
    }, 500);
  }
}
