/**
 *  @class
 *  @function ThemeCart
 */
if (!customElements.get('theme-cart')) {
  class ThemeCart extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.setupEventListeners();
    }
    onFormChange(event) {
      this.updateQuantity(event.target.dataset.index, event.target.value);
    }
    onNotesChange() {
      this.saveNotes();
    }
    saveNotes() {
      fetch(`${theme.routes.cart_update_url}.js`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': `application/json`
        },
        body: JSON.stringify({
          'note': this.notes.value
        })
      });
    }
    setupEventListeners() {
      this.form = this.querySelector('#cart-form');
      this.notes = this.querySelector('#CartSpecialInstructions');

      this.removeProductEvent();

      this.debouncedOnFormChange = debounce((event) => {
        this.onFormChange(event);
      }, 300);

      document.addEventListener('cart:refresh', (event) => {
        this.refresh();
      });
      this.notes?.addEventListener('change', this.onNotesChange.bind(this));
      this.form?.addEventListener('change', this.debouncedOnFormChange.bind(this));
    }
    getSectionsToRender() {
      return [{
        id: 'Cart',
        section: 'main-cart',
        selector: '.thb-cart-form'
      },
      {
        id: 'Cart',
        section: 'main-cart',
        selector: '.thb-cart-form--count'
      },
      {
        id: 'cart-drawer-toggle',
        section: 'cart-bubble',
        selector: '.thb-secondary-area--item-count'
      },
      {
        id: 'cart-drawer-toggle',
        section: 'cart-bubble',
        selector: '.thb-secondary-area--item-amount'
      }];
    }
    displayErrors(line, message) {
      const lineItemError =
        document.getElementById(`Line-item-error-${line}`) || document.getElementById(`CartDrawer-LineItemError-${line}`);
      if (lineItemError) {
        lineItemError.removeAttribute('hidden');
        lineItemError.querySelector('.cart-item__error-text').innerHTML = message;
        this.form.querySelector(`#CartItem-${line}`).classList.remove('loading');

        this.setupEventListeners();
      }
    }
    getSectionInnerHTML(html, selector) {
      return new DOMParser()
        .parseFromString(html, 'text/html')
        .querySelector(selector).innerHTML;
    }
    updateQuantity(line, quantity) {

      this.form.classList.add('cart-disabled');
      if (line) {
        this.form.querySelector(`#CartItem-${line}`).classList.add('loading');
      }

      const body = JSON.stringify({
        line,
        quantity,
        sections: this.getSectionsToRender().map((section) => section.section),
        sections_url: window.location.pathname
      });
      dispatchCustomEvent('line-item:change:start', {
        quantity: quantity
      });
      fetch(`${theme.routes.cart_change_url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': `application/json`
        },
        ...{
          body
        }
      })
        .then((response) => {
          return response.text();
        })
        .then((state) => {
          const parsedState = JSON.parse(state);


          if (parsedState.errors) {
            this.displayErrors(line, parsedState.errors);
            this.form.classList.remove('cart-disabled');
            return;
          }

          this.renderContents(parsedState, line, false);

          this.form.classList.remove('cart-disabled');

          dispatchCustomEvent('line-item:change:end', {
            quantity: quantity,
            cart: parsedState
          });
        });
    }
    refresh() {
      this.form.classList.add('cart-disabled');

      let sections = 'main-cart';

      fetch(`${window.location.pathname}/?sections=${sections}`)
        .then((response) => {
          return response.text();
        })
        .then((state) => {
          const parsedState = JSON.parse(state);


          if (parsedState.errors) {
            this.displayErrors(line, parsedState.errors);
            this.form?.classList.remove('cart-disabled');
            return;
          }

          this.renderContents(parsedState, false, true);

          this.form?.classList.remove('cart-disabled');
        });
    }
    removeProductEvent() {
      let removes = this.querySelectorAll('.remove');

      removes.forEach((remove) => {
        remove.addEventListener('click', (event) => {
          this.updateQuantity(event.target.dataset.index, '0');

          event.preventDefault();
        });
      });
    }
    renderContents(parsedState, line, refresh) {
      this.getSectionsToRender().forEach((section => {
        const elementToReplace = document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);

        if (refresh) {
          if (parsedState[section.section]) {
            elementToReplace.innerHTML = this.getSectionInnerHTML(parsedState[section.section], section.selector);
          }
        } else {
          elementToReplace.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
        }
        this.removeProductEvent();
        this.setupEventListeners();

        if (line && this.form?.querySelector(`#CartItem-${line}`)) {
          this.form.querySelector(`#CartItem-${line}`).classList.remove('loading');
        }
      }));
    }
  }
  customElements.define('theme-cart', ThemeCart);
}