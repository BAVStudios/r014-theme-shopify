/**
 *  @class
 *  @function Pagination
 */

if (!customElements.get('pagination-theme')) {
  class Pagination extends HTMLElement {
    constructor() {
      super();
      const id = this.dataset.section;
      this.button = this.querySelector('.load-more');
      this.grid = document.querySelector(`[data-id="${id}"]`);
      this.page = 1;
    }

    connectedCallback() {
      if (this.classList.contains('pagination-type--loadmore')) {
        this.initLoadMore();
      }
      if (this.classList.contains('pagination-type--infinite')) {
        this.initInfiniteScroll();
      }
    }

    addUrlParam(search, key) {
      const newParam = `${key}=${this.page}`;
      if (!search) return `?${newParam}`;

      const params = search.replace(new RegExp(`([?&])${key}[^&]*`), `$1${newParam}`);
      return params === search ? `${search}&${newParam}` : params;
    }

    initLoadMore() {
      this.button.addEventListener('click', () => {
        this.loadProducts();
        this.button.blur();
      });
    }

    initInfiniteScroll() {
      this.observer = new IntersectionObserver(entries => {
        if (entries[0].intersectionRatio === 1) {
          this.loadProducts();
        }
      }, {
        threshold: [0, 1]
      });
      this.observer.observe(this);
    }

    async loadProducts() {
      if (this.hasAttribute('loading')) return;

      this.page++;
      this.setAttribute('loading', 'true');
      const url = `${document.location.pathname}${this.addUrlParam(document.location.search, 'page')}`;

      try {
        const response = await fetch(url);
        const responseText = await response.text();
        this.renderProducts(responseText, url);

        dispatchCustomEvent('pagination:page-changed', { url });
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        this.removeAttribute('loading');
      }
    }

    renderProducts(html, url) {
      const gridToReplace = new DOMParser().parseFromString(html, 'text/html').getElementById('product-grid');
      if (!gridToReplace) {
        if (this.observer) this.observer.unobserve(this);
        if (this.button) this.button.classList.add('visually-hidden');
        return;
      }

      const products = gridToReplace.querySelectorAll('.columns');
      products.forEach((product) => {
        this.grid.appendChild(product);
        product.querySelectorAll('.lazyload').forEach((image) => {
          lazySizes.loader.unveil(image);
        });
      });

    }
  }

  customElements.define('pagination-theme', Pagination);
}
