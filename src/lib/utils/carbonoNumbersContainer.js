class CarbonNumbersContainer {
  constructor(selector) {
    this.el = d3.select(selector);

    // compute parent's dimensions
    this.parentWidth = parseInt(this.el.style("width")) - parseInt(this.el.style("padding-left")) - parseInt(this.el.style("padding-right"));
    this.parentHeight = parseInt(this.el.style("height")) - parseInt(this.el.style("padding-top")) - parseInt(this.el.style("padding-bottom"));
    this.loaderHeight = this.parentHeight * 0.75;

    this.svg = this.el.append("svg").attr("width", this.parentHeight).attr("height", this.parentWidth);

    const translateY = (this.parentHeight - this.loaderHeight) / 2;
    this.loader = new Loader(this.svg, this.parentWidth, this.loaderHeight, translateY);
  }

  renderTemplate(stock, capture) {
    this.el.selectAll("*").remove();  // remvoer loader
    const unit = "tCO<sup>2</sup>e"
    let stockValue;
    let stockUnitVisibility = "visible";
    if (stock) {
      stockValue = Number(Math.round(stock)).toLocaleString("us");
    } else {
      stockValue = "-";
      stockUnitVisibility = "hidden";
    }
    let captureValue;
    let captureUnitVisibility = "visible";
    if (capture) {
      captureValue = Number(Math.round(capture)).toLocaleString("us");
    } else {
      captureValue = "-";
      captureUnitVisibility = "hidden";
    }
    const template = `
      <div class="carbon__numbers">
        <div class="carbon__numbers__item">
          <div class="carbon__numbers__label">${window.tncConfig.strings.stock}</div>
          <div class="carbon__numbers__amount">${stockValue}</div>
          <div class="carbon__numbers__unit" style="visibility:${stockUnitVisibility};">${unit}</div>
        </div>
        <div class="carbon__numbers__item">
          <div class="carbon__numbers__label">${window.tncConfig.strings.captura}</div>
          <div class="carbon__numbers__amount">${captureValue}</div>
          <div class="carbon__numbers__unit" style="visibility:${captureUnitVisibility};">${unit}</div>
        </div>
      </div>
    `;
    this.el.html(template);
  }


  renderLoader() {

  }


}