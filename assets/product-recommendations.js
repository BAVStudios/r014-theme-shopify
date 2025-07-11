/**
 *  @class
 *  @function ProductRecommendations
 */
if (!customElements.get('product-recommendations')) {
	class ProductRecommendations extends HTMLElement {
		constructor() {
			super();

			this.parent = this.closest('.product-recommendations--parent');

			if (this.classList.contains('cart-recommendations')) {
				this.cart = true;
				this.parent = this.closest('.cart-recommendations--parent');
			}
		}
		fetchProducts() {
			fetch(this.dataset.url)
				.then(response => response.text())
				.then(text => {
					const html = document.createElement('div');
					html.innerHTML = text;
					const recommendations = html.querySelector('product-recommendations');

					if (recommendations && recommendations.innerHTML.trim().length) {
						this.innerHTML = recommendations.innerHTML;

						if (this.parent) {
							if (this.cart) {
								this.parent.classList.add('cart-recommendations--full');
							} else {
								this.parent.classList.add('product-recommendations--full');
							}
						}
						this.querySelectorAll('.lazyload').forEach((image) => {
							lazySizes.loader.unveil(image);
						});
					}

					this.classList.add('product-recommendations--loaded');

				})
				.catch(e => {
					console.error(e);
				});
		}
		connectedCallback() {
			this.fetchProducts();
		}
	}

	customElements.define('product-recommendations', ProductRecommendations);
}
