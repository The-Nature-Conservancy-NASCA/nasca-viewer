class BiodiversityContainer {
  constructor(el, colors, moments) {
    this.el = d3.select(el);
    this.colors = colors;
    this.moments = moments;
    this.selectedMoment = moments.slice(-1)[0].value;
    this.timeSliderHeight = 70;
    this.charts = [];
    this.slidesPerView = 2;

    // compute parent's dimensions
    this.parentWidth = parseInt(this.el.style("width")) - parseInt(this.el.style("padding-left")) - parseInt(this.el.style("padding-right"));
    this.parentHeight = parseInt(this.el.style("height")) - parseInt(this.el.style("padding-top")) - parseInt(this.el.style("padding-bottom"));
    this.loaderHeight = this.parentHeight * 0.75;

    this.timeSlider = new TimeSlider(el, this.parentWidth, this.timeSliderHeight);

    this.container = this.el
      .append("div")
        .style("height", `${this.parentHeight - this.timeSliderHeight}px`)

    this.svg = this.container
      .append("svg")
        .attr("width", this.parentWidth)
        .attr("height", this.parentHeight - this.timeSliderHeight)
        .attr("overflow", "visible");

    const translateY = -this.timeSliderHeight + ((this.parentHeight - this.loaderHeight) / 2);
    this.loader = new Loader(this.svg, this.parentWidth, this.loaderHeight, translateY);
  
    window.addEventListener("resize", this._adjust.bind(this));
  }

  _adjust() {
    // compute parent's dimensions
    this.parentWidth = parseInt(this.el.style("width")) - parseInt(this.el.style("padding-left")) - parseInt(this.el.style("padding-right"));
    this.parentHeight = parseInt(this.el.style("height")) - parseInt(this.el.style("padding-top")) - parseInt(this.el.style("padding-bottom"));
    
    this.container
      .style("height", `${this.parentHeight - this.timeSliderHeight}px`);

    // renderizar time slider
    this.timeButtons = this.timeSlider.adjust(this.parentWidth, this.timeSliderHeight);
    this.timeButtons.on("click", this._changeMoment.bind(this));
  }

  addPieChart(name, data, icon) {

    // obtener nombre, numero de especies y datos
    const cleanName = this._cleanString(name);
    const filteredData = data.filter(item => +item.moment <= +this.selectedMoment);
    const landcoverData = this._sumDuplicatedLandcovers(filteredData);
    const count = filteredData.reduce((a, b) => a + b.count, 0);

    const template = `
      <div id="group__${cleanName}" class="group__wrapper" style="height: 100%;">
        <div class="group__header">
          <div class="group__count">${count}</div>
          <div class="group__label">${name}</div>
        </div>
        <div class="group__graphic" id="graph__${cleanName}"></div>
      </div>
    `;

    // agregar slide con plantilla
    this.wrapper
      .append("div")
        .attr("class", "swiper-slide")
        .html(template);

    // crear piechart y renderizarlo
    const pieChart = new PieChart(`#graph__${cleanName}`, this.colors, icon);
    this.charts.push({ chart: pieChart, data: data, name: cleanName });
    pieChart.renderGraphic(landcoverData);
  }

  destroyLoader() {
    this.svg.remove();
    this._addSwiper();
  }

  initializeSwiper() {
    // insertar flechas de navegacion
    this.container
      .append("div")
        .attr("class", "swiper-button-prev")
        .html("&#8249;");
    this.container
      .append("div")
        .attr("class", "swiper-button-next")
        .html("&#8250;");

    // inizializar swiper
    new Swiper('.swiper-container', {
      centerInsufficientSlides: true,
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev"
      },
      slidesPerView: this.slidesPerView,
      spaceBetween: 0
    });

    // remover flechas de navegacion si no son necesarias
    if (this.charts.length <= this.slidesPerView) {
      this.container.select(".swiper-button-next").style("display", "none");
      this.container.select(".swiper-button-prev").style("display", "none");
    }
  }


  _addSwiper() {
    this.container.attr("class", "swiper-container");
    this.wrapper = this.container
      .append("div")
        .attr("class", "swiper-wrapper");
  }

  renderTimeSlider() {
    this.timeButtons = this.timeSlider.render(this.moments);
    this.timeButtons.on("click", this._changeMoment.bind(this));
  }

  _changeMoment(d, i, n) {
    this.timeSlider.buttonToggle(d, i, n);
    this.selectedMoment = d3.select(n[i]).attr("data-moment");
    this.charts.forEach(pieChart => {
      const filteredData = pieChart.data.filter(item => +item.moment <= +this.selectedMoment);
      const landcoverData = this._sumDuplicatedLandcovers(filteredData);
      const count = filteredData.reduce((a, b) => a + b.count, 0);
      d3.select(`#group__${pieChart.name}`).select(".group__count").text(count);
      pieChart.chart.renderGraphic(landcoverData);
    });
  }

  _cleanString(string) {
    return string.toLowerCase().replace(/[^A-Z0-9]/gi, "_");
  }

  _sumDuplicatedLandcovers(data) {
    const flatData = Array.prototype.concat(...data.map(item => item.landcovers));
    const landcoverData = [];
    flatData.forEach(function (a) {
      if (!this[a.name]) {
          this[a.name] = { name: a.name, count: 0 };
          landcoverData.push(this[a.name]);
      }
      this[a.name].count += a.count;
    }, Object.create(null));
    return landcoverData;
  }
}