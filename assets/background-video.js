/**
 *  @class
 *  @function BackgroundVideo
 */
if (!customElements.get('background-video')) {
	class BackgroundVideo extends HTMLElement {
		constructor() {
			super();

			this.tl = false;
			this.splittext = false;
		}
		connectedCallback() {
			let _this = this;

			// Video Support.
			let video_container = this.querySelector('.background-video__iframe');
			if (video_container) {
				if (video_container.querySelector('iframe')) {
					video_container.querySelector('iframe').onload = function () {
						_this.videoPlay(video_container);
					};
				}
			}
		}
		videoPlay(video_container) {
			setTimeout(() => {
				if (video_container.dataset.provider === 'youtube') {
					video_container.querySelector('iframe').contentWindow.postMessage(JSON.stringify({ event: "command", func: "playVideo", args: "" }), "*");
				} else if (video_container.dataset.provider === 'vimeo') {
					video_container.querySelector('iframe').contentWindow.postMessage(JSON.stringify({ method: "play" }), "*");
				}
			}, 10);
		}
	}
	customElements.define('background-video', BackgroundVideo);
}
