/**
 *  @class
 *  @function SidePanelLinks
 */
if (!customElements.get('side-panel-links')) {
  class SidePanelLinks extends HTMLElement {
    constructor() {
      super();
      this.links = this.querySelectorAll('button');
      this.drawer = document.getElementById('Product-Information-Drawer');
      this.headings = this.drawer.querySelectorAll('.side-panel--heading');
      this.panels = this.drawer.querySelectorAll('.side-panel-content--tab-panel');
      this.body = document.body;
    }
    connectedCallback() {
      this.setupObservers();
    }
    setupObservers() {
      this.links.forEach((item, i) => {
        item.addEventListener('click', (e) => {
          this.body.classList.add('open-cc');
          this.toggleActiveClass(i);
          this.drawer.classList.add('active');
          this.drawer.removeAttribute('inert');
        });
      });
    }
    toggleActiveClass(i) {
      this.panels.forEach((panel) => {
        panel.classList.remove('tab-active');
      });
      this.headings.forEach((heading) => {
        heading.classList.remove('tab-active');
      });
      this.panels[i].classList.add('tab-active');
      this.headings[i].classList.add('tab-active');
    }
  }

  customElements.define('side-panel-links', SidePanelLinks);
}