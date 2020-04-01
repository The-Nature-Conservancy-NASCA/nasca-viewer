class Treemap {

  constructor(el, colors) {
    // declarar propiedades utilizando breakpoints
    

    this.margin = {top: 0, right: 20, bottom: 20, left: 20};
    this.timeSliderHeight = 70;
    this.buttonContainerHeight = 12;
    this.el = d3.select(el);

    // compute width and height based on parent div
    this.parentWidth = parseInt(this.el.style("width")) - parseInt(this.el.style("padding-left")) - parseInt(this.el.style("padding-right"));
    this.parentHeight = parseInt(this.el.style("height")) - parseInt(this.el.style("padding-top")) - parseInt(this.el.style("padding-bottom"));
    this.width = this.parentWidth - this.margin.left - this.margin.right;
    this.height = this.parentHeight - this.margin.top - this.margin.bottom - this.timeSliderHeight - this.buttonContainerHeight;
    this.loaderHeight = this.parentHeight * 0.75;

    this.colors = colors;
    this.tooltipOffset = 15;
    this.features;
    this.scheme;
    this.selectedMoment;
    this.timeSlider = new TimeSlider(el, this.width, this.timeSliderHeight, null, this.margin);

    this.treemapGroup = d3.select(el)
      .append("svg")
        .attr("class", "treemap")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .attr("overflow", "visible")
      .append("g");

    const translateY = -this.timeSliderHeight + ((this.parentHeight - this.loaderHeight) / 2);
    this.loader = new Loader(this.treemapGroup, this.parentWidth, this.loaderHeight, translateY);

    this.buttonContainer = d3.select(el)
      .append("div")
        .attr("class", "panel__buttons")
        .style("height", this.buttonContainerHeight);
    this.projectBtn = this.buttonContainer
      .append("button")
      .attr("value", "project")
      .attr("class", "selected")
      .attr("title", window.tncConfig.strings.landcoverByProjectName);
    this.corineBtn = this.buttonContainer
      .append("button")
        .attr("value", "corine")
        .style("visibility", "hidden")
        .attr("title", window.tncConfig.strings.landcoverByCorineName);
    this.buttons = this.buttonContainer.selectAll("button");
    this.buttons
      .style("visibility", "hidden")
      .style("width", this.buttonContainerHeight + "px")
      .style("height", this.buttonContainerHeight + "px");
    const that = this;
    this.buttons.on("click", function () {
      that.scheme = this.value;
      that.renderGraphic(that.features, that.scheme);
    });

    this.constants = {
      NAME: "coberturas",
      PARENT_LABEL: "cobertura_proyecto",
      PARENT_LABEL_ALT: "cobertura_comun",
      CHILD_LABEL: "subcobertura_proyecto",
      CHILD_LABEL_ALT: "corine2",
      VALUE_FIELD: "area"
    };
  }

  _stratify(features, name, parentLabel, childLabel, valueField, moment) {
    const data = {"name": name, "children": []};

    features.filter(feature => feature.momento === moment).forEach(feat => {
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
    // remove everything inside the svg
    this.treemapGroup.selectAll("*").remove();

    // set transform to group after loader is removed
    this.treemapGroup.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

    // agregar texto NoData
    if (!data.children.length) {
      this.treemapGroup
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

    const root = d3.hierarchy(data).sum(d => d.value);

    // create treemap layout
    d3.treemap()
      .size([this.width, this.height])
      .padding(0)
      .round(true)
      (root);



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
            .attr("fill-opacity", 0.05)
            .attr("stroke-opacity", 0.1);
          that.treemapGroup
            .selectAll(`rect.${that._cleanString(d.parent.data.name)}`)
              .attr("fill-opacity", 0.8)
              .attr("stroke-opacity", 1);
          that.treemapGroup.selectAll("text")
            .attr("fill", "black")
            .attr("fill-opacity", 0.4)
            .attr("font-weight", "normal")
            .style("text-shadow", "none");
          that.treemapGroup
            .select(`text#${that._cleanString(d.parent.data.name)}`)
            .attr("visibility", "hidden");
          d3.select(this)
            .attr("stroke-width", 1.5)
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
          that.treemapGroup.selectAll("text")
            .attr("visibility", "visible")
            .attr("fill", d => that._pickTextColorBasedOnBgColorAdvanced(that.colors[d.name]))
            .attr("fill-opacity", 1)
            .attr("font-weight", "bold")
            .style("text-shadow", d => `0 0 6px ${that._pickShadowColorBasedOnBgColorAdvanced(that.colors[d.name])}, 0 0 3px ${that._pickShadowColorBasedOnBgColorAdvanced(that.colors[d.name])}`);
          d3.select("#tooltip__graph").html("").style("display", "none");
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
        .attr("font-weight", "bold")
        .attr("fill", d => this._pickTextColorBasedOnBgColorAdvanced(this.colors[d.name]))
        .attr("fill-opacity", 1)  // 0 0 6px #000000, 0 0 3px #000000
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
        .style("text-shadow", d => `0 0 6px ${this._pickShadowColorBasedOnBgColorAdvanced(this.colors[d.name])}, 0 0 3px ${this._pickShadowColorBasedOnBgColorAdvanced(this.colors[d.name])}`)
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

  _pickShadowColorBasedOnBgColorAdvanced(bgColor) {
    var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    var r = parseInt(color.substring(0, 2), 16); // hexToR
    var g = parseInt(color.substring(2, 4), 16); // hexToG
    var b = parseInt(color.substring(4, 6), 16); // hexToB
    var uicolors = [r / 255, g / 255, b / 255];
    var c = uicolors.map((col) => {
      if (col <= 0.03928) {
        return col / 12.92;
      }
      return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    var L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
    return (L > 0.179) ? "#ffffff" : "#000000";
  }

  _pickTextColorBasedOnBgColorAdvanced(bgColor) {
    var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    var r = parseInt(color.substring(0, 2), 16); // hexToR
    var g = parseInt(color.substring(2, 4), 16); // hexToG
    var b = parseInt(color.substring(4, 6), 16); // hexToB
    var uicolors = [r / 255, g / 255, b / 255];
    var c = uicolors.map((col) => {
      if (col <= 0.03928) {
        return col / 12.92;
      }
      return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    var L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
    return (L > 0.179) ? "#000000" : "#ffffff";
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

  renderGraphic(features, scheme, moments=null, isFirstRender=false) {
    if (isFirstRender) {
      this.scheme = scheme;
      this.selectedMoment = moments.slice(-1)[0].value;
      this.timeButtons = this.timeSlider.render(moments);
      this.timeButtons.on("click", this._changeMoment.bind(this));
    }
    const valueField = this.constants.VALUE_FIELD;
    this.features = features;
    let data;
    if (scheme === "project") {
      data = this._stratify(features, this.constants.NAME, this.constants.PARENT_LABEL, this.constants.CHILD_LABEL, valueField, this.selectedMoment);
    } else if (scheme === "corine") {
      data = this._stratify(features, this.constants.NAME, this.constants.PARENT_LABEL_ALT, this.constants.CHILD_LABEL_ALT, valueField, this.selectedMoment);
    }
    this.buttons
        .classed("selected", false)
      .filter((d, i, n) => d3.select(n[i]).attr("value") === this.scheme)
        .classed("selected", true);
    this._renderTreemap(data);
  }

  _changeMoment(d, i, n) {
    this.timeSlider.buttonToggle(d, i, n);
    this.selectedMoment = d3.select(n[i]).attr("data-moment");
    this.renderGraphic(this.features, this.scheme);
  }
}
