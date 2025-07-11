/**
 *  @class
 *  @function Predictive Search
 */
if (!customElements.get('search-form')) {
  class SearchForm extends HTMLElement {
    constructor() {
      super();

    }
    connectedCallback() {
      this.form = this.querySelector('form');
      this.input = this.querySelector('input[type="search"]');
      this.predictiveSearchResults = this.querySelector('.thb-predictive-search');
      this.cc = this.querySelector('.searchform--click-capture');

      this.setupEventListeners();

    }
    setupEventListeners() {
      this.form.addEventListener('submit', this.onFormSubmit.bind(this));
      this.predictiveSearchResults.addEventListener('focusout', this.close.bind(this));

      this.input.addEventListener('input', debounce((event) => {
        this.onChange(event);
      }, 300).bind(this));

      this.cc.addEventListener('click', this.close.bind(this));

      document.addEventListener('keyup', (e) => {
        if (e.code) {
          if (e.code.toUpperCase() === 'ESCAPE') {
            this.close();
          }
        }
      });
      this.input.addEventListener('focus', this.open.bind(this));
    }

    getQuery() {
      return this.input.value.trim();
    }

    onChange() {
      const searchTerm = this.getQuery();

      if (!searchTerm.length) {
        document.body.classList.remove('open-search');
        this.predictiveSearchResults.setAttribute('inert', '');
        return;
      }
      document.body.classList.add('open-search');
      this.predictiveSearchResults.removeAttribute('inert');
      this.getSearchResults(searchTerm);
    }

    onFormSubmit(event) {
      if (!this.getQuery().length) {
        event.preventDefault();
      }
    }

    onFocus() {
      const searchTerm = this.getQuery();

      if (!searchTerm.length) {
        return;
      }

      this.getSearchResults(searchTerm);
    }

    getSearchResults(searchTerm) {

      this.predictiveSearchResults.classList.add('loading');

      fetch(`${theme.routes.predictive_search_url}?q=${encodeURIComponent(searchTerm)}&${encodeURIComponent('resources[type]')}=product,article,query,collection&${encodeURIComponent('resources[limit]')}=10&section_id=predictive-search`)
        .then((response) => {
          this.predictiveSearchResults.classList.remove('loading');
          if (!response.ok) {
            var error = new Error(response.status);
            throw error;
          }

          return response.text();
        })
        .then((text) => {
          const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector('#shopify-section-predictive-search').innerHTML;

          this.renderSearchResults(resultsMarkup);
        })
        .catch((error) => {
          throw error;
        });
    }

    renderSearchResults(resultsMarkup) {
      this.predictiveSearchResults.innerHTML = resultsMarkup;

      let submitButton = this.querySelector('#search-results-submit');

      submitButton.addEventListener('click', () => {
        this.form.submit();
      });
    }

    close() {
      this.predictiveSearchResults.setAttribute('inert', '');
      document.body.classList.remove('open-search');
    }
    open() {
      document.body.classList.add('open-search');
      this.predictiveSearchResults.removeAttribute('inert');
    }
  }
  customElements.define('search-form', SearchForm);
}