class TimeSlider {
  constructor(el, width, height, otherEl=null, margin=null, padding=null) {
    this.el = d3.select(el);
    this.height = height;
    this.width = width;
    if (margin) {
      this.margin = margin;
    } else {
      this.margin = { left: 0, right: 0 };
    }
    if (padding) {
      this.initialPadding = true;
      this.padding = padding;
    } else {
      this.initialPadding = false;
      this.padding = { left: 15, right: 15 };
      if (window.innerWidth >= 1400 && window.innerHeight >= 800) {
        this.padding = { left: 20, right: 20 };
      }
    }
    this.radius = 9;
    this.color = window.themeColor;
    this.labelMarginBottom = 7;
    this.labelMarginTop = 8;

    this.fontSize = 10;
    if (window.innerWidth >= 1400 && window.innerHeight >= 800) {
      this.fontSize = 12;
    }

    this.data;
    this.possiblePositions = {
      1: [
          this.width / 2
        ],
      2: [
          this.padding.left + this.radius, 
          this.width - this.radius - this.padding.right
        ],
      3: [
          this.padding.left + this.radius, 
          this.width / 2, 
          this.width - this.radius - this.padding.right
        ],
      4: [
        this.padding.left + this.radius, 
        this.padding.left + (this.width * 1/3), 
        this.padding.left + (this.width * 2/3), 
        this.width - this.radius - this.padding.right
      ]
    };
    if (otherEl) {
      this.svg = this.el
        .insert("svg", otherEl)
          .attr("width", this.width)
          .attr("height", this.height)
          .style("margin-left", this.margin.left + "px")
          .style("margin-right", this.margin.right + "px");
    } else {
      this.svg = this.el
      .append("svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .style("margin-left", this.margin.left + "px")
        .style("margin-right", this.margin.right + "px");
    }

  }

  adjust(width, height) {

    if (!this.initialPadding) {
      this.padding = { left: 15, right: 15 };
      if (window.innerWidth >= 1400 && window.innerHeight >= 800) {
        this.padding = { left: 20, right: 20 };
      }
    }
    
    this.fontSize = 10;
    if (window.innerWidth >= 1400 && window.innerHeight >= 800) {
      this.fontSize = 12;
    }

    this.width = width;
    this.height = height;
    this.svg
      .attr("width", this.width)
      .attr("height", this.height);

    this.possiblePositions = {
      1: [
          this.width / 2
        ],
      2: [
          this.padding.left + this.radius, 
          this.width - this.radius - this.padding.right
        ],
      3: [
          this.padding.left + this.radius, 
          this.width / 2, 
          this.width - this.radius - this.padding.right
        ],
      4: [
        this.padding.left + this.radius, 
        this.padding.left + (this.width * 1/3), 
        this.padding.left + (this.width * 2/3), 
        this.width - this.radius - this.padding.right
      ]
    };
    
    const timeButtons = this.render(this.data);
    return timeButtons;
  }

  render(data) {
    this.data = data;
    this.svg.selectAll("*").remove();  // remover todo lo que este dentro del svg
    const positions = this.possiblePositions[data.length];

    // agregar circulos grandes
    this.bigCirclesGroup = this.svg.append("g").attr("class", "big__circles");
    this.bigCirclesGroup
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
        .attr("cx", (d, i) => positions[i])
        .attr("cy", this.height / 2)
        .attr("r", this.radius)
        .attr("fill", this.color);

    // agregar linea que conecta los circulos
    this.line = this.svg
      .append("line")
        .attr("x1", this.padding.right + this.radius)
        .attr("x2", this.width - this.radius - this.padding.right)
        .attr("y1", this.height / 2)
        .attr("y2", this.height / 2)
        .attr("stroke-width", Math.round(this.radius / 6))
        .attr("stroke", this.color);
  

    // agregar labels con el nombre del momento
    this.momentLabelsGroup = this.svg.append("g").attr("class", "circle__labels");
    this.momentLabelsGroup
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

    // agregar labels con el año del momento
    this.yearLabelsGroup = this.svg.append("g").attr("class", "circle__labels");
    this.yearLabelsGroup
      .selectAll("text")
      .data(data)
      .enter()
      .append("text")
        .attr("x", (d, i) => positions[i])
        .attr("y", (this.height / 2) + (this.radius + this.labelMarginTop))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", this.fontSize)
        .attr("fill", "black")
        .text(d => d.year)
      .filter((d, i) => i == data.length-1)
        .attr("font-weight", "bold");

    // agregar circulos pequeños
    this.smallCirclesGroup = this.svg.append("g").attr("class", "small__circles");
    this.smallCirclesGroup
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
        .attr("data-moment", d => d.value)
        .attr("cx", (d, i) => positions[i])
        .attr("cy", this.height / 2)
        .attr("r", Math.round(this.radius / 1.25))
        .attr("fill", "white")
        .attr("cursor", "pointer")
      .filter((d, i) => i == data.length-1)
        .attr("fill", this.color)
        .attr("pointer-events", "none");

    // esconder linea y circulos en casos donde haya solo una fecha
    if (this.data.length === 1) {
      this.bigCirclesGroup.attr("visibility", "hidden");
      this.line.attr("visibility", "hidden");
      this.smallCirclesGroup.attr("visibility", "hidden");
      const that = this;
      this.momentLabelsGroup
      .selectAll("text")
      .attr("y", function() {
        return +d3.select(this).attr("y") + 7;
      });
      this.yearLabelsGroup
        .selectAll("text")
        .attr("y", function() {
          return +d3.select(this).attr("y") - 7;
        });
    }
    
    return this.smallCirclesGroup.selectAll("circle");
  }

  buttonToggle(d, i, n) {
    // llenar circulos no seleccionados con blanco
    this.smallCirclesGroup
      .selectAll("circle")
      .filter((d, idx) => idx !== i)
        .attr("pointer-events", "all")
        .transition()
        .attr("fill", "white");

    // llenar circulo seleccionado con color
    d3.select(n[i])
      .attr("pointer-events", "none")
      .transition()  
      .attr("fill", this.color);

    // poner font-weight de los labels de los circulos no seleccionados normal
    this.momentLabelsGroup
      .selectAll("text")
      .filter((d, idx) => idx !== i)
        .transition()
        .attr("font-weight", "normal");
    this.yearLabelsGroup
      .selectAll("text")
      .filter((d, idx) => idx !== i)
        .transition()
        .attr("font-weight", "normal");

    // poner font-weight del label del circulo seleccionado en bold
    this.momentLabelsGroup
      .selectAll("text")
      .filter((d, idx) => idx === i)
        .transition()
        .attr("font-weight", "bold");
    this.yearLabelsGroup
      .selectAll("text")
      .filter((d, idx) => idx === i)
        .transition()
        .attr("font-weight", "bold"); 
  }
}