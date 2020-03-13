class PieChart {
  constructor (el) {
    this.el = d3.select(el);

    // compute width and height based on parent div
    this.width = parseInt(this.el.style("width"));
    this.height = parseInt(this.el.style("height"));
    this.color = d3.scaleOrdinal(d3.schemeCategory10);
    this.svg = d3.select(el)
      .append("svg")
        .attr("class", "pie")
        .attr("width", this.width)
        .attr("height", this.height);
    this.tooltipOffset = 15;
  }

  _renderPieChart(data) {
    const outerRadius = this.width / 2;
    const innerRadius = outerRadius / 1.25;
    const arc = d3.arc()
          .innerRadius(innerRadius)
          .outerRadius(outerRadius);
    const pie = d3.pie()
      .value(d => d.value);
    const arcs = this.svg.selectAll("g.arc")
      .data(pie(data))
      .enter()
        .append("g")
        .attr("class", "arc")
        .attr("transform", `translate(${outerRadius}, ${outerRadius})`);
    const that = this;
    arcs.append("path")
      .on("mouseover", function (d) {
        that.svg.selectAll("g.arc path")
          .attr("fill-opacity", 0.3);
        d3.select(this)
          .attr("stroke", "black")
          .attr("fill-opacity", 0.75);
        const coordinates = [d3.event.pageX, d3.event.pageY];
        const value = Number(Math.round(d.value)).toLocaleString("en");
        const tooltipContent = `
          <span class="tooltip__title">${d.data.name}</span>
          <hr>
          <span class="tooltip__value">${value}</span><span class="tooltip__subtitle"> especies</span>
          `;
        d3.select("#tooltip__graph")
          .style("left", `${coordinates[0] + that.tooltipOffset}px`)
          .style("top", `${coordinates[1]}px`)
          .style("display", "block")
          .style("font-size", "11px")
          .html(tooltipContent);
      })
      .on("mousemove", function () {
        const coordinates = [d3.event.pageX, d3.event.pageY];
        d3.select("#tooltip__graph")
          .style("left", `${coordinates[0] + that.tooltipOffset}px`)
          .style("top", `${coordinates[1]}px`);
      })
      .on("mouseout", function () {
        that.svg.selectAll("g.arc path").attr("fill-opacity", 0.75);
        d3.select(this).attr("stroke", "none");
        d3.select("#tooltip__graph").html("").style("display", "none");
      })
      .attr("fill", d => this.color(d.data.name))
      .attr("d", arc);
  }

  renderGraphic(data) {
    this._renderPieChart(data);
  }
}
