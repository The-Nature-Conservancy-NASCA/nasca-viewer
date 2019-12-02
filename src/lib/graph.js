class TreeMap {

  constructor (el, colors) {
    const margin = {top: 10, right: 10, bottom: 10, left: 10};
    this.width = 400 - margin.left - margin.right;
    this.height = 300 - margin.top - margin.bottom;

    this.el = el;
    this.colors = colors;

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
      VALUE_FIELD: "porcentaje_area",
      VALUE_FIELD_ALT: "porcentaje_region",
      ID_FIELD: "ID_cobertura"
    };
  }

  _stratify (features, name, parentLabel, childLabel, valueField, idField, year) {
    const data = {"name": name, "children": []};
    for (let feat of features) {
      if (feat.visita == year) {
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
      }
    }
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
                      .on("mouseover", function (d) {
                        that.treeMapGroup.selectAll("rect")
                                          .attr("fill-opacity", 0.3);
    
                        d3.select(this)
                          .attr("stroke", "black")
                          .attr("stroke-width", 1)
                          .attr("fill-opacity", 0.75);
                    
                        const coordinates = d3.mouse(this);
                        const tooltipContent = `
                        <span class="tooltip__title">${d.parent.data.name}</span><br>
                        <span class="tooltip__subtitle">${d.data.name}</span>: <span class="tooltip__value">${Math.round(d.data.value * 100)}%</span>
                        `;
                        d3.select("#tooltip__coberturas")
                          .style("left", `${coordinates[0]}px`)
                          .style("top", `${coordinates[1] + 50}px`)
                          .style("display", "block")
                          .style("font-size", "11px")
                          .html(tooltipContent);
                      })
                      .on("mousemove", function () {
                        const coordinates = d3.mouse(this);
                        d3.select("#tooltip__coberturas")
                          .style("left", `${coordinates[0]}px`)
                          .style("top", `${coordinates[1] + 50}px`);
                      })
                      .on("mouseout", function () {
                        that.treeMapGroup.selectAll("rect")
                              .attr("fill-opacity", 0.75)
                              .attr("stroke-width", 0.25)
                              .attr("stroke", "gray");

                        // d3.select(this)
                        //   .attr("stroke", "none");

                        d3.select("#tooltip__coberturas")
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
                    
  }

  renderGraphic (features, scheme, level, years, year, isFirstRender=false) {
    if (isFirstRender) {
      this._appendOptions(this.yearSelect, years);
      this.scheme = scheme;
      this.years = years;
    }
    this.level = level;
    this.year = year;
    let valueField;
    if (level === "predio") {
      valueField = this.constants.VALUE_FIELD;
    } else if (level === "region") {
      valueField = this.constants.VALUE_FIELD_ALT;
    }
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

class BarChart {
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

      this.data = [
        {
          "pastos": 150,
          "bosques": 75,
          "artifical": 5
        },
        {
          "pastos": 3,
          "bosques": 34,
          "aguas": 5
        },
        {
          "pastos": 45,
          "bosques": 90,
          "artifical": 7
        }
      ];

      this.labels = ["Escarabajos", "Aves", "Mamíferos"];

    }

    _renderBarChart(data) {

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
                    .ticks(5);
  
      var yAxis = d3.axisLeft()
                    .scale(xScale)
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
                                .style("top", `${coordinates[1] + 325}px`)
                                .style("display", "block")
                                .style("font-size", "11px")
                                .html(tooltipContent);
                            })
                            .on("mousemove", function () {
                              const coordinates = d3.mouse(this);
                              d3.select("#tooltip__biodiversidad")
                                .style("left", `${coordinates[0]}px`)
                                .style("top", `${coordinates[1] + 325}px`);
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

    renderGraphic() {
      this._renderBarChart(this.data);
    }
}
