class Loader {
  constructor(el, width, height) {
    this.loaderSize = height * 1.5;

    const img = el.append("image")
      .attr("xlink:href", "../img/loader.gif")
      .attr("width", this.loaderSize)
      .attr("height", this.loaderSize)
      .attr("pointer-events", "none");
    const bbox = img.node().getBBox();
    img
      .attr("x", width / 2 - bbox.width / 2)
      .attr("y", height / 2 - bbox.height / 2);
  }
}