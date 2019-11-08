class Carousel {

  constructor (el) {
    this._el = document.getElementById(el);
    this.renderHTML();

    this.carousel = document.querySelector("[data-target='carousel']")
    this.card = this.carousel.querySelector("[data-target='card']")
    this.leftButton = document.querySelector("[data-action='slideLeft']")
    this.rightButton = document.querySelector("[data-action='slideRight']")
    this.carouselWidth = this.carousel.offsetWidth
    this.cardStyle = this.card.currentStyle || window.getComputedStyle(this.card)
    this.cardMarginRight = Number(this.cardStyle.marginRight.match(/\d+/g)[0])
    this.cardCount = this.carousel.querySelectorAll("[data-target='card']").length

    this.init()
  }

  init () {
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

  renderHTML() {
    const template = `
      <div class="carousel">
      <ul class="carousel__list" data-target="carousel">
        <li class="carousel__card" data-target="card">
          <img class="carousel__image" src="img/murcielago1.jpg" alt="">
          <p class="carousel__text">Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
        </li>
        <li class="carousel__card" data-target="card">
          <img class="carousel__image" src="img/murcielago1.jpg" alt="">
          <p class="carousel__text">Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
        </li>
      </ul>
      <div class="carousel__buttons">
        <img class="carousel__button" src="img/keyboard_arrow_left.png" data-action="slideLeft">
        <img class="carousel__button" src="img/keyboard_arrow_right.png" data-action="slideRight">
        </button>
      </div>
    </div>
    `;

    this._el.innerHTML = template;
  }
}
