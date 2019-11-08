class TreeMap {

  constructor (el) {
    const margin = {top: 10, right: 10, bottom: 10, left: 10};
    this.width = 300 - margin.left - margin.right;
    this.height = 300 - margin.top - margin.bottom;
    this.legendItemSize = 15;

    this.color = d3.scaleOrdinal(d3.schemeCategory10);

    this.treeMapGroup = d3.select(el)
                          .append("svg")
                            .attr("class", "treemap")
                            .attr("width", this.width + margin.left + margin.right)
                            .attr("height", this.height + margin.top + margin.bottom)
                          .append("g")
                            .attr("transform", `translate(${margin.left}, ${margin.top})`);

    this.legendGroup = d3.select(el)
                        .append("svg")
                          .attr("class", "legend")
                          .attr("width", this.width + margin.left + margin.right)
                          // .attr("height", this.height + margin.top + margin.bottom)
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
    this.treeMapGroup.selectAll("rect")
                    .remove();

    // remove existing legend
    this.legendGroup.selectAll("g")
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

                        that.legendItems.selectAll("rect")
                                        .filter((name) => name !== d.parent.data.name)
                                        .attr("fill-opacity", 0.3);

                        that.legendItems.selectAll("rect")
                                        .filter((name) => name === d.parent.data.name)
                                        .attr("stroke", "black");

                        that.legendItems.selectAll("text")
                                        .filter((name) => name !== d.parent.data.name)
                                        .attr("fill-opacity", 0.3);
                        
                        that.legendItems.selectAll("text")
                                        .filter((name) => name === d.parent.data.name)
                                        .attr("font-weight", "bold");

                        const xPosition = parseFloat(d3.select(this).attr("x")) + (d.x1 - d.x0) / 2;
                        const yPosition = parseFloat(d3.select(this).attr("y")) / 2 + h / 2;
                              
                        d3.select("#tooltip")
                          .style("left", `${xPosition}px`)
                          .style("top", `${yPosition}px`)
                          .style("display", "block")
                          .html("...");
                          // .html(d.name);
                                        
                      })
                      .on("mouseout", function () {
                        that.treeMapGroup.selectAll("rect")
                              .attr("fill-opacity", 0.75);

                        d3.select(this)
                          .attr("stroke", "none");

                        that.legendItems.selectAll("rect")
                                        .attr("fill-opacity", 0.75)
                                        .attr("stroke", "none");

                        that.legendItems.selectAll("text")
                                        .attr("font-weight", "normal")
                                        .attr("fill-opacity", 0.75);

                        d3.select("#tooltip")
                          .style("display", "none");
                      })
                      .attr("x", d => d.x0)
                      .attr("y", d => d.y0)
                      .attr("fill-opacity", 0.75)
                      .attr("fill", d => this.color(d.parent.data.name))
                      .transition("transition 1")
                      .duration(750)
                      .attr('width', d => d.x1 - d.x0)
                      .attr('height', d => d.y1 - d.y0);

    // add legend
    this.legendItems = this.legendGroup.selectAll("g")
                    .data(d3.map(root.leaves(), d => d.parent.data.name).keys())
                    .enter()
                    .append("g")
                    .on("mouseover", function (name) {
                      that.legendItems.selectAll("rect")
                                      .attr("fill-opacity", 0.3);

                      that.legendItems.selectAll("text")
                                      .attr("fill-opacity", 0.3);

                      d3.select(this)
                        .select("rect")
                        .attr("fill-opacity", 0.75)
                        .attr("stroke", "black");

                      d3.select(this)
                        .select("text")
                        .attr("fill-opacity", 0.75)
                        .attr("font-weight", "bold");

                      that.treeMapGroup.selectAll("rect")
                                        .filter(d => d.parent.data.name !== name)
                                        .attr("fill-opacity", 0.3);

                      that.treeMapGroup.selectAll("rect")
                                        .filter(d => d.parent.data.name === name)
                                        .attr("stroke", "black");
                                        

                    })
                    .on("mouseout", function () {
                      that.legendItems.selectAll("rect")
                                      .attr("stroke", "none")
                                      .attr("fill-opacity", 0.75);

                      that.legendItems.selectAll("text")
                                      .attr("font-weight", "normal")
                                      .attr("fill-opacity", 0.75);

                      that.treeMapGroup.selectAll("rect")
                                        .attr("stroke", "none")
                                        .attr("fill-opacity", "0.75");
                    });

    this.legendItems.append("rect")
                      .attr("x", 2)
                      .attr("y", (d, i) => i * (this.legendItemSize + 5))
                      .attr("fill", d => this.color(d))
                      .attr("fill-opacity", 0.75)
                      .transition("transition 2")
                      .duration(750)
                      .attr("width", this.legendItemSize)
                      .attr("height", this.legendItemSize);

    this.legendItems.append("text")
                  .attr("x", 2 + this.legendItemSize + 5)
                  .attr("y", (d, i) => i * (this.legendItemSize + 5) + (this.legendItemSize / 2))
                  .attr("fill", d => this.color(d))
                  .attr("fill-opacity", 0.75)
                  .attr("text-anchor", "left")
                  .style("alignment-baseline", "middle")
                  .attr("font-size", 11)
                  .transition("transition 3")
                  .duration(750)
                  .text(d => d);
                      
                      
    // this.treeMapGroup.selectAll("text")
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
