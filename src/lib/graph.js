class BarChart {
  constructor (el) {
    this.margin = {top: 10, right: 10, bottom: 20, left: 30};
    this.offset = {left: 10, bottom: 10};
    this.el = d3.select(el);
    this.tooltipOffset = 15;

    // compute width and height based on parent div
    this.width = parseInt(this.el.style("width")) - this.margin.left - this.margin.right;
    this.height = parseInt(this.el.style("height")) - this.margin.top - this.margin.bottom;

    this.color = d3.scaleOrdinal(d3.schemeCategory10);
    this.factor = 0.5;

    this.title = "Área total por acción";
    this.xlabel = "Acción";
    this.ylabel = "Área (ha)";


    this.barGroup = d3.select(el)
      .append("svg")
        .attr("class", "bar")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
        .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
  }

  _renderBarChart(data) {

    this.barGroup.selectAll("*").remove();

    const xScale = d3.scaleBand()
      .domain(d3.range(data.length))
      .range([this.margin.left + this.offset.left, this.width])
      .paddingInner(0.05);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([this.height, this.margin.bottom + this.offset.bottom]);

    var xAxis = d3.axisBottom()
      .scale(xScale)
      .tickFormat((d, i) => data[i].name);

    var yAxis = d3.axisLeft()
      .scale(yScale)
      .ticks(3);

    const that = this;

    this.barGroup.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
        .on("mouseover", function (d) {
          that.barGroup.selectAll("rect").attr("fill-opacity", 0.3);
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
        .attr("x", (d, i) => xScale(i) + ((xScale.bandwidth() * (1 - this.factor)) / 2))
        .attr("y", d => (this.height - (this.margin.bottom + this.offset.bottom)) - yScale(d.value))
        .attr("width", xScale.bandwidth() * this.factor)
        .attr("fill", "#49AA42")
        .attr("fill-opacity", 1)
        .transition()
        .attr("height", d => yScale(d.value));

    this.barGroup.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${this.margin.left}, ${-this.margin.bottom - this.offset.bottom})`)
      .call(yAxis);

    this.barGroup.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${0}, ${this.height - this.margin.bottom})`)
      .call(xAxis)
    .selectAll(".tick text")
      .call(this._wrap, xScale.bandwidth());

    this.barGroup
      .append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", this.width + this.offset.left - this.margin.right)
      .attr("y", this.height + 15)
      .attr("font-size", 10)
      .attr("font-weight", "bold")
      .text(this.xlabel);
    this.barGroup
      .append("text")
      .attr("class", "y label")
      .attr("text-anchor", "start")
      .attr("x", this.margin.left + this.offset.left)
      .attr("y", 0)
      .attr("font-size", 10)
      .attr("font-weight", "bold")
      .text(this.ylabel);
  }

  renderGraphic(data) {
    this._renderBarChart(data);
  }

  _wrap(text, width) {
    text.each(function() {
      var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          y = text.attr("y"),
          dy = parseFloat(text.attr("dy")),
          tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }
}

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
