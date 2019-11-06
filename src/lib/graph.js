class TreeMap {

  constructor (el) {
    const margin = {top: 10, right: 10, bottom: 10, left: 10};
    this.width = 300 - margin.left - margin.right;
    this.height = 400 - margin.top - margin.bottom;

    this.color = d3.scaleOrdinal(d3.schemeCategory10);

    this.g = d3.select(el)
                  .append("svg")
                    .attr("width", this.width + margin.left + margin.right)
                    .attr("height", this.height + margin.top + margin.bottom)
                  .append("g")
                    .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    this.constants = {
      NAME: "coberturas",
      PARENT_LABEL: "cobertura_actual",
      CHILD_LABEL: "sub_cobertura_actual",
      VALUE_FIELD: "porcentaje_area"
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
    this.g.selectAll("rect")
          .remove();

    // add rectangles
    this.g.selectAll("rect")
          .data(root.leaves())
          .enter()
          .append("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("fill-opacity", 0.6)
            .style("fill", d => this.color(d.parent.data.name))
            .transition()
            .duration(750)
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0);
      
    // this.g.selectAll("text")
    //       .data(root.leaves())
    //       .enter()
    //       .append("text")
    //         .attr("clip-path", d => d.clipUid)
    //         .attr("x", d => d.x0 + 3)
    //         .attr("y", d => d.y0 + 14)
    //         .text(d => d.data.name)
    //         .attr("font-size", "12px")
    //         .attr("fill", "white");
  }

  renderGraphic (features) {
    const data = this._stratify(features, this.constants.NAME, this.constants.PARENT_LABEL, this.constants.CHILD_LABEL, this.constants.VALUE_FIELD);
    this._renderTreeMap(data);
  }

}
