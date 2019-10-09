class Carousel {
  constructor () {
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
}
