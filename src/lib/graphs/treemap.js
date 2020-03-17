class Treemap {

  constructor(el, colors) {
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
    this.buttons = d3.select(el).selectAll("button");
    this.yearSelect = d3.select("#time__coberturas");
    this.treemapGroup = d3.select(el)
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
      PARENT_LABEL_ALT: "cobertura_comun",
      CHILD_LABEL: "subcobertura_proyecto",
      CHILD_LABEL_ALT: "corine2",
      VALUE_FIELD: "area"
    };
  }

  _stratify(features, name, parentLabel, childLabel, valueField, idField, year) {
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
            "value": feat[valueField]
          };
          parent.children.push(obj);
        }
      } else {
        const obj = {
          "name": feat[parentLabel],
          "children": [{
            "name": feat[childLabel],
            "value": feat[valueField]
          }]
        };
        data.children.push(obj);
      }
    })

    return data;
  }

  _renderTreemap(data) {
    const root = d3.hierarchy(data).sum(d => d.value);

    // create treemap layout
    d3.treemap()
      .size([this.width, this.height])
      .padding(1)
      .round(true)
      (root);

    // remove everything inside the svg
    this.treemapGroup.selectAll("*").remove();

    const that = this;

    // add rectangles
    this.treemapGroup
      .selectAll("rect")
      .data(root.leaves())
      .enter()
      .append("rect")
        .attr("class", d =>
          d.parent.data.name.toLowerCase().replace(/[^A-Z0-9]/gi, "_")
        )
        .on("mouseover", function (d) {
          that.treemapGroup
            .selectAll("rect")
            .attr("fill-opacity", 0.2)
            .attr("stroke-opacity", 0.3);
          that.treemapGroup.selectAll("text").attr("fill-opacity", 0.3);
          that.treemapGroup
            .select(`text#${that._cleanString(d.parent.data.name)}`)
            .attr("fill-opacity", 1)
            .attr("font-weight", "bold");
          d3.select(this)
            .attr("stroke-width", 1)
            .attr("fill-opacity", 1)
            .attr("stroke-opacity", 1);
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
          that.treemapGroup
            .selectAll("rect")
            .attr("fill-opacity", 0.8)
            .attr("stroke-opacity", 1)
            .attr("stroke-width", 0.5);
          that.treemapGroup
            .selectAll("text")
            .attr("fill-opacity", 1)
            .attr("font-weight", "normal");
          d3.select("#tooltip__graph")
          .html("")
          .style("display", "none");
        })
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("fill", d => this.colors[d.parent.data.name] ? this.colors[d.parent.data.name] : "#000000")
        .attr("fill-opacity", 0.8)
        .attr("stroke", d => this._shadeColor(this.colors[d.parent.data.name] ? this.colors[d.parent.data.name] : "#000000", -20))
        .attr("stroke-width", 0.5)
        .attr("stroke-opacity", 1)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0);

      this.buttons.style("visibility", "visible");

      this.treemapGroup
        .selectAll("text")
        .data(data.children)
        .enter()
        .append("text")
        .attr("id", d => this._cleanString(d.name))
        .attr("class", "parent__label")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", 9)
        .attr("fill", "black")
        .attr("fill-opacity", 1)
        .attr("x", d => {
          const center = that._computeElementsCenter(
            d3
              .selectAll(
                `.${d.name.toLowerCase().replace(/[^A-Z0-9]/gi, "_")}`
              )
              .nodes()
          );
          return center.x;
        })
        .attr("y", d => {
          const center = that._computeElementsCenter(
            d3
              .selectAll(
                `.${d.name.toLowerCase().replace(/[^A-Z0-9]/gi, "_")}`
              )
              .nodes()
          );
          return center.y;
        })
        .text(d => d.name)
        .each(this._wrap.bind(this));
      this.treemapGroup
        .selectAll("text.parent__label")
        .filter(function(d) {
          const selection = d3
            .selectAll(`.${d.name.toLowerCase().replace(/[^A-Z0-9]/gi, "_")}`)
            .nodes();
          const boxesBBox = that._computeElementsBBox(selection);
          const textBBox = that._computeElementsBBox([d3.select(this).node()]);
          const textWidthOverflow =
            textBBox.xmax - textBBox.xmin > boxesBBox.xmax - boxesBBox.xmin;
          const textHeightOverflow =
            textBBox.ymax - textBBox.ymin > boxesBBox.ymax - boxesBBox.ymin;
          return textWidthOverflow || textHeightOverflow;
        })
        .remove();
                    
  }

  _cleanString(string) {
    return string.toLowerCase().replace(/[^A-Z0-9]/gi, "_");
  }

  _computeElementsBBox(selection) {
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

  _computeElementsCenter(selection) {
    const { xmin, xmax, ymin, ymax } = this._computeElementsBBox(selection);
    const x = xmin + (xmax - xmin) / 2;
    const y = ymin + (ymax - ymin) / 2;
    return { x, y };
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

  _wrap(d, i) {
    const selection = d3
      .selectAll(`.${d.name.toLowerCase().replace(/[^A-Z0-9]/gi, "_")}`)
      .nodes();
    const bbox = this._computeElementsBBox(selection);
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
    if (lineNumber > 0) {
      const startDy = -(lineNumber * (lineHeight / 2));
      text
        .selectAll("tspan")
        .attr("dy", (d, i) => startDy + lineHeight * i + "em");
    }
  }

  renderGraphic(features, scheme, level, years, year, isFirstRender=false) {
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
    this._renderTreemap(data);
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
