class StackedArea {
  constructor (el, panelTitleSelector=null, colors) {


    this.margin = {top: 10, right: 20, bottom: 20, left: 20};
    this.offset = {left: 10, bottom: 10};
    this.el = d3.select(el);
    this.panelTitleSelector = panelTitleSelector;
    this.colors = colors;
    this.buttonContainerHeight = 12;
    

    // compute width and height based on parent div
    this.parentWidth = parseInt(this.el.style("width")) - parseInt(this.el.style("padding-left")) - parseInt(this.el.style("padding-right"));
    this.parentHeight = parseInt(this.el.style("height")) - parseInt(this.el.style("padding-top")) - parseInt(this.el.style("padding-bottom"));
    this.width = this.parentWidth - this.margin.left - this.margin.right;
    this.height = this.parentHeight - this.margin.top - this.margin.bottom - this.buttonContainerHeight;
    this.loaderHeight = this.parentHeight * 0.75;

    this.features;
    this.factor = 1000000;
    this.decimals = 2;
    this.tooltipOffset = 15;
    this.years;
    this.startYear;
    this.closingYear;
    this.fontSize = 10;
    this.smallerFontSize = 9;
    this.xlabel = window.tncConfig.strings.carbonoXLabel;
    this.ylabel = window.tncConfig.strings.carbonoYLabel;
    this.closureLabel = window.tncConfig.strings.closureLabel;
    
    this.areaGroup = d3.select(el)
      .append("svg")
        .attr("class", "area")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .attr("overflow", "visible")
      .append("g");

    const translateY = (this.parentHeight - this.loaderHeight) / 2;
    this.loader = new Loader(this.areaGroup, this.parentWidth, this.loaderHeight, translateY);

    this.buttonContainer = d3.select(el)
      .append("div")
        .attr("class", "panel__buttons")
        .style("height", this.buttonContainerHeight);

    this.totalBtn = this.buttonContainer
      .append("button")
        .attr("value", null)
        .attr("class", "selected")
        .attr("title", window.tncConfig.strings.carbonoTotal);
    this.compartmentBtn = this.buttonContainer
        .append("button")
          .attr("value", "compartimiento")
          .attr("title", window.tncConfig.strings.carbonoByCompartment);
    this.coverBtn = this.buttonContainer
        .append("button")
          .attr("value", "cobertura")
          .attr("title", window.tncConfig.strings.carbonoByLandcover);

    this.buttons = this.buttonContainer.selectAll("button");

    this.buttons
      .style("visibility", "hidden")
      .style("width", this.buttonContainerHeight + "px")
      .style("height", this.buttonContainerHeight + "px");

    const that = this;
    this.buttons.on("click", function () {
      that.buttons.classed("selected", false);
      d3.select(this).classed("selected", true);
      that._changePanelTitle(this.title);
      that.renderGraphic(that.features, this.value, that.startYear, that.closingYear);
    });


    this.defaultKey = "Total";
    this.domain = {
      0: "Biomasa",
      1: "Suelos",
      2: "Madera"
    };
  }

  _renderStackedAreaChart(data) {
    this.areaGroup.selectAll("*").remove();

    // definir transform una vez se haya quitado el laoder
    this.areaGroup.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
    this.buttons.style("visibility", "visible");

    if (!data.length) {
      this.areaGroup
        .append("text")
          .attr("x", (this.width + Math.abs(this.margin.left - this.margin.right)) / 2)
          .attr("y", (this.height + Math.abs(this.margin.top - this.margin.bottom)) / 2)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-size", 9)
          .attr("fill", "black")
          .text("No hay datos :(");
    return;
    }

    // obtener llaves de los valores
    const keys = [];
    data.forEach(el => {
      const elKeys = Object.keys(el).filter(item => item !== "year");
      elKeys.forEach(key => {
        if (!keys.includes(key)) {
          keys.push(key);
        }
      }) 
    });

    // escalar datos
    data.forEach(item => {
      keys.forEach(key => {
        item[key] /= this.factor;
      });
    });

    const xScale = d3.scaleLinear()
      .domain([d3.min(this.years), d3.max(this.years)])
      .range([this.margin.left, this.width - this.margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => {
        const {year, ...obj} = d;
        return Object.values(obj).reduce((a, b) => a + b, 0);
      })])
      .range([this.height - this.margin.bottom, this.margin.bottom / 2])
      .nice();
    
    const xAxis = d3.axisBottom()
      .scale(xScale)
      .tickSizeOuter(0)
      .tickSize(3)
      .tickFormat(d => parseInt(d))
      .ticks(5);

    const yAxis = d3.axisRight()
      .scale(yScale)
      .tickSizeOuter(0)
      .tickSize(0)
      .ticks(3)
      .tickFormat(d => d.toFixed(this.decimals));
    const stack = d3.stack()
      .keys(keys)
      .order(d3.stackOrderDescending);
    const series = stack(data);
    const area = d3.area()
      .x(d => xScale(d.data.year))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]));
    const line = d3
      .line()
      .x(d => xScale(d.data.year))
      .y(d => yScale(d[1]));
    this.areaGroup
      .append("g")
      .selectAll("line")
      .data(yScale.ticks(3))
      .enter()
      .append("line")
      .attr("x1", this.margin.left)
      .attr("x2", xScale(xScale.domain()[1]))
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke-width", 0.5)
      .attr("stroke", "LightGray");
    const that = this;
    this.areaGroup
      .append("g")
      .selectAll("path")
      .data(series)
      .enter()
      .append("path")
        .attr("class", "area")
        .on("mouseover", function (d) {
          const label = d.key;
          const svgCoordinates = d3.mouse(this);
          const year = Math.ceil(xScale.invert(svgCoordinates[0]));
          const accumulatedValue = d.find(item => item.data.year == year)[1];
          const value = d.find(item => item.data.year == year).data[label];
          that.areaGroup
            .selectAll("path.area")
            .attr("fill-opacity", d => (d.key == label ? 0.5 : 0.1));
          that.areaGroup
            .selectAll("path.line")
            .attr("stroke-opacity", d => (d.key == label ? 1 : 0.3));
          that.areaGroup
            .select(".vertical.helper__line")
            .attr("visibility", "visible")
            .attr("x1", xScale(year))
            .attr("x2", xScale(year))
            .attr("y1", yScale.range()[0])
            .attr("y2", yScale.range()[1]);
          that.areaGroup
            .select(".helper__dot")
            .attr("visibility", "visible")
            .attr("fill", that.colors[label])
            .attr("cx", xScale(year))
            .attr("cy", yScale(accumulatedValue));
          that.areaGroup.selectAll(".helper__line").raise();
          that.areaGroup.select(".year__division").raise();
          that.areaGroup.select(".helper__dot").raise();
          const svgXCoordinate = d3.mouse(this)[0];
          const coordinates = [d3.event.pageX, d3.event.pageY];
          const tooltipValue = value.toFixed(that.decimals);
          const tooltipContent = `
          <span class="tooltip__title">${label} (${year})</span>
          <hr>
          <span class="tooltip__value">${tooltipValue} MtCO2e</span>
          `;
          d3.select("#tooltip__graph")
            .style("top", `${coordinates[1]}px`)
            .style("display", "block")
            .style("font-size", "11px")
            .html(tooltipContent);
          if (svgXCoordinate <= that.width / 2) {
            d3.select("#tooltip__graph")
              .style("right", null)
              .style("left", `${coordinates[0] + that.tooltipOffset}px`)
          } else {
            d3.select("#tooltip__graph")
              .style("left", null)
              .style("right", `${screen.width - (coordinates[0] - that.tooltipOffset)}px`)
          }
        })
        .on("mousemove", function (d) {
          const label = d.key;
          const svgCoordinates = d3.mouse(this);
          const year = Math.ceil(xScale.invert(svgCoordinates[0]));
          const accumulatedValue = d.find(item => item.data.year == year)[1];
          const value = d.find(item => item.data.year == year).data[label];
          that.areaGroup
            .selectAll("path.area")
            .attr("fill-opacity", d => (d.key == label ? 0.5 : 0.1));
          that.areaGroup
            .selectAll("path.line")
            .attr("stroke-opacity", d => (d.key == label ? 1 : 0.3));
          that.areaGroup
            .select(".vertical.helper__line")
            .attr("x1", xScale(year))
            .attr("x2", xScale(year))
            .attr("y1", yScale.range()[0])
            .attr("y2", yScale.range()[1]);
          that.areaGroup
            .select(".helper__dot")
            .attr("fill", that.colors[label])
            .attr("cx", xScale(year))
            .attr("cy", yScale(accumulatedValue));
          that.areaGroup.selectAll(".helper__line").raise();
          that.areaGroup.select(".year__division").raise();
          that.areaGroup.select(".helper__dot").raise();
          const svgXCoordinate = d3.mouse(this)[0];
          const coordinates = [d3.event.pageX, d3.event.pageY];
          const tooltipValue = value.toFixed(that.decimals);
          const tooltipContent = `
          <span class="tooltip__title">${label} (${year})</span>
          <hr>
          <span class="tooltip__value">${tooltipValue} MtCO2e</span>
          `;
          d3.select("#tooltip__graph")
            .style("top", `${coordinates[1]}px`)
            .html(tooltipContent);
          if (svgXCoordinate <= that.width / 2) {
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
          that.areaGroup.selectAll("path.area").attr("fill-opacity", 0.3);
          that.areaGroup.selectAll("path.line").attr("stroke-opacity", 1);
          that.areaGroup.select(".helper__line").attr("visibility", "hidden");
          that.areaGroup.select(".helper__dot").attr("visibility", "hidden");
          d3.select("#tooltip__graph").style("display", "none");
        })
        .attr("class", "area")
        .attr("d", area)
        .attr("fill", d => this.colors[d.key])
        .attr("fill-opacity", 0.3);
    this.areaGroup
      .append("g")
      .selectAll("path")
      .data(series)
      .enter()
      .append("path")
        .attr("class", "line")
        .attr("d", line)
        .attr("pointer-events", "none")
        .attr("fill", "none")
        .attr("stroke", d => this.colors[d.key])
        .attr("stroke-width", 1);
    this.areaGroup
      .append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${this.height - this.margin.bottom})`)
      .call(xAxis);
    this.areaGroup
      .append("g")
        .attr("class", "y axis")
        .attr("transform", `translate(${this.margin.left}, -5)`)
      .call(yAxis);
    this.areaGroup.select(".y.axis .tick").remove();  // quitar label 0
    this.areaGroup
      .selectAll(".axis .domain, .axis .tick line")
      .attr("stroke", "LightGray");
    this.areaGroup.select(".y.axis .domain").attr("stroke", "none");  // quitar linea eje y
    if (this.closingYear) {
      const yearDivision = this.areaGroup
      .append("g")
        .attr("class", "year__division")
        .attr("pointer-events", "none");
    yearDivision
      .append("line")
      .attr("x1", xScale(this.closingYear))
      .attr("x2", xScale(this.closingYear))
      .attr("y1", yScale.range()[0])
      .attr("y2", yScale.range()[1])
      .attr("pointer-events", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 0.75);
    yearDivision
      .append("text")
      .attr("y", xScale(this.closingYear) - 5)
      .attr("x", yScale.range()[1] - this.margin.bottom)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "end")
      .attr("font-size", this.smallerFontSize)
      .attr("fill", "black")
      .text(this.closureLabel);
    }
    this.areaGroup
      .append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .attr("font-size", this.fontSize)
        .attr("font-weight", "bold")
        .attr("x", this.width - (this.margin.right + 10))
        .attr("y", this.height - (this.margin.bottom + 5))
        .text(this.xlabel);

    this.areaGroup
      .append("text")
      .attr("class", "y label")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("y", 0)
      .attr("x", -(this.margin.top + (this.height / 2) - this.margin.bottom))
      .attr("transform", "rotate(-90)")
      .attr("font-size", this.fontSize)
      .attr("font-weight", "bold")
      .text(this.ylabel);
    this.areaGroup
      .append("line")
      .attr("class", "vertical helper__line")
      .attr("visibility", "hidden")
      .attr("pointer-events", "none")
      .attr("stroke", "black")
      .attr("stroke-dasharray", "3")
      .attr("stroke-width", 0.5);
    this.areaGroup
      .append("circle")
      .attr("class", "helper__dot")
      .attr("visibility", "hidden")
      .attr("stroke", "white")
      .attr("r", 3)
      .attr("pointer-events", "none");
  }

  _formatData(features, field) {
    if (!features.length) {
      return [];
    }
    this.years = d3.range(this.startYear, this.startYear + 21);
    const data = [];
    features.forEach((feat, i) => {
      const attrs = feat.attributes;
      let key;
      if (!field) {
        key = this.defaultKey;
      } else {
        if (field === "compartimiento") {
          key = this.domain[attrs[field]];
        } else {
          key = attrs[field];
        }
      }
      for (let j = 0; j <= 20; j++) {
        const t = `T${j}`;
        const year = this.years[j];
        if (i == 0) {
          const obj = {"year": year};
          obj[key] = attrs[t];
          data.push(obj);
        } else {
          const obj = data.filter(el => el.year == year)[0];
          if (key in obj) {
            obj[key] += attrs[t];
          } else {
            obj[key] = attrs[t];
          }
        }
      }
    });
    return data;
  }

  _changePanelTitle(titleString) {
    d3.select(this.panelTitleSelector).text(titleString);
  }

  renderGraphic(features, field, startYear, closingYear) {
    this.features = features;
    this.startYear = startYear;
    this.closingYear = closingYear;
    const data = this._formatData(features, field);
    this._renderStackedAreaChart(data);
  }
}