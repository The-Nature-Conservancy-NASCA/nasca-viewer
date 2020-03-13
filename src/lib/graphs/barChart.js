class BarChart {

  constructor (el) {
    this.margin = { top: 10, right: 20, bottom: 20, left: 10 };
    this.offset = { left: 10, bottom: 10 };
    this.el = d3.select(el);
    this.tooltipOffset = 15;

    // compute width and height based on parent div
    this.width = parseInt(this.el.style("width")) - this.margin.left - this.margin.right;
    this.height = parseInt(this.el.style("height")) - this.margin.top - this.margin.bottom;

    this.color = "#49AA42";
    this.factor = 0.6;

    this.title = "Área total por acción";
    this.ylabel = "Acción";
    this.xlabel = "Área (ha)";
    this.fontSize = 10;


    this.barGroup = this.el
      .append("svg")
      .attr("id", this.graphId)
      .attr("class", "bar graph")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr(
        "transform",
        `translate(${this.margin.left}, ${this.margin.top})`
      );
  }

  _renderBarChart(data) {

    this.barGroup.selectAll("*").remove();

    this.xScale = d3.scaleBand()
      .domain(d3.range(data.length))
      .range([this.margin.bottom + this.offset.bottom, this.height])
      .paddingInner(0.05);

    this.yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([0, this.width - this.margin.left - this.offset.left]);

    const xAxis = d3
      .axisBottom()
      .scale(this.yScale)
      .tickSizeOuter(0)
      .ticks(4);

    const yAxis = d3
      .axisLeft()
      .scale(this.xScale)
      .tickValues([])
      .tickSize(0);

    const that = this;

    this.barGroup
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
        .on("mouseover", function (d) {
          that.barGroup.selectAll("rect").attr("fill-opacity", 0.2);
          d3.select(this)
            .attr("stroke", "black")
            .attr("fill-opacity", 1);
          const coordinates = [d3.event.pageX, d3.event.pageY];
          const value = new Number(Math.round(d.value)).toLocaleString("en");
          const tooltipContent = `
            <span class="tooltip__title">${d.name}</span>
            <hr>
            <span class="tooltip__value">${value}</span><span class="tooltip__subtitle"> ha</span>
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
          that.barGroup.selectAll("rect")
                .attr("fill-opacity", 1);
          d3.select(this)
            .attr("stroke", "none");
          d3.select("#tooltip__graph")
            .html("")
            .style("display", "none");
        })
        .attr("x", this.margin.left + this.offset.left)
        .attr(
          "y",
          (d, i) =>
            this.xScale(i) -
            this.margin.bottom -
            this.offset.bottom +
            (this.xScale.bandwidth() * (1 - this.factor)) / 2
        )
        .attr("width", d => this.yScale(d.value))
        .attr("height", this.xScale.bandwidth() * this.factor)
        .attr("fill", this.color);
    
    this.barGroup
      .selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .attr(
        "x",
        d => this.yScale(d.value) / 2 + this.margin.left + this.offset.left
      )
      .attr(
        "y",
        (d, i) =>
          this.xScale(i) -
          this.margin.bottom -
          this.offset.bottom +
          this.xScale.bandwidth() / 2
      )
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", this.fontSize)
      .attr("font-weight", "normal")
      .attr("fill", "white")
      .attr("pointer-events", "none")
      .text(d => d.name)
      .each(this._wrap.bind(this));

    this.barGroup
      .append("g")
      .attr("class", "y axis")
      .attr(
        "transform",
        `translate(${this.margin.left}, ${-this.margin.bottom -
          this.offset.bottom})`
      )
      .call(yAxis);
    this.barGroup
      .append("g")
      .attr("class", "x axis")
      .attr(
        "transform",
        `translate(${this.margin.left + this.offset.left}, ${this.height -
          this.margin.bottom})`
      )
      .call(xAxis);

    this.barGroup
      .append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", this.width + this.offset.left)
      .attr("y", this.height + 10)
      .attr("font-size", this.fontSize)
      .attr("font-weight", "bold")
      .text(this.xlabel);
    this.barGroup
      .append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("x", 0)
      .attr("y", 0)
      .attr("transform", "rotate(-90)")
      .attr("font-size", this.fontSize)
      .attr("font-weight", "bold")
      .text(this.ylabel);
  }

  renderGraphic(data) {
    this._renderBarChart(data);
  }

  _wrap(d, i , n) {
    const self = d3.select(n[i]);
    let textLength = self.node().getComputedTextLength();
    let text = self.text();
    const width = this.yScale(d.value);
    const padding = 5;
    while (textLength > width - 2 * padding && text.length > 0) {
      text = text.slice(0, -1);
      self.text(text + "...");
      textLength = self.node().getComputedTextLength();
    }
    if (text.length === 0) {
      self.text("");
    }
  }
}