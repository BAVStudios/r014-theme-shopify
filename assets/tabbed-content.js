/**
 *  @class
 *  @function TabbedContent
 */
if (!customElements.get('tabbed-content')) {
	class TabbedContent extends HTMLElement {
		static get observedAttributes() {
			return ['selected-index'];
		}
		constructor() {
			super();
		}

		connectedCallback() {
			this.selectedIndex = this.selectedIndex;
			this.scroller = this.querySelector('.tabbed-content--scroll');
			this.buttons = Array.from(this.scroller.querySelectorAll('button'));
			this.panels = Array.from(this.querySelectorAll('.tabbed-content--content'));

			this.buttons.forEach((button, index) => {
				button.addEventListener('click', () => {
					this.selectedIndex = index;
				});
			});
			if (Shopify.designMode) {
				if (!this.classList.contains('product--tabbed-content')) {
					this.addEventListener('shopify:block:select', (event) => {
						this.selectedIndex = this.buttons.indexOf(event.target);
					});
				}

			}
		}
		get selectedIndex() {
			return parseInt(this.getAttribute('selected-index')) || 0;
		}
		set selectedIndex(index) {
			this.setAttribute('selected-index', index);
		}
		attributeChangedCallback(name, oldValue, newValue) {
			if (name === "selected-index" && oldValue !== null && oldValue !== newValue) {
				this.buttons[oldValue].classList.remove('active');
				this.buttons[newValue].classList.add('active');
				this.panels[parseInt(oldValue)].classList.remove('active');
				this.panels[parseInt(newValue)].classList.add('active');

			}
		}
	}
	customElements.define('tabbed-content', TabbedContent);
}
