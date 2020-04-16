class BiodiversityContainer {
  constructor(el, colors, moments) {
    this.el = d3.select(el);
    this.colors = colors;
    this.moments = moments;
    this.selectedMoment = moments.slice(-1)[0].value;
    this.timeSliderHeight = 70;
    this.charts = [];

    // compute parent's dimensions
    this.parentWidth = parseInt(this.el.style("width")) - parseInt(this.el.style("padding-left")) - parseInt(this.el.style("padding-right"));
    this.parentHeight = parseInt(this.el.style("height")) - parseInt(this.el.style("padding-top")) - parseInt(this.el.style("padding-bottom"));
    this.loaderHeight = this.parentHeight * 0.75;

    this.timeSlider = new TimeSlider(el, this.parentWidth, this.timeSliderHeight);

    this.container = this.el
      .append("div")
        .attr("id", "container__biodiversidad")
        .style("height", `${this.parentHeight - this.timeSliderHeight}px`);

    this.svg = this.container
      .append("svg")
        .attr("width", this.parentWidth)
        .attr("height", this.parentHeight - this.timeSliderHeight)
        .attr("overflow", "visible");

    const translateY = -this.timeSliderHeight + ((this.parentHeight - this.loaderHeight) / 2);
    this.loader = new Loader(this.svg, this.parentWidth, this.loaderHeight, translateY);
  }

  addPieChart(name, data, icon) {
    const cleanName = this._cleanString(name);
    const filteredData = data.filter(item => +item.moment <= +this.selectedMoment);
    const landcoverData = this._sumDuplicatedLandcovers(filteredData);
    const count = filteredData.reduce((a, b) => a + b.count, 0);
    const groupContainer = this.container.append("div").attr("class", "group__container");
    const header = groupContainer.append("div").attr("class", "group__header").attr("id", `group__header__${cleanName}`);
    header.append("div").attr("class", "group__count").text(count);
    header.append("div").attr("class", "group__label").text(name);
    groupContainer.append("div").attr("class", "group__graphic").attr("id", `graph__${cleanName}`);
    const pieChart = new PieChart(`#graph__${cleanName}`, this.colors, icon);
    this.charts.push({ chart: pieChart, data: data, name: cleanName });
    pieChart.renderGraphic(landcoverData);
  }

  destroyLoader() {
    this.svg.remove();
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
      d3.select(`#group__header__${pieChart.name}`).select(".group__count").text(count);
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