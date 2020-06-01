class Loader {
  constructor(el, width, height, translateY=null) {
    this.loaderSize = height;

    const img = el.append("image")
      .attr("xlink:href", "./img/loader.gif")
      .attr("width", this.loaderSize)
      .attr("height", this.loaderSize)
      .attr("pointer-events", "none");
    const bbox = img.node().getBBox();
    img
      .attr("x", width / 2 - bbox.width / 2)
      .attr("y", height / 2 - bbox.height / 2);
    if (translateY) {
      img.style("transform", `translateY(${translateY}px)`)
    }
  }
}