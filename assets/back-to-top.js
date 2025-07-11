if (!customElements.get('back-to-top')) {
	class BackToTop extends HTMLElement {
		constructor() {
			super();
			this.pageHeight = window.innerHeight;
			this.onClick = this.onClick.bind(this);
			this.checkVisible = this.checkVisible.bind(this);
		}

		connectedCallback() {
			this.addEventListener('click', this.onClick);
			window.addEventListener('scroll', this.checkVisible);
		}

		disconnectedCallback() {
			this.removeEventListener('click', this.onClick);
			window.removeEventListener('scroll', this.checkVisible);
		}

		checkVisible() {
			const y = window.scrollY;
			if (y > this.pageHeight) {
				this.classList.add('back-to-top--active');
			} else {
				this.classList.remove('back-to-top--active');
			}
		}

		onClick() {
			window.scrollTo({
				top: 0,
				left: 0,
				behavior: 'smooth'
			});
		}
	}

	customElements.define('back-to-top', BackToTop);
}