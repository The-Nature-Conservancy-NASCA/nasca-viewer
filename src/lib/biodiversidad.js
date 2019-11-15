class Biodiversidad {

  constructor(el) {
    this._el = document.getElementById(el);
  }

  showSpeciesCards(features) {
    let html = '<section class="biodiversidad">';
    features.forEach(feature => {
      const { cantidad, grupo_tnc } = feature.attributes;
      if (grupo_tnc) {
        html += `<div class="biodiversidad__card" data-grupo="${grupo_tnc}">
        <header>
        <h4 class="biodiversidad__card-title">${grupo_tnc}</h4>
        </header>
        <div class="biodiversidad__card-count">
        <h3>${cantidad}</h3>
        </div> 
        </div>`;
      }
    });
    html += '</section>';
    this._el.innerHTML = html;
  }

}