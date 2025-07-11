/**
 *  @class
 *  @function ModalDialog
 */
if (!customElements.get('modal-dialog')) {
  class ModalDialog extends HTMLElement {
    constructor() {
      super();
      this.querySelector('[id^="ModalClose-"]').addEventListener(
        'click',
        this.hide.bind(this)
      );
      this.addEventListener('keyup', (event) => {
        if (event.code.toUpperCase() === 'ESCAPE') {
          this.hide();
        }
      });
      if (this.classList.contains('media-modal')) {
        this.addEventListener('pointerup', (event) => {
          if (event.pointerType === 'mouse' && !event.target.closest('product-model')) this.hide();
        });
      } else {
        this.addEventListener('click', (event) => {
          if (event.target.nodeName === 'MODAL-DIALOG') this.hide();
        });
      }
    }

    connectedCallback() {
      if (this.moved) return;
      this.moved = true;
      document.body.appendChild(this);
    }

    show(opener) {
      this.openedBy = opener;
      document.body.classList.add('overflow-hidden');
      this.setAttribute('open', '');

      setTimeout(() => {
        this.querySelector('[role="dialog"]').focus();
      }, 100);
    }

    hide() {
      if (this.querySelector('#Product-Modal-Content') && Shopify.DesignMode) {
        return;
      }
      document.body.classList.remove('overflow-hidden');
      this.removeAttribute('open');
      this.querySelectorAll('.js-youtube').forEach((video) => {
        video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
      });
      this.querySelectorAll('.js-vimeo').forEach((video) => {
        video.contentWindow.postMessage('{"method":"pause"}', '*');
      });
      this.querySelectorAll('video').forEach((video) => video.pause());
      if (this.querySelector('#Product-Modal-Content')) {
        this.querySelector('#Product-Modal-Content').innerHTML = '';
      }
      if (this.querySelector('.compare-lightbox--data')) {
        this.querySelector('.compare-lightbox--data').innerHTML = '';
      }
    }
  }
  customElements.define('modal-dialog', ModalDialog);
}
if (!customElements.get('modal-opener')) {
  class ModalOpener extends HTMLElement {
    constructor() {
      super();

      const button = this.querySelector('button');

      if (!button) return;
      button.addEventListener('click', () => {
        const modal = document.querySelector(this.getAttribute('data-modal'));
        if (modal) modal.show(button);
      });
    }
  }
  customElements.define('modal-opener', ModalOpener);
}