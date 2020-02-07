class TreeMap {

  constructor (el, colors) {
    const margin = {top: 0, right: 0, bottom: 0, left: 0};
    this.width = 400 - margin.left - margin.right;
    this.height = 300 - margin.top - margin.bottom;

    this.el = el;
    this.colors = colors;
    this.tooltipOffset = 15;

    this.projectBtn = d3.select(el)
                        .append("button")
                          .attr("value", "project")
                          .style("visibility", "hidden")
                          .text("Proyecto");

    this.corineBtn = d3.select(el)
                        .append("button")
                          .attr("value", "corine")
                          .style("visibility", "hidden")
                          .text("Corine");
          
    this.features;
    this.years;
    this.year;
    this.scheme;
    this.buttons = d3.select(el)
                    .selectAll("button");
    this.yearSelect = d3.select("#time__coberturas");


    this.treeMapGroup = d3.select(el)
      .append("svg")
        .attr("class", "treemap")
        .attr("width", this.width + margin.left + margin.right)
        .attr("height", this.height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const that = this;
    this.buttons.on("click", function () {
      that.scheme = this.value;
      that.renderGraphic(that.features, that.scheme, that.level, that.years, that.year);
    });
    this.yearSelect.on("change", function() {
      that.year = this.value;
      that.renderGraphic(that.features, that.scheme, that.level, that.years, that.year);
    })

    this.constants = {
      NAME: "coberturas",
      PARENT_LABEL: "cobertura_proyecto",
      PARENT_LABEL_ALT: "corine1",
      CHILD_LABEL: "subcobertura_proyecto",
      CHILD_LABEL_ALT: "corine2",
      VALUE_FIELD: "area",
      ID_FIELD: "ID_cobertura"
    };
  }

  _stratify (features, name, parentLabel, childLabel, valueField, idField, year) {
    const data = {"name": name, "children": []};

    features.filter(feature => feature.visita == year).forEach(feat => {
      const parentExists = !!data.children.filter(child => child.name === feat[parentLabel]).length;
      if (parentExists) {
        const parent = data.children.filter(child => child.name === feat[parentLabel])[0]
        const childrenExists = !!parent.children.filter(child => child.name === feat[childLabel]).length;
        if (childrenExists) {
          const childEl = parent.children.filter(child => child.name === feat[childLabel])[0];
          childEl.value += feat[valueField];
        } else {
          const obj = {
            "name": feat[childLabel],
            "id": feat[idField],
            "value": feat[valueField]
          };
          parent.children.push(obj);
        }
      } else {
        const obj = {
          "name": feat[parentLabel],
          "children": [{
            "name": feat[childLabel],
            "id": feat[idField],
            "value": feat[valueField]
          }]
        };
        data.children.push(obj);
      }
    })

    return data;
  }

  _renderTreeMap (data) {
    const root = d3.hierarchy(data).sum(d => d.value);

    // create treemap layout
    d3.treemap()
      .size([this.width, this.height])
      .padding(0)
      .round(true)
      (root);

    // remove all existing rectangles  
    this.treeMapGroup.selectAll("rect")
                    .remove();

    const that = this;

    // add rectangles
    this.treeMapGroup.selectAll("rect")
      .data(root.leaves())
      .enter()
      .append("rect")
        .attr("class", d =>
          d.parent.data.name.toLowerCase().replace(/ /g, "_")
        )
        .on("mouseover", function (d) {
          that.treeMapGroup.selectAll("rect")
            .attr("fill-opacity", 0.2);
          d3.select(this)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill-opacity", 0.75);
          const coordinates = [d3.event.pageX, d3.event.pageY];
          const value = Number(Math.round(d.data.value)).toLocaleString("en");
          const tooltipContent = `
              <span class="tooltip__title">${d.parent.data.name}</span><br>
              <span class="tooltip__subtitle">${
                d.data.name ? d.data.name : ""
              }</span>
              <hr>
              <span class="tooltip__value">${value} ha</span>
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
          that.treeMapGroup
            .selectAll("rect")
              .attr("fill-opacity", 0.8)
              .attr("stroke-width", 0.25)
              .attr("stroke", "gray");
          d3.select("#tooltip__graph")
          .html("")
          .style("display", "none");
        })
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("fill-opacity", 0.75)
        .attr("fill", d => this.colors[d.data.id])
        .attr("stroke-width", 0.25)
        .attr("stroke", "gray")
        .transition()
        .on("end", () => this.buttons.style("visibility", "visible"))
        .duration(750)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0);

      this.treeMapGroup
        .selectAll("text")
        .data(data.children)
        .enter()
        .append("text")
        .attr("class", "parent__label")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", 9)
        .attr("fill", "white")
        .attr("x", d => {
          const center = that.computeElementsCenter(
            d3
              .selectAll(`.${d.name.toLowerCase().replace(/ /g, "_")}`)
              .nodes()
          );
          return center.x;
        })
        .attr("y", d => {
          const center = that.computeElementsCenter(
            d3
              .selectAll(`.${d.name.toLowerCase().replace(/ /g, "_")}`)
              .nodes()
          );
          return center.y;
        })
        .text(d => d.name)
        .each(this.wrap.bind(this));
      this.treeMapGroup
        .selectAll("text.parent__label")
        .filter(function(d) {
          const selection = d3
            .selectAll(`.${d.name.toLowerCase().replace(/ /g, "_")}`)
            .nodes();
          const boxesBBox = that.computeElementsBBox(selection);
          const textBBox = that.computeElementsBBox([d3.select(this).node()]);
          const textWidthOverflow =
            textBBox.xmax - textBBox.xmin > boxesBBox.xmax - boxesBBox.xmin;
          const textHeightOverflow =
            textBBox.ymax - textBBox.ymin > boxesBBox.ymax - boxesBBox.ymin;
          return textWidthOverflow || textHeightOverflow;
        })
        .remove();
                    
  }

  computeElementsBBox(selection) {
    const coordinates = {
      xmin: [],
      xmax: [],
      ymin: [],
      ymax: []
    };
    selection.forEach(item => {
      const bbox = item.getBBox();
      coordinates.xmin.push(bbox.x);
      coordinates.ymin.push(bbox.y);
      coordinates.xmax.push(bbox.x + bbox.width);
      coordinates.ymax.push(bbox.y + bbox.height);
    });
    return {
      xmin: Math.min(...coordinates.xmin),
      xmax: Math.max(...coordinates.xmax),
      ymin: Math.min(...coordinates.ymin),
      ymax: Math.max(...coordinates.ymax)
    };
  }

  computeElementsCenter(selection) {
    const { xmin, xmax, ymin, ymax } = this.computeElementsBBox(selection);
    const x = xmin + (xmax - xmin) / 2;
    const y = ymin + (ymax - ymin) / 2;
    return { x, y };
  }

  wrap(d, i) {
    const selection = d3
      .selectAll(`.${d.name.toLowerCase().replace(/ /g, "_")}`)
      .nodes();
    const bbox = this.computeElementsBBox(selection);
    const width = bbox.xmax - bbox.xmin;
    const text = d3.selectAll(".parent__label").filter((d, ind) => ind == i);
    const words = text
      .text()
      .split(/\s+/)
      .reverse();
    const lineHeight = 1.1;
    const x = text.attr("x");
    const y = text.attr("y");
    const dy = 0;

    let line = [];
    let word;
    let lineNumber = 0;
    let tspan = text
      .text(null)
      .append("tspan")
      .attr("x", x)
      .attr("y", y)
      .attr("dy", dy + "em");

    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
  }

  renderGraphic (features, scheme, level, years, year, isFirstRender=false) {
    if (isFirstRender) {
      this._appendOptions(this.yearSelect, years);
      this.scheme = scheme;
      this.years = years;
    }
    this.level = level;
    this.year = year;
    const valueField = this.constants.VALUE_FIELD;
    this.features = features;
    let data;
    if (scheme === "project") {
      data = this._stratify(features, this.constants.NAME, this.constants.PARENT_LABEL, this.constants.CHILD_LABEL, valueField, this.constants.ID_FIELD, year);
    } else if (scheme === "corine") {
      data = this._stratify(features, this.constants.NAME, this.constants.PARENT_LABEL_ALT, this.constants.CHILD_LABEL_ALT, valueField, this.constants.ID_FIELD, year);
    }
    this._renderTreeMap(data);
  }

  _appendOptions(el, options) {
    el.selectAll("option").remove();
    el.selectAll("option")
      .data(options)
      .enter()
      .append("option")
        .attr("value", d => d)
        .text(d => d);
    el.style("visibility", "visible");
  }
}

class StackedBarChart {
    constructor (el) {
      this.margin = {top: 10, right: 10, bottom: 10, left: 35};
      this.offset = {left: 10, bottom: 10};
      this.el = d3.select(el);

      // compute width and height based on parent div
      this.width = parseInt(this.el.style("width")) - this.margin.left - this.margin.right;
      this.height = parseInt(this.el.style("height")) - this.margin.top - this.margin.bottom;
  
      this.color = d3.scaleOrdinal(d3.schemeCategory10);
      this.factor = 0.5;

      this.barGroup = d3.select(el)
                        .append("svg")
                          .attr("class", "bar")
                          .attr("width", this.width + this.margin.left + this.margin.right)
                          .attr("height", this.height + this.margin.top + this.margin.bottom)
                        .append("g")
                          .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

      this.labels;
      // this.data = [
      //   {
      //     "pastos": 150,
      //     "bosques": 75,
      //     "artifical": 5
      //   },
      //   {
      //     "pastos": 3,
      //     "bosques": 34,
      //     "aguas": 5
      //   },
      //   {
      //     "pastos": 45,
      //     "bosques": 90,
      //     "artifical": 7
      //   }
      // ];

      // this.labels = ["Escarabajos", "Aves", "Mamíferos"];

    }

    _renderStackedBarChart(data) {

      this.barGroup.selectAll("*")
        .remove();

      const xScale = d3.scaleBand()
        .domain(d3.range(data.length))
        .range([this.margin.bottom + this.offset.bottom, this.height])
        .paddingInner(0.05);
      


      const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => Object.values(d).reduce((a, b) => a + b, 0))])
        .range([0, this.width - this.margin.left - this.offset.left]);


      var xAxis = d3.axisBottom()
        .scale(yScale)
        .tickSizeOuter(0)
        .tickSizeInner(0)
        .ticks(5);
  
      var yAxis = d3.axisLeft()
        .scale(xScale)
        .tickSizeOuter(0)
        .tickFormat((d, i) => this.labels[i]);
  
      const keys = [];
      data.forEach(group => {
        Object.keys(group).forEach(el => {
          if (!keys.includes(el)) {
            keys.push(el)
          }
        })
      });

      const stack = d3.stack()
        .keys(keys)
        .order(d3.stackOrderDescending);

      const series = stack(data);

      
      const groups = this.barGroup.selectAll("g")
        .data(series)
        .enter()
        .append("g")
          .attr("name", d => d.key)
          .attr("fill", (d, i) => this.color(i));

      const that = this;

      const rects = groups.selectAll("rect")
        .data(d => d)
        .enter()
        .append("rect")
          .on("mouseover", function (d) {
            that.barGroup.selectAll("rect")
                              .attr("fill-opacity", 0.3);
            d3.select(this)
              .attr("stroke", "black")
              .attr("fill-opacity", 0.75);

            const name = d3.select(this.parentNode).attr("name");
            const n = d[1] - d[0];
        
            const coordinates = d3.mouse(this);
            const tooltipContent = `
            <span class="tooltip__title">${name}</span><br>
            <span class="tooltip__value">${n}</span><span class="tooltip__subtitle"> especies</span>
            `;
            d3.select("#tooltip__biodiversidad")
              .style("left", `${coordinates[0]}px`)
              .style("top", `${coordinates[1] + 150}px`)
              .style("display", "block")
              .style("font-size", "11px")
              .html(tooltipContent);
          })
          .on("mousemove", function () {
            const coordinates = d3.mouse(this);
            d3.select("#tooltip__biodiversidad")
              .style("left", `${coordinates[0]}px`)
              .style("top", `${coordinates[1] + 150}px`);
          })
          .on("mouseout", function () {
            that.barGroup.selectAll("rect")
                  .attr("fill-opacity", 0.75);

            d3.select(this)
              .attr("stroke", "none");

            d3.select("#tooltip__biodiversidad")
              .style("display", "none");
          })
          .attr("y", (d, i) => (xScale(i) - this.margin.bottom - this.offset.bottom) + ((xScale.bandwidth() * (1 - this.factor)) / 2))
          .attr("x", (d) => yScale(d[0]) + this.margin.left + this.offset.left)
          .attr("height", xScale.bandwidth() * this.factor)
          .transition()
          .attr("width", (d) => {
            if (!Number.isNaN(d[1])) {
              return yScale(d[1]) - yScale(d[0]);
            } else {
              return 0;
            }
          });

      this.barGroup.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${this.margin.left}, ${-this.margin.bottom - this.offset.bottom})`)
        .call(yAxis);

      this.barGroup.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${this.margin.left + this.offset.left}, ${this.height - this.margin.bottom})`)
        .call(xAxis);
    }

    renderGraphic(data, keys) {
      this.labels = keys;
      this._renderStackedBarChart(data);
    }
}

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

class StackedAreaChart {
  constructor (el) {
    this.margin = {top: 10, right: 10, bottom: 20, left: 30};
    this.offset = {left: 10, bottom: 10};
    this.el = d3.select(el);

    // compute width and height based on parent div
    this.width = parseInt(this.el.style("width")) - this.margin.left - this.margin.right;
    this.height = parseInt(this.el.style("height")) - this.margin.top - this.margin.bottom;

    this.features;
    this.tooltipOffset = 15;
    this.currentYear = new Date().getFullYear();
    this.xlabel = "Año";
    this.ylabel = "Carbono";
    this.title = "Captura de carbono";

    this.totalBtn = d3.select(el)
      .append("button")
        .attr("value", null)
        .style("visibility", "hidden")
        .text("Total");
    this.compartmentBtn = d3.select(el)
        .append("button")
          .attr("value", "comportamiento")
          .style("visibility", "hidden")
          .text("Compartimiento");
    this.coverBtn = d3.select(el)
        .append("button")
          .attr("value", "cobertura")
          .style("visibility", "hidden")
          .text("Cobertura");

    this.buttons = d3.select(el)
      .selectAll("button");

    const that = this;
    this.buttons.on("click", function () {
      that.renderGraphic(that.features, this.value);
    });

    

    this.areaGroup = d3.select(el)
      .append("svg")
        .attr("class", "area")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
        .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

    this.defaultKey = "Total";
    this.domain = {
      0: "Biomasa",
      1: "Suelos",
      2: "Madera"
    };
  }

  _renderStackedAreaChart(data) {
    this.buttons.style("visibility", "visible");
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    this.areaGroup.selectAll("*")
      .remove();

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
      .tickFormat(d => parseInt(d))
      .ticks(5);

    const yAxis = d3.axisLeft()
          .scale(yScale)
          .tickSizeOuter(0)
          .ticks(5);

    const keys = [];
    data.forEach(el => {
      const elKeys = Object.keys(el).filter(item => item !== "year");
      elKeys.forEach(key => {
        if (!keys.includes(key)) {
          keys.push(key);
        }
      }) 
    });
      
    const stack = d3.stack()
      .keys(keys)
      .order(d3.stackOrderDescending);

    const series = stack(data);

    const area = d3.area()
      .x(d => xScale(d.data.year))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]));

    const that = this;
    this.areaGroup.selectAll("path")
      .data(series)
      .enter()
      .append("path")
        .on("mouseover", function (d) {
          const label = d.key;
          const svgCoordinates = d3.mouse(this);
          const year = Math.ceil(xScale.invert(svgCoordinates[0]));
          const accumulatedValue = d.find(item => item.data.year == year)[1];
          const value = d.find(item => item.data.year == year).data[label];
          const areaBeforeYear = d3
            .area()
            .defined(d => d.data.year <= year)
            .x(d => xScale(d.data.year))
            .y0(d => yScale(d[0]))
            .y1(d => yScale(d[1]));
          const areaAfterYear = d3
            .area()
            .defined(d => d.data.year >= year)
            .x(d => xScale(d.data.year))
            .y0(d => yScale(d[0]))
            .y1(d => yScale(d[1]));

          that.areaGroup
            .append("g")
            .attr("class", "area__before")
            .selectAll("path")
            .data(series)
            .enter()
            .append("path")
            .attr("d", areaBeforeYear)
            .attr("fill", d => (d.key == label ? "none" : "white"))
            .attr("fill-opacity", d => (d.key == label ? 1 : 0.8))
            .attr("stroke", d => (d.key == label ? "black" : "none"))
            .attr("pointer-events", "none");
          that.areaGroup
            .append("g")
            .attr("class", "area__after")
            .selectAll("path")
            .data(series)
            .enter()
            .append("path")
            .attr("d", areaAfterYear)
            .attr("fill", "white")
            .attr("fill-opacity", 0.8)
            .attr("pointer-events", "none");

          that.areaGroup
            .select(".vertical.helper__line")
              .attr("x1", xScale(year))
              .attr("x2", xScale(year))
              .attr("y1", yScale.range()[0])
              .attr("y2", yScale(accumulatedValue));
          that.areaGroup
            .select(".horizontal.helper__line")
              .attr("x1", xScale.range()[0])
              .attr("x2", xScale(year))
              .attr("y1", yScale(accumulatedValue))
              .attr("y2", yScale(accumulatedValue));
          that.areaGroup.selectAll(".helper__line").attr("visibility", "visible");
          that.areaGroup.selectAll(".helper__line").raise();
          that.areaGroup.select(".year__division").raise();

          const coordinates = [d3.event.pageX, d3.event.pageY];
          const tooltipValue = Number(Math.round(value)).toLocaleString("en");
          const tooltipContent = `
          <span class="tooltip__title">${label} (${year})</span>
          <hr>
          <span class="tooltip__value">${tooltipValue} MtCO2e</span>
          `;
          d3.select("#tooltip__graph")
            .style("left", `${coordinates[0] + that.tooltipOffset}px`)
            .style("top", `${coordinates[1]}px`)
            .style("display", "block")
            .style("font-size", "11px")
            .html(tooltipContent);
        })
        .on("mousemove", function (d) {
          const label = d.key;
          const svgCoordinates = d3.mouse(this);
          const year = Math.ceil(xScale.invert(svgCoordinates[0]));
          const accumulatedValue = d.find(item => item.data.year == year)[1];
          const value = d.find(item => item.data.year == year).data[label];
          const areaBeforeYear = d3
            .area()
            .defined(d => d.data.year <= year)
            .x(d => xScale(d.data.year))
            .y0(d => yScale(d[0]))
            .y1(d => yScale(d[1]));
          const areaAfterYear = d3
            .area()
            .defined(d => d.data.year >= year)
            .x(d => xScale(d.data.year))
            .y0(d => yScale(d[0]))
            .y1(d => yScale(d[1]));
            d3.selectAll(".area__before").remove();
            d3.selectAll(".area__after").remove();
          that.areaGroup
            .append("g")
            .attr("class", "area__before")
            .selectAll("path")
            .data(series)
            .enter()
            .append("path")
            .attr("d", areaBeforeYear)
            .attr("fill", d => (d.key == label ? "none" : "white"))
            .attr("fill-opacity", d => (d.key == label ? 1 : 0.8))
            .attr("stroke", d => (d.key == label ? "black" : "none"))
            .attr("pointer-events", "none");
          that.areaGroup
            .append("g")
            .attr("class", "area__after")
            .selectAll("path")
            .data(series)
            .enter()
            .append("path")
            .attr("d", areaAfterYear)
            .attr("fill", "white")
            .attr("fill-opacity", 0.8)
            .attr("pointer-events", "none");
          d3.select(".vertical.helper__line")
            .attr("x1", xScale(year))
            .attr("x2", xScale(year))
            .attr("y1", yScale.range()[0])
            .attr("y2", yScale(accumulatedValue));
          d3.select(".horizontal.helper__line")
            .attr("x1", xScale.range()[0])
            .attr("x2", xScale(year))
            .attr("y1", yScale(accumulatedValue))
            .attr("y2", yScale(accumulatedValue));
          d3.selectAll(".helper__line").raise();
          d3.select(".year__division").raise();
          const coordinates = [d3.event.pageX, d3.event.pageY];
          const tooltipValue = Number(Math.round(value)).toLocaleString("en");
          const tooltipContent = `
          <span class="tooltip__title">${label} (${year})</span>
          <hr>
          <span class="tooltip__value">${tooltipValue} MtCO2e</span>
          `;
          d3.select("#tooltip__graph")
            .style("left", `${coordinates[0] + that.tooltipOffset}px`)
            .style("top", `${coordinates[1]}px`)
            .html(tooltipContent);
        })
        .on("mouseout", function () {
          d3.selectAll(".area__before").remove();
          d3.selectAll(".area__after").remove();
          that.areaGroup.selectAll(".helper__line").attr("visibility", "hidden");
          d3.select("#tooltip__graph").style("display", "none").html("");
        })
        .attr("class", "area")
        .attr("d", area)
        .attr("fill", d => color(d.key))
        

    this.areaGroup.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0, ${this.height - this.margin.bottom})`)
      .call(xAxis);

    this.areaGroup.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${this.margin.left}, 0)`)
      .call(yAxis);

    const yearDivision = this.areaGroup
      .append("g")
        .attr("class", "year__division")
        .attr("pointer-events", "none");
    yearDivision
      .append("line")
        .attr("x1", xScale(this.currentYear))
        .attr("x2", xScale(this.currentYear))
        .attr("y1", yScale.range()[0])
        .attr("y2", yScale.range()[1])
        .attr("pointer-events", "none")
        .attr("stroke", "red");
    yearDivision
      .append("text")
        .attr("y", xScale(this.currentYear) - 5)
        .attr("x", yScale.range()[1] - this.margin.bottom)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "end")
        .attr("font-size", 9)
        .attr("fill", "red")
        .text("Cierre");

    this.areaGroup
      .append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("font-size", 10)
        .attr("font-weight", "bold")
        .attr("x", this.width - this.margin.right)
        .attr("y", this.height + 15)
        .text(this.xlabel);
    this.areaGroup
      .append("text")
        .attr("class", "y label")
        .attr("text-anchor", "start")
        .attr("font-size", 10)
        .attr("font-weight", "bold")
        .attr("x", this.margin.left)
        .attr("y", 0)
        .text(this.ylabel);

    this.areaGroup.append("line").attr("class", "vertical helper__line");
    this.areaGroup.append("line").attr("class", "horizontal helper__line");
    this.areaGroup
      .selectAll(".helper__line")
        .attr("visibility", "hidden")
        .attr("pointer-events", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3");
  }

  _formatData(features, field) {
    const startYear = new Date(features[0].attributes.fecha).getFullYear();
    this.years = d3.range(startYear, startYear + 21);
    const data = [];
    features.forEach((feat, i) => {
      const attrs = feat.attributes;
      let key;
      if (!field) {
        key = this.defaultKey;
      } else {
        if (field === "comportamiento") {
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

  renderGraphic(features, field) {
    this.features = features;
    const data = this._formatData(features, field);
    this._renderStackedAreaChart(data);
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
