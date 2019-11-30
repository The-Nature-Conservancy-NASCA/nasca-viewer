class TreeMap {

  constructor (el, colors) {
    const margin = {top: 10, right: 10, bottom: 10, left: 10};
    this.width = 400 - margin.left - margin.right;
    this.height = 300 - margin.top - margin.bottom;

    this.el = el;
    this.colors = colors;

    this.projectBtn = d3.select(el)
                        .append("button")
                          .attr("value", "name")
                          .style("visibility", "hidden")
                          .text("Proyecto");

    this.corineBtn = d3.select(el)
                        .append("button")
                          .attr("value", "name_alt")
                          .style("visibility", "hidden")
                          .text("Corine");

    this.prop = "name";

    this.buttons = d3.select(el)
                    .selectAll("button");

    this.treeMapGroup = d3.select(el)
                          .append("svg")
                            .attr("class", "treemap")
                            .attr("width", this.width + margin.left + margin.right)
                            .attr("height", this.height + margin.top + margin.bottom)
                          .append("g")
                            .attr("transform", `translate(${margin.left}, ${margin.top})`);
                            
    const that = this;
    this.buttons.on("click", function () {
      that.prop = this.value;
      that.treeMapGroup
        .selectAll("rect")
          .on("mousover", function () {
            that.treeMapGroup.selectAll("rect")
                            .attr("fill-opacity", 0.3);

            d3.select(this)
              .attr("stroke", "black")
              .attr("fill-opacity", 0.75);

            const coordinates = d3.mouse(this);
            const tooltipContent = `
            <span class="tooltip__title">${d.parent.data[that.prop]}</span><br>
            <span class="tooltip__subtitle">${d.data[that.prop]}</span>: <span class="tooltip__value">${Math.round(d.data.value * 100)}%</span>
            `;
            d3.select("#tooltip")
            .style("left", `${coordinates[0]}px`)
            .style("top", `${coordinates[1] + 50}px`)
            .style("display", "block")
            .style("font-size", "11px")
            .html(tooltipContent);
          });
      });

    this.constants = {
      NAME: "coberturas",
      PARENT_LABEL: "cobertura_proyecto",
      PARENT_LABEL_ALT: "corine1",
      CHILD_LABEL: "subcobertura_proyecto",
      CHILD_LABEL_ALT: "corine2",
      VALUE_FIELD: "porcentaje_area",
      ID_FIELD: "ID_cobertura"
    };
  }

  _stratify (features, name, parentLabel, childLabel, parentLabelAlt, childLabelAlt, valueField, idField) {
    const data = {"name": name, "children": []};
    for (let feat of features) {
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
            "name_alt": feat[childLabelAlt],
            "id": feat[idField],
            "value": feat[valueField]
          };
          parent.children.push(obj);
        }
      } else {
        const obj = {
          "name": feat[parentLabel],
          "name_alt": feat[parentLabelAlt],
          "children": [{
            "name": feat[childLabel],
            "name_alt": feat[childLabelAlt],
            "id": feat[idField],
            "value": feat[valueField]
          }]
        };
        data.children.push(obj);
      }
    }
    return data;
  }

  _renderTreeMap (data) {
    const root = d3.hierarchy(data).sum(d => d.value);

    // create treemap layout
    d3.treemap()
      .size([this.width, this.height])
      .padding(1)
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
                          .attr("fill-opacity", 0.75);
                    
                        const coordinates = d3.mouse(this);
                        const tooltipContent = `
                        <span class="tooltip__title">${d.parent.data[that.prop]}</span><br>
                        <span class="tooltip__subtitle">${d.data[that.prop]}</span>: <span class="tooltip__value">${Math.round(d.data.value * 100)}%</span>
                        `;
                        d3.select("#tooltip")
                          .style("left", `${coordinates[0]}px`)
                          .style("top", `${coordinates[1] + 50}px`)
                          .style("display", "block")
                          .style("font-size", "11px")
                          .html(tooltipContent);
                      })
                      .on("mousemove", function () {
                        const coordinates = d3.mouse(this);
                        d3.select("#tooltip")
                          .style("left", `${coordinates[0]}px`)
                          .style("top", `${coordinates[1] + 50}px`);
                      })
                      .on("mouseout", function () {
                        that.treeMapGroup.selectAll("rect")
                              .attr("fill-opacity", 0.75);

                        d3.select(this)
                          .attr("stroke", "none");

                        d3.select("#tooltip")
                          .style("display", "none");
                      })
                      .attr("x", d => d.x0)
                      .attr("y", d => d.y0)
                      .attr("fill-opacity", 0.75)
                      .attr("fill", d => this.colors[d.data.id])
                      .transition()
                      .on("end", () => this.buttons.style("visibility", "visible"))
                      .duration(750)
                      .attr('width', d => d.x1 - d.x0)
                      .attr('height', d => d.y1 - d.y0);
                    
  }

  renderGraphic (features) {
    const data = this._stratify(features, this.constants.NAME, this.constants.PARENT_LABEL, this.constants.CHILD_LABEL, this.constants.PARENT_LABEL_ALT, this.constants.CHILD_LABEL_ALT, this.constants.VALUE_FIELD, this.constants.ID_FIELD);
    this._renderTreeMap(data);
  }

}

class BarChart {
    constructor (el) {
      const margin = {top: 10, right: 10, bottom: 10, left: 10};
      this.width = 150 - margin.left - margin.right;
      this.height = 150 - margin.top - margin.bottom;
  
      this.color = d3.scaleOrdinal(d3.schemeCategory10);

      this.barGroup = d3.select(el)
                        .append("svg")
                          .attr("class", "pie")
                          .attr("width", this.width + margin.left + margin.right)
                          .attr("height", this.height + margin.top + margin.bottom)
                        .append("g")
                          .attr("transform", `translate(${margin.left}, ${margin.top})`);

    }
}
