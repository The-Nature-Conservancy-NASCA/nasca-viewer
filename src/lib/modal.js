class Modal {

  constructor()  {
    this._el = document.querySelector('.modal');
    this._renderComponent();
    this._header = this._el.querySelector('.modal-popup__header');
    this._content = this._el.querySelector('.modal-popup__content');
    this._registerEventHandlers();
  }

  openModal({ header, content }) {
    this._setHeader(header);
    this._setContent(content);
    this._el.classList.add('modal--visible');
  }

  hideModal() {
    this._el.classList.remove('modal--visible');
  }

  _setHeader(header) {
    if (header) {
      this._header.innerHTML = header;
    }
  }

  _setContent(content) {
    if (content) {
      this._content.innerHTML = content;
    }
  }

  _registerEventHandlers() {
    document.querySelector('.modal__overlay').addEventListener('click', event => {
      const { className } = event.target;
      if (className != 'modal__overlay') {
        return;
      } 
      this._el.classList.remove('modal--visible');
    });
  }

  _renderComponent() {
    const html = /* html */
     `<div class="modal__overlay">
        <div class="modal-popup">
          <header class="modal-popup__header">
          </header>
          <div class="modal-popup__content">
          </div>
        </div>
      </div>
      `;
      this._el.innerHTML = html;
  }
}