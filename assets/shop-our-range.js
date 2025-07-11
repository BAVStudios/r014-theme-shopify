if (!customElements.get('shop-our-range')) {
  class ShopOurRange extends HTMLElement {
    constructor() {
      super();
      this.selects = this.querySelectorAll('.shop-our-range--select');
      this.placeholder_selects = this.querySelectorAll('.shop-our-range--hidden');
      this.button = this.querySelector('button');
      this.activeIndex = 0;
      this.parentIndex = 0;
      this.levels = parseInt(this.dataset.levels, 10) - 1;
    }

    connectedCallback() {
      this.spacer = this.closest('.section-shop-our-range').querySelector('.shop-our-range--range-spacer');
      this.spacer.style.height = '250px';
      this.setEventListeners();
    }
    setEventListeners() {
      this.debouncedOnResize = debounce((event) => {
        this.onResize(event);
      }, 100);
      this.addEventListener('resize', this.debouncedOnResize.bind(this));
      this.dispatchEvent(new Event('resize'));

      this.selects.forEach((select) => {
        select.addEventListener('change', this.onSelect.bind(this, select));
      });
      if (this.selects.length) {
        this.selects[0].dispatchEvent(new Event('change'));
      }
      this.button.addEventListener('click', this.onClick.bind(this));
    }
    onResize() {
      if (window.innerWidth < 769) {
        this.spacer.style.height = this.clientHeight + 'px';
      }
    }
    onSelect(select) {
      let option_index = select.selectedIndex,
        next_index = parseInt(select.dataset.index, 10);
      if (next_index == 1) {
        this.parentIndex = option_index;
      }
      if (this.selects[next_index]) {
        this.disableSelects(next_index);

        let next_select = this.selects[next_index],
          next_placeholder = this.placeholder_selects[next_index],
          options = next_select.querySelectorAll('option'),
          has_options = false;
        options.forEach((option) => {
          if (option.dataset.parentIndex && option.dataset.parentIndex != this.parentIndex && option.value != '') {
            next_placeholder.appendChild(option);
          } else if (option.dataset.index != option_index && option.value != '') {
            next_placeholder.appendChild(option);
          } else if (option.dataset.index == option_index) {
            has_options = true;
          }
        });
        if (has_options) {
          this.button.disabled = false;
          this.selects[next_index].disabled = false;
          this.activeIndex = next_index;
        } else {
          this.button.disabled = true;
        }
      }
    }
    disableSelects(next_index) {
      for (let i = 1; i < this.selects.length; i++) {
        if (this.selects[i] && i > next_index - 1) {
          this.selects[i].disabled = true;

          this.placeholder_selects[i].querySelectorAll('option').forEach((option) => {
            this.selects[i].appendChild(option);
          });

          this.selects[i].querySelectorAll('option')[0].selected = 'selected';
        }
      }
      this.activeIndex = 0;
    }
    onClick() {
      let activeSelect = this.selects[this.activeIndex];

      if (activeSelect.value) {
        window.location.href = activeSelect.value;
      }
    }
  }

  customElements.define('shop-our-range', ShopOurRange);
}