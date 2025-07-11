/**
 *  @class
 *  @function SlideShow
 */
if (!customElements.get('slide-show')) {
  class SlideShow extends HTMLElement {
    constructor() {
      super();

    }

    connectedCallback() {
      const slideshow = this;
      const slides = Array.from(slideshow.querySelectorAll('.carousel__slide'));
      const dots = slideshow.dataset.dots === 'true';
      const autoplay = slideshow.dataset.autoplay === 'false' ? false : parseInt(slideshow.dataset.autoplay, 10);
      const align = slideshow.dataset.align === 'center' ? 'center' : 'left';
      const fade = slideshow.dataset.fade === 'true';
      const prevButton = slideshow.querySelector('.flickity-prev');
      const nextButton = slideshow.querySelector('.flickity-next');
      const customDots = slideshow.querySelector('.flickity-page-dots');
      const rightToLeft = document.dir === 'rtl';
      let selectedIndex = 0;
      const args = {
        wrapAround: false,
        cellAlign: align,
        pageDots: dots,
        contain: true,
        fade: fade,
        autoPlay: autoplay,
        rightToLeft: rightToLeft,
        prevNextButtons: false,
        cellSelector: '.carousel__slide',
        on: {}
      };

      if (slides.length < 1) return;

      if (slideshow.classList.contains('main-slideshow')) {
        if (slideshow.classList.contains('desktop-height-image') || slideshow.classList.contains('mobile-height-image')) {
          args.adaptiveHeight = true;
        }

        args.on.ready = function () {
          const flkty = this;

          flkty.resize();

          // Custom Dots.
          if (dots && customDots) {
            const dots = customDots.querySelectorAll('li');
            dots.forEach((dot, i) => {
              dot.addEventListener('click', () => {
                flkty.select(i);
              });
            });
            dots[this.selectedIndex].classList.add('is-selected');
          }

          // Video Support.
          const videoContainer = flkty.cells[0].element.querySelector('.slideshow__slide-video-bg');
          if (videoContainer) {
            const iframe = videoContainer.querySelector('iframe');
            const video = videoContainer.querySelector('video');

            const loadVideo = () => {
              if (iframe && iframe.classList.contains('lazyload')) {
                iframe.addEventListener('lazybeforeunveil', () => {
                  slideshow.videoPlay(videoContainer);
                });
                lazySizes.loader.checkElems();
              } else if (video) {
                slideshow.videoPlay(videoContainer);
              }
            };

            if (iframe) {
              iframe.onload = loadVideo;
            } else if (video) {
              video.onloadstart = loadVideo;
            }
          }
        };

        args.on.change = function (index) {
          const flkty = this;

          // Color changes.
          const colorText = getComputedStyle(this.selectedElement).getPropertyValue('--color-body');
          const dotsWrapper = slideshow.querySelector('.flickity-custom-navigation-wrapper');
          if (dotsWrapper) {
            dotsWrapper.style.setProperty('--color-body', colorText);
          }

          // Custom Dots.
          if (dots && customDots) {
            const dots = customDots.querySelectorAll('li');
            dots.forEach((dot, i) => {
              dot.classList.remove('is-selected');
            });
            dots[this.selectedIndex].classList.add('is-selected');
          }

          // AutoPlay
          if (autoplay) {
            flkty.stopPlayer();
            flkty.playPlayer();
          }

          // Video Support.
          const previousIndex = fizzyUIUtils.modulo(this.selectedIndex - 1, this.slides.length);

          const videoContainerPrev = flkty.cells[previousIndex].element.querySelector('.slideshow__slide-video-bg');
          if (videoContainerPrev) {
            slideshow.videoPause(videoContainerPrev);
          }

          const videoContainer = flkty.cells[index].element.querySelector('.slideshow__slide-video-bg');
          if (videoContainer) {
            slideshow.videoPlay(videoContainer);
          }


        };
      }
      this.flkty = new Flickity(slideshow, args);

      selectedIndex = this.flkty.selectedIndex;

      if (prevButton) {
        prevButton.addEventListener('click', () => {
          this.flkty.previous();
        });
        prevButton.addEventListener('keyup', () => {
          this.flkty.previous();
        });
        nextButton.addEventListener('click', () => {
          this.flkty.next();
        });
        nextButton.addEventListener('keyup', () => {
          this.flkty.next();
        });
      }

      if (Shopify.designMode) {
        slideshow.addEventListener('shopify:block:select', (event) => {
          const index = slides.indexOf(event.target);
          this.flkty.select(index);
        });
      }
    }

    videoPause(videoContainer) {
      setTimeout(() => {
        if (videoContainer.dataset.provider === 'hosted') {
          videoContainer.querySelector('video').pause();
        } else if (videoContainer.dataset.provider === 'youtube') {
          videoContainer.querySelector('iframe').contentWindow.postMessage(JSON.stringify({
            event: "command",
            func: "pauseVideo",
            args: ""
          }), "*");
        } else if (videoContainer.dataset.provider === 'vimeo') {
          videoContainer.querySelector('iframe').contentWindow.postMessage(JSON.stringify({
            method: "pause"
          }), "*");
        }
      }, 10);
    }

    videoPlay(videoContainer) {
      setTimeout(() => {
        if (videoContainer.dataset.provider === 'hosted') {
          videoContainer.querySelector('video').play();
        } else if (videoContainer.dataset.provider === 'youtube') {
          videoContainer.querySelector('iframe').contentWindow.postMessage(JSON.stringify({
            event: "command",
            func: "playVideo",
            args: ""
          }), "*");
        } else if (videoContainer.dataset.provider === 'vimeo') {
          videoContainer.querySelector('iframe').contentWindow.postMessage(JSON.stringify({
            method: "play"
          }), "*");
        }
      }, 10);
    }
  }

  customElements.define('slide-show', SlideShow);
}
