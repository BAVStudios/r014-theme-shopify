/**
 *  @class
 *  @function BeforeAfter
 */
if (!customElements.get('before-after')) {
	class BeforeAfter extends HTMLElement {
		constructor() {
			super();
			this.parent = this.closest('.before-after-image');
			this.slider = this.querySelector('.before-after-image--slider');
		}
		connectedCallback() {
			this.slider.addEventListener('input', this.onInput.bind(this));
		}
		onInput() {
			this.parent.style.setProperty('--percent', `${this.slider.value / 10}%`);
		}
	}
	customElements.define('before-after', BeforeAfter);
}
