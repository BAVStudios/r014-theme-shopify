window.addEventListener('load', () => {

	document.addEventListener('shopify:section:load', function (event) {
		const section = event.target;

		if (section.querySelectorAll('slide-show')) {
			setTimeout(() => {
				window.dispatchEvent(new Event('resize'));
			});
		}
	});
});
