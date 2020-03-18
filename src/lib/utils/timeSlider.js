class TimeSlider {
  constructor(el, width, height) {
    this.height = height;
    this.width = width;
    this.radius = 12;
    this.color = "#49aa42";
    this.labelMarginBottom = 7;
    this.fontSize = 9;
    this.possiblePositions = {
      1: [this.width/2],
      2: [this.radius, this.width - this.radius],
      3: [this.radius, this.width/2, this.width - this.radius],
      4: [this.radius, this.width * 1/3, this.width * 2/3, this.width - this.radius]
    };
    this.svg = d3.select(el)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);
  }

  render(data) {
    this.svg.selectAll("*").remove();  // remover todo lo que este dentro del svg
    const that = this;
    const positions = this.possiblePositions[data.length];

    // agregar circulos grandes
    const bigCirclesGroup = this.svg.append("g").attr("class", "big__circles");
    bigCirclesGroup
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
        .attr("cx", (d, i) => positions[i])
        .attr("cy", this.height / 2)
        .attr("r", this.radius)
        .attr("fill", this.color);

    // agregar linea que conecta los circulos
    this.svg
      .append("line")
        .attr("x1", this.radius)
        .attr("x2", this.width - this.radius)
        .attr("y1", this.height / 2)
        .attr("y2", this.height / 2)
        .attr("stroke-width", Math.round(this.radius / 6))
        .attr("stroke", this.color);

    // agregar labels
    const labelsGroup = this.svg.append("g").attr("class", "circle__labels");
    labelsGroup
      .selectAll("text")
      .data(data)
      .enter()
      .append("text")
        .attr("x", (d, i) => positions[i])
        .attr("y", (this.height / 2) - (this.radius + this.labelMarginBottom))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", this.fontSize)
        .attr("fill", "black")
        .text(d => d.name)
      .filter((d, i) => i == data.length-1)
        .attr("font-weight", "bold");

    // agregar circulos pequeños
    const smallCirclesGroup = this.svg.append("g").attr("class", "small__circles");
    smallCirclesGroup
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
        .on("click", function(d, i) {
          smallCirclesGroup
            .selectAll("circle")
            .filter((d, idx) => idx !== i)
              .attr("pointer-events", "all")
              .transition()
              .attr("fill", "white");
          d3.select(this)
            .attr("pointer-events", "none")
            .transition()  
            .attr("fill", that.color);
          labelsGroup
            .selectAll("text")
            .filter((d, idx) => idx !== i)
              .transition()
              .attr("font-weight", "normal");
          labelsGroup
          .selectAll("text")
          .filter((d, idx) => idx === i)
            .transition()
            .attr("font-weight", "bold"); 
        })
        .attr("cx", (d, i) => positions[i])
        .attr("cy", this.height / 2)
        .attr("r", Math.round(this.radius / 1.25))
        .attr("fill", "white")
        .attr("cursor", "pointer")
      .filter((d, i) => i == data.length-1)
        .attr("fill", this.color)
        .attr("pointer-events", "none");
  }
}