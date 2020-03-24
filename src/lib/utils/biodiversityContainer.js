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

    this.timeSlider = new TimeSlider(el, this.parentWidth, this.timeSliderHeight);

    this.container = this.el
      .append("div")
        .attr("id", "container__biodiversidad")
        .style("height", `${this.parentHeight - this.timeSliderHeight}px`);
  }

  addPieChart(name, data, icon) {
    const cleanName = this._cleanString(name);
    const momentData = data.find(item => item.moment === this.selectedMoment);
    const count = momentData ? momentData.count : 0;
    const groupContainer = this.container.append("div").attr("class", "group__container");
    const header = groupContainer.append("div").attr("class", "group__header").attr("id", `group__header__${cleanName}`);
    console.log(name);
    header.append("h6").attr("class", "group__label").text(name);
    header.append("h6").attr("class", "group__count").text(count);
    groupContainer.append("div").attr("class", "group__graphic").attr("id", `graph__${cleanName}`);
    const pieChart = new PieChart(`#graph__${cleanName}`, this.colors, icon);
    this.charts.push({ chart: pieChart, data: data, name: cleanName });
    pieChart.renderGraphic(momentData ? momentData.landcovers : []);
  }

  renderTimeSlider() {
    this.timeButtons = this.timeSlider.render(this.moments);
    this.timeButtons.on("click", this._changeMoment.bind(this));
  }

  _changeMoment(d, i, n) {
    this.timeSlider.buttonToggle(d, i, n);
    this.selectedMoment = d3.select(n[i]).attr("data-moment");
    this.charts.forEach(pieChart => {
      const momentData = pieChart.data.find(item => item.moment === this.selectedMoment);
      const count = momentData ? momentData.count : 0;
      d3.select(`#group__header__${pieChart.name}`).select(".group__count").text(count);
      pieChart.chart.renderGraphic(momentData ? momentData.landcovers : []);
    });
  }

  _cleanString(string) {
    return string.toLowerCase().replace(/[^A-Z0-9]/gi, "_");
  }
}