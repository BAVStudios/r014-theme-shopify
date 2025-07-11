/**
 *  @class
 *  @function RecentlyViewedProducts
 */
/**
 *  @class
 *  @function RecentlyViewedProducts
 */
if (!customElements.get('recently-viewed-products')) {
  class RecentlyViewedProducts extends HTMLElement {
    constructor() {
      super();

      this.url = `${theme.routes.search_url}?view=recently-viewed&type=product&q=`;
      this.container = this.querySelector('.products');
      this.currentId = this.dataset.productHandle;
      this.max = Number(this.dataset.max);
      this.products = '';
      const recentIds = window.localStorage.getItem('recently-viewed');
      if (recentIds) {
        window.recentlyViewedIds = JSON.parse(recentIds);
      }
    }

    connectedCallback() {
      this.buildUrl();
    }

    buildUrl() {
      const productHandles = window.recentlyViewedIds.filter(val => val !== this.currentId).slice(0, this.max);
      this.products = productHandles.map(handle => `handle:${handle}`).join(' OR ');
      this.url += encodeURIComponent(this.products);

      this.fetchProducts();
    }

    fetchProducts() {
      fetch(this.url)
        .then(response => response.text())
        .then(text => {
          const html = document.createElement('div');
          html.innerHTML = text;
          const recommendations = html.querySelector('.products');

          if (recommendations && recommendations.innerHTML.trim().length) {
            this.container.innerHTML = recommendations.innerHTML;
            this.classList.add('recently-viewed-products--loaded');
            this.container.querySelectorAll('.lazyload').forEach((image) => {
              lazySizes.loader.unveil(image);
            });
          }
        })
        .catch(e => {
          console.error(e);
        });
    }
  }

  customElements.define('recently-viewed-products', RecentlyViewedProducts);
}
