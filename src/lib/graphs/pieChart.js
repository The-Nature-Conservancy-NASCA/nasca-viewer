class PieChart {
  constructor (el, colors, iconUrl) {
    this.el = d3.select(el);
    this.width = parseInt(this.el.style("width"));
    this.height = parseInt(this.el.style("height"));
    this.margin = 4;
    this.colors = colors;
    this.iconUrl = iconUrl;
    if (screen.width <= 440) {
      this.iconSize = "8rem";
    } else if (screen.width <= 768) {
      this.iconSize = "16rem";
    } else if (screen.height <= 768) {
      this.iconSize = "8rem";
    } else if (screen.width > 900 && screen.width <= 1280) {
      this.iconSize = "7rem";
    } else {
      this.iconSize = "9rem";
    }
    this.svg = d3.select(el)
      .append("svg")
        .attr("class", "pie")
        .attr("width", this.width)
        .attr("height", this.height);
    this.tooltipOffset = 15;
  }

  _renderPieChart(data) {
    this.svg.selectAll("*").remove();

    const img = this.svg
      .append("image")
        .attr("xlink:href", this.iconUrl)
        .attr("width", this.iconSize)
        .attr("height", this.iconSize)
        .attr("pointer-events", "none");
    const bbox = img.node().getBBox();
    img
      .attr("x", this.width / 2 - bbox.width / 2)
      .attr("y", this.height / 2 - bbox.height / 2);

    if (!data.length) {
      return;
    }

    const outerRadius = this.width / 2 - this.margin;
    const innerRadius = outerRadius / 1.25;
    const arc = d3.arc()
          .innerRadius(innerRadius)
          .outerRadius(outerRadius);
    const pie = d3.pie()
      .value(d => d.count)
      .padAngle(0.05);
    const arcs = this.svg.selectAll("g.arc")
      .data(pie(data))
      .enter()
        .append("g")
        .attr("class", "arc")
        .attr("transform", `translate(${this.width / 2}, ${this.height / 2})`);
    const that = this;
    arcs.append("path")
      .on("mouseover", function (d) {
        const newOuterRadius = that.width / 2 - 1;
        const arcOver = d3
          .arc()
          .innerRadius(innerRadius)
          .outerRadius(newOuterRadius);
          d3.select(this)
            .attr("fill-opacity", 1)
            .transition()
            .attr("d", arcOver);
        const svgXCoordinate = d3.mouse(this)[0] + that.margin;
        const coordinates = [d3.event.pageX, d3.event.pageY];
        const value = Number(Math.round(d.value)).toLocaleString("en");
        const tooltipContent = `
          <span class="tooltip__title">${d.data.name}</span>
          <hr>
          <span class="tooltip__value">${value}</span><span class="tooltip__subtitle"> especies</span>
          `;
        d3.select("#tooltip__graph")
          .style("top", `${coordinates[1]}px`)
          .style("display", "block")
          .style("font-size", "11px")
          .html(tooltipContent);
        if (svgXCoordinate <= 0) {
          d3.select("#tooltip__graph")
            .style("right", null)
            .style("left", `${coordinates[0] + that.tooltipOffset}px`)
        } else {
          d3.select("#tooltip__graph")
            .style("left", null)
            .style("right", `${screen.width - (coordinates[0] - that.tooltipOffset)}px`)
        }
      })
      .on("mousemove", function () {
        const svgXCoordinate = d3.mouse(this)[0] + that.margin;
        const coordinates = [d3.event.pageX, d3.event.pageY];
        d3.select("#tooltip__graph")
          .style("top", `${coordinates[1]}px`);
        if (svgXCoordinate <= 0) {
          d3.select("#tooltip__graph")
            .style("right", null)
            .style("left", `${coordinates[0] + that.tooltipOffset}px`)
        } else {
          d3.select("#tooltip__graph")
            .style("left", null)
            .style("right", `${screen.width - (coordinates[0] - that.tooltipOffset)}px`)
        }
      })
      .on("mouseout", function () {
        that.svg
          .selectAll("g.arc path")
          .attr("fill-opacity", 0.8)
          .attr("stroke-opacity", 1);
        d3.select(this)
          .transition()
          .attr("d", arc);
        d3.select("#tooltip__graph").style("display", "none");
      })
      .attr("fill", d => this.colors[d.data.name] ? this.colors[d.data.name] : "#000000")
      .attr("fill-opacity", 0.8)
      .attr("stroke", d => this._shadeColor(this.colors[d.data.name] ? this.colors[d.data.name] : "#000000", -20))
      .attr("stroke-opacity", 1)
      .attr("d", arc);
  }

  _shadeColor(color, percent) {
    var R = parseInt(color.substring(1, 3), 16);
    var G = parseInt(color.substring(3, 5), 16);
    var B = parseInt(color.substring(5, 7), 16);
    R = parseInt((R * (100 + percent)) / 100);
    G = parseInt((G * (100 + percent)) / 100);
    B = parseInt((B * (100 + percent)) / 100);
    R = R < 255 ? R : 255;
    G = G < 255 ? G : 255;
    B = B < 255 ? B : 255;
    var RR =
      R.toString(16).length == 1 ? "0" + R.toString(16) : R.toString(16);
    var GG =
      G.toString(16).length == 1 ? "0" + G.toString(16) : G.toString(16);
    var BB =
      B.toString(16).length == 1 ? "0" + B.toString(16) : B.toString(16);
    return "#" + RR + GG + BB;
  }

  renderGraphic(data) {
    this._renderPieChart(data);
  }
}
