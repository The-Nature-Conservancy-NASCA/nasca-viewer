class BarChart {

  constructor (el) {
    this.margin = { top: 20, right: 20, bottom: 10, left: 10 };
    this.offset = { left: 10, bottom: 10 };
    this.el = d3.select(el);
    this.tooltipOffset = 15;
    this.timeSliderHeight = 50;

    // compute width and height based on parent div
    this.parentWidth = parseInt(this.el.style("width")) - parseInt(this.el.style("padding-left")) - parseInt(this.el.style("padding-right"));
    this.parentHeight = parseInt(this.el.style("height")) - parseInt(this.el.style("padding-top")) - parseInt(this.el.style("padding-bottom"));
    this.width = this.parentWidth - this.margin.left - this.margin.right - this.offset.left;
    this.height = this.parentHeight - this.margin.top - this.margin.bottom - this.offset.bottom - this.timeSliderHeight;
    this.loaderHeight = this.parentHeight * 0.75;

    this.data;
    this.moments;
    this.selectedMoment;
    this.features;
    this.timeSlider = new TimeSlider(el, this.width + this.offset.left, this.timeSliderHeight, null, { left: 10, right: 10 });
    this.color = window.themeColor;
    this.factor = 0.5;

    this.ylabel = window.tncConfig.strings.implementacionesYLabel;
    this.xlabel = window.tncConfig.strings.implementacionesXLabel;

    this.fontSize = 10;
    if (screen.width >= 1400 && screen.height >= 800) {
      this.fontSize = 14;
    } 

    this.svg = this.el
      .append("svg")
        .attr("id", this.graphID)
        .attr("class", "bar graph")
        .attr("width", this.width + this.margin.left + this.margin.right + this.offset.left)
        .attr("height", this.height + this.margin.bottom + this.margin.top + this.offset.bottom)
        .attr("overflow", "visible");
    this.barGroup = this.svg.append("g");

    const translateY = -this.timeSliderHeight + ((this.parentHeight - this.loaderHeight) / 2);
    this.loader = new Loader(this.barGroup, this.parentWidth, this.loaderHeight, translateY);

    window.addEventListener("resize", this._adjust.bind(this));
  }

  _adjust() {
    this.fontSize = 10;
    if (screen.width >= 1400 && screen.height >= 800) {
      this.fontSize = 14;
    }

    // compute width and height based on parent div
    this.parentWidth = parseInt(this.el.style("width")) - parseInt(this.el.style("padding-left")) - parseInt(this.el.style("padding-right"));
    this.parentHeight = parseInt(this.el.style("height")) - parseInt(this.el.style("padding-top")) - parseInt(this.el.style("padding-bottom"));
    this.width = this.parentWidth - this.margin.left - this.margin.right - this.offset.left;
    this.height = this.parentHeight - this.margin.top - this.margin.bottom - this.offset.bottom - this.timeSliderHeight;

    // cambiar dimensiones svg
    this.svg
      .attr("width", this.width + this.margin.left + this.margin.right + this.offset.left)
      .attr("height", this.height + this.margin.bottom + this.margin.top + this.offset.bottom);

    // renderizar grafica
    this._renderBarChart(this.features);

    // renderizar time slider
    this.timeButtons = this.timeSlider.adjust(this.width, this.timeSliderHeight);
    this.timeButtons.on("click", this._changeMoment.bind(this));
  }

  _renderBarChart(features) {
    this.barGroup.selectAll("*").remove();

    // agregar transform una vez se haya quitado el loader
    this.barGroup.attr("transform",`translate(${this.margin.left}, ${this.margin.top})`);

    // agregar texto NoData
    if (!features.length) {
      this.barGroup
        .append("text")
          .attr("x", (this.width + Math.abs(this.margin.left - this.margin.right)) / 2)
          .attr("y", (this.height + Math.abs(this.margin.top - this.margin.bottom)) / 2)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-size", 9)
          .attr("fill", "black")
          .text(window.tncConfig.strings.noAvailableData);
      return;
    }

    const data = this._processFeatures(features);

    this.xScale = d3.scaleBand()
      .domain(d3.range(data.length))
      .range([this.offset.bottom, this.height])
      .paddingInner(0.05);

    const values = [];
    const fields = ["area_bosque", "areas_p_sostenibles", "area_restauracion"];
    this.moments.forEach(moment => {
      fields.forEach(field => {
        values.push(features.map(feat => feat.attributes).filter(feat => feat.momento === moment.value).reduce((a, b) => a + b[field], 0));
      })
    });
    this.yScale = d3.scaleLog()
      .clamp(true)
      .domain([0.1, d3.max(values)])
      .range([0, this.width - this.offset.left]);


    let exp = -1;
    let domainFits = true;
    let result;
    const xTicks = [];
    while (domainFits) {
      result = d3.max(values) / 10 ** exp;
      if (result >= 1) {
        xTicks.push(10 ** exp);
        exp += 1;
      } else {
        domainFits = false;
      }
    }
    const xAxis = d3
      .axisBottom()
      .scale(this.yScale)
      .tickValues(xTicks)
      .tickSizeOuter(0)
      .tickFormat(d => d.toLocaleString("en"));

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
          const svgXCoordinate = d3.mouse(this)[0];
          const coordinates = [d3.event.pageX, d3.event.pageY];
          const value = new Number(Math.round(d.value)).toLocaleString("en");
          const tooltipContent = `
            <span class="tooltip__title">${d.name}</span>
            <hr>
            <span class="tooltip__value">${value}</span><span class="tooltip__subtitle"> ha</span>
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
        .on("mousemove", function () {
          const svgXCoordinate = d3.mouse(this)[0];
          const coordinates = [d3.event.pageX, d3.event.pageY];
          d3.select("#tooltip__graph")
            .style("top", `${coordinates[1]}px`);
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
      .attr("x", d => this.margin.left + this.offset.left + 5)
      .attr(
        "y",
        (d, i) =>
          this.xScale(i) -
          this.margin.bottom -
          this.offset.bottom +
          this.xScale.bandwidth() / 2
      )
      .attr("text-anchor", "start")
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
    
    // cambiar label del primer tick de 0.1 a 0
    const firstTickText = this.barGroup.select(".x.axis .tick text");
    if (firstTickText.text() === "0.1") {
      firstTickText.text("0");
    }

    this.barGroup
      .append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", this.width)
      .attr("y", this.height - (this.offset.bottom + this.margin.bottom))
      .attr("font-size", this.fontSize)
      .attr("font-weight", "bold")
      .text(this.xlabel);
    this.barGroup
      .append("text")
      .attr("class", "y label")
      .attr("text-anchor", "middle")
      .attr("x", -(this.height / 2) + this.margin.bottom + this.offset.bottom)
      .attr("y", 0)
      .attr("transform", "rotate(-90)")
      .attr("font-size", this.fontSize)
      .attr("font-weight", "bold")
      .text(this.ylabel);
  }

  renderGraphic(features, moments=null, isFirstRender=false ) {
    if (isFirstRender) {
      this.moments = moments;
      this.selectedMoment = moments.slice(-1)[0].value;
      this.timeButtons = this.timeSlider.render(moments);
      this.timeButtons.on("click", this._changeMoment.bind(this));
    }
    this.features = features;
    this._renderBarChart(this.features);
  }

  _changeMoment(d, i, n) {
    this.timeSlider.buttonToggle(d, i, n);
    this.selectedMoment = d3.select(n[i]).attr("data-moment");
    this.renderGraphic(this.features);
  }

  _processFeatures(features) {
    const fieldMap = {
      [window.tncConfig.strings.implementacionesAccionBosque]: "area_bosque",
      [window.tncConfig.strings.implementacionesAccionRestauracion]: "area_restauracion",
      [window.tncConfig.strings.implementacionesAccionProduccionSostenible]: "areas_p_sostenibles"
    };

    const data = [];
    features.filter(feat => feat.attributes.momento === this.selectedMoment).forEach(feat => {
      for (let label in fieldMap) {
        const value = feat.attributes[fieldMap[label]];
        if (value) {
          const obj = data.find(item => item.name === label);
          if (obj) {
            obj.value += value;
          } else {
            data.push({ name: label, value: value });
          }
        }
      }
    });
    return data.sort((a, b) => a.name.localeCompare(b.name));  // asegurarse de devolver un array ordenado por el nombre de la accion
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
  }
}