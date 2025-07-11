/**
 *  @class
 *  @function MediaWithTabs
 */
if (!customElements.get('media-with-tabs')) {
  class MediaWithTabs extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.buttons = Array.from(this.querySelectorAll('.media-with-tabs--button'));
      this.slider = this.querySelector('slide-show');
      this.buttons.forEach((button, i) => {
        button.addEventListener('click', () => {
          this.buttonClick(button, i);
        });
      });
    }
    buttonClick(button, i) {
      [].forEach.call(this.buttons, function (el) {
        el.parentElement.classList.remove('active');
      });
      button.parentElement.classList.add('active');
      this.slider.flkty.select(i);
    }
  }
  customElements.define('media-with-tabs', MediaWithTabs);
}