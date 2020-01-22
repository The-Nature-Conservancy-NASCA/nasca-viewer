class Carousel {
  constructor(container, items, controls, controlsContainer) {
    this.carouselContainer = container;
    this.carouselControls = controls;
    this.carouselArray = [...items];
    this.controlsContainer = controlsContainer;
  }

  // Assign initial css classes for gallery and nav items
  setInitialState() {
    this.carouselArray[0].classList.add('gallery-item-first');
    this.carouselArray[1].classList.add('gallery-item-previous');
    this.carouselArray[2].classList.add('gallery-item-selected');
    this.carouselArray[3].classList.add('gallery-item-next');
    this.carouselArray[4].classList.add('gallery-item-last');

    document.querySelector('.gallery-nav').childNodes[0].className = 'gallery-nav-item gallery-item-first';
    document.querySelector('.gallery-nav').childNodes[1].className = 'gallery-nav-item gallery-item-previous';
    document.querySelector('.gallery-nav').childNodes[2].className = 'gallery-nav-item gallery-item-selected';
    document.querySelector('.gallery-nav').childNodes[3].className = 'gallery-nav-item gallery-item-next';
    document.querySelector('.gallery-nav').childNodes[4].className = 'gallery-nav-item gallery-item-last';
  }

  // Update the order state of the carousel with css classes
  setCurrentState(target, selected, previous, next, first, last) {

    selected.forEach(el => {
      el.classList.remove('gallery-item-selected');

      if (target.className == 'gallery-controls-previous') {
        el.classList.add('gallery-item-next');
      } else {
        el.classList.add('gallery-item-previous');
      }
    });

    previous.forEach(el => {
      el.classList.remove('gallery-item-previous');

      if (target.className == 'gallery-controls-previous') {
        el.classList.add('gallery-item-selected');
      } else {
        el.classList.add('gallery-item-first');
      }
    });

    next.forEach(el => {
      el.classList.remove('gallery-item-next');

      if (target.className == 'gallery-controls-previous') {
        el.classList.add('gallery-item-last');
      } else {
        el.classList.add('gallery-item-selected');
      }
    });

    first.forEach(el => {
      el.classList.remove('gallery-item-first');

      if (target.className == 'gallery-controls-previous') {
        el.classList.add('gallery-item-previous');
      } else {
        el.classList.add('gallery-item-last');
      }
    });

    last.forEach(el => {
      el.classList.remove('gallery-item-last');

      if (target.className == 'gallery-controls-previous') {
        el.classList.add('gallery-item-first');
      } else {
        el.classList.add('gallery-item-next');
      }
    });
  }

  // Construct the carousel navigation
  setNav() {
    this.carouselContainer.appendChild(document.createElement('ul')).className = 'gallery-nav';

    this.carouselArray.forEach(item => {
      const nav = this.carouselContainer.lastElementChild;
      nav.appendChild(document.createElement('li'));
    }); 
  }

  // Construct the carousel controls
  setControls() {
    this.carouselControls.forEach(control => {
      this.controlsContainer.appendChild(document.createElement('button')).className = `gallery-controls-${control}`;
    }); 

    !!this.controlsContainer.childNodes[0] ? this.controlsContainer.childNodes[0].innerHTML = this.carouselControls[0] : null;
    !!this.controlsContainer.childNodes[1] ? this.controlsContainer.childNodes[1].innerHTML = this.carouselControls[1] : null;
  }
 
  // Add a click event listener to trigger setCurrentState method to rearrange carousel
  useControls() {
    const triggers = [...this.controlsContainer.childNodes];

    triggers.forEach(control => {
      control.addEventListener('click', () => {
        const target = control;
        const selectedItem = document.querySelectorAll('.gallery-item-selected');
        const previousSelectedItem = document.querySelectorAll('.gallery-item-previous');
        const nextSelectedItem = document.querySelectorAll('.gallery-item-next');
        const firstCarouselItem = document.querySelectorAll('.gallery-item-first');
        const lastCarouselItem = document.querySelectorAll('.gallery-item-last');

        this.setCurrentState(target, selectedItem, previousSelectedItem, nextSelectedItem, firstCarouselItem, lastCarouselItem);
      });
    });
  }
}
