class TreeMap {

  constructor (el, colors) {
    const margin = {top: 10, right: 10, bottom: 10, left: 10};
    this.width = 400 - margin.left - margin.right;
    this.height = 300 - margin.top - margin.bottom;

    this.color = d3.scaleOrdinal(d3.schemeCategory10);

    this.colors = colors;

    this.treeMapGroup = d3.select(el)
                          .append("svg")
                            .attr("class", "treemap")
                            .attr("width", this.width + margin.left + margin.right)
                            .attr("height", this.height + margin.top + margin.bottom)
                          .append("g")
                            .attr("transform", `translate(${margin.left}, ${margin.top})`);

    this.constants = {
      NAME: "coberturas",
      PARENT_LABEL: "cobertura_actual",
      CHILD_LABEL: "sub_cobertura_actual",
      VALUE_FIELD: "porcentaje_area",
      EXTRA_FIELD: "ID_cobertura"
    };
  }

  _stratify (features, name, parentLabel, childLabel, valueField) {
    const data = {"name": name, "children": []};
    for (let feat of features) {
      const parentExists = !!data.children.filter(child => child.name === feat.attributes[parentLabel]).length;
      if (parentExists) {
        const parent = data.children.filter(child => child.name === feat.attributes[parentLabel])[0]
        const childrenExists = !!parent.children.filter(child => child.name === feat.attributes[childLabel]).length;
        if (childrenExists) {
          const childEl = parent.children.filter(child => child.name === feat.attributes[childLabel])[0];
          childEl.value += feat.attributes[valueField];
        } else {
          const obj = {
            "name": feat.attributes[childLabel],
            "value": feat.attributes[valueField]
          };
          parent.children.push(obj);
        }
      } else {
        const obj = {
          "name": feat.attributes[parentLabel],
          "children": [{
            "name": feat.attributes[childLabel],
            "value": feat.attributes[valueField]
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
                        console.log(d);
                        that.treeMapGroup.selectAll("rect")
                              .attr("fill-opacity", 0.3);

                        d3.select(this)
                          .attr("stroke", "black")
                          .attr("fill-opacity", 0.75);

                        const coordinates = d3.mouse(this);
                        const tooltipContent = `
                          <span class="tooltip__title">${d.parent.data.name}</span><br>
                          <span class="tooltip__subtitle">${d.data.name}</span>: <span class="tooltip__value">${Math.round(d.data.value * 100)}%</span>
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
                      .attr("fill", d => this.color(d.parent.data.name))
                      .transition()
                      .duration(750)
                      .attr('width', d => d.x1 - d.x0)
                      .attr('height', d => d.y1 - d.y0);
                    
  }

  renderGraphic (features) {
    const data = this._stratify(features, this.constants.NAME, this.constants.PARENT_LABEL, this.constants.CHILD_LABEL, this.constants.VALUE_FIELD);
    this._renderTreeMap(data);
  }

}

class Pie {
    constructor (el) {
      const margin = {top: 10, right: 10, bottom: 10, left: 10};
      this.width = 150 - margin.left - margin.right;
      this.height = 150 - margin.top - margin.bottom;
      this.legendItemSize = 15;
  
      this.color = d3.scaleOrdinal(d3.schemeCategory10);

      this.pieGroup = d3.select(el)
                        .append("svg")
                          .attr("class", "pie")
                          .attr("width", this.width + margin.left + margin.right)
                          .attr("height", this.height + margin.top + margin.bottom)
                        .append("g")
                          .attr("transform", `translate(${margin.left}, ${margin.top})`);

    }
}
