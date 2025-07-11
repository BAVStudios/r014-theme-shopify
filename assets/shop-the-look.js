/**
 *  @class
 *  @function ShopTheLook
 */
if (!customElements.get('shop-the-look')) {
  class ShopTheLook extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.dots = this.querySelectorAll('.thb-hotspot');

      this.setEventListeners();
    }
    setEventListeners() {
      this.dots.forEach((dot, index) => {
        this.checkCardPosition(dot);
        window.addEventListener('resize', () => {
          this.checkCardPosition(dot);
        });
      });
      window.dispatchEvent(new Event('resize'));
    }
    checkCardPosition(dot) {
      let dotBounds = dot.querySelector('.thb-hotspot-bubble').getBoundingClientRect(),
        imageBounds = this.getBoundingClientRect();

      if (dotBounds.bottom > document.documentElement.clientHeight || dotBounds.bottom > imageBounds.bottom) {
        dot.classList.add('bottom-dot');
      } else {
        dot.classList.remove('bottom-dot');
      }
      if (dotBounds.right > imageBounds.right) {
        dot.style.setProperty('--content-offset', `${imageBounds.right - dotBounds.right - 15}px`);
      } else if (dotBounds.left < imageBounds.left) {
        dot.style.setProperty('--content-offset', `${imageBounds.left - dotBounds.left + 15}px`);
      }
    }
  }
  customElements.define('shop-the-look', ShopTheLook);
}