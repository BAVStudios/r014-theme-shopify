function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}
var dispatchCustomEvent = function dispatchCustomEvent(eventName) {
  var data =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var detail = {
    detail: data,
  };
  var event = new CustomEvent(eventName, data ? detail : null);
  document.dispatchEvent(event);
};
window.recentlyViewedIds = [];

if (!customElements.get("quantity-selector")) {
  class QuantityInput extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.input = this.querySelector(".qty");
      this.step = parseFloat(this.input.getAttribute("step")) || 1;
      this.changeEvent = new Event("change", { bubbles: true });

      // Create buttons
      this.subtract = this.querySelector(".minus");
      this.add = this.querySelector(".plus");

      // Add functionality to buttons
      this.subtract.addEventListener("click", () =>
        this.changeQuantity(-1 * this.step)
      );
      this.add.addEventListener("click", () =>
        this.changeQuantity(1 * this.step)
      );

      this.classList.add("buttons_added");
      this.validateQtyRules();
    }
    changeQuantity(change) {
      let quantity = parseInt(this.input.value) || 0;

      // Update quantity
      const newValue = Math.max(quantity + change, 1);

      // Check min and max values
      const min = parseInt(this.input.min) || 1;
      const max = parseInt(this.input.max) || Infinity;
      if (newValue < min || newValue > max) return;

      // Update input value
      this.input.value = newValue;

      // Dispatch change event
      this.input.dispatchEvent(this.changeEvent);

      // Update button states
      this.validateQtyRules();
    }

    validateQtyRules() {
      const value = parseInt(this.input.value) || 0;
      const min = parseInt(this.input.min) || 1;
      const max = parseInt(this.input.max) || Infinity;

      this.subtract.classList.toggle("disabled", value <= min);
      this.add.classList.toggle("disabled", value >= max);
    }
  }

  customElements.define("quantity-selector", QuantityInput);
}

/**
 *  @class
 *  @function ProductCard
 */
if (!customElements.get("product-card")) {
  class ProductCard extends HTMLElement {
    constructor() {
      super();
      this.swatches = this.querySelector(".product-card-swatches");
      this.image = this.querySelector(
        ".product-card-image-link .product-primary-image"
      );
      this.additional_images = this.querySelectorAll(
        ".product-secondary-image"
      );
      this.additional_images_nav = this.querySelectorAll(
        ".product-secondary-images-nav li"
      );
      this.quick_add = this.querySelector(
        ".product-card--add-to-cart-button-simple"
      );
    }
    connectedCallback() {
      if (this.swatches) {
        this.enableSwatches();
      }
      if (this.additional_images) {
        this.enableAdditionalImages();
      }
      if (this.quick_add) {
        this.enableQuickAdd();
      }
    }
    enableAdditionalImages() {
      let image_length = this.additional_images.length;
      let images = this.additional_images;
      let nav = this.additional_images_nav;
      let image_container = this.querySelector(".product-card-image");
      const mousemove = function (e) {
        let l = e.offsetX;
        let w = this.getBoundingClientRect().width;
        let prc = l / w;
        let sel = Math.floor(prc * image_length);
        let selimg = images[sel];
        images.forEach((image, index) => {
          if (image.classList.contains("hover")) {
            image.classList.remove("hover");
            if (nav.length) {
              nav[index].classList.remove("active");
            }
          }
        });
        if (selimg) {
          if (!selimg.classList.contains("hover")) {
            selimg.classList.add("hover");
            if (nav.length) {
              nav[sel].classList.add("active");
            }
          }
        }
      };
      const mouseleave = function (e) {
        images.forEach((image, index) => {
          image.classList.remove("hover");
          if (nav.length) {
            nav[index].classList.remove("active");
          }
        });
      };
      if (image_container) {
        image_container.addEventListener("touchstart", mousemove, {
          passive: true,
        });
        image_container.addEventListener("touchmove", mousemove, {
          passive: true,
        });
        image_container.addEventListener("touchend", mouseleave, {
          passive: true,
        });
        image_container.addEventListener("mouseenter", mousemove, {
          passive: true,
        });
        image_container.addEventListener("mousemove", mousemove, {
          passive: true,
        });
        image_container.addEventListener("mouseleave", mouseleave, {
          passive: true,
        });
      }

      window.addEventListener("load", () => {
        images.forEach(function (image) {
          lazySizes.loader.unveil(image);
        });
      });
    }
    enableSwatches() {
      let swatch_list = this.swatches.querySelectorAll(".product-card-swatch");
      this.color_index = this.swatches.dataset.index;
      this.org_srcset = this.image ? this.image.dataset.srcset : "";

      this.addEventListener("change", this.onSwatchChange.bind(this));

      swatch_list.forEach((swatch) => {
        window.addEventListener("load", () => {
          let image = new Image();
          image.srcset = swatch.dataset.srcset;
          lazySizes.loader.unveil(image);
        });
        swatch.addEventListener("click", this.onSwatchClick);
        swatch.addEventListener("mouseover", this.onSwatchHover);
      });
    }
    onSwatchClick() {
      window.location.href = this.dataset.href;
    }
    onSwatchHover() {
      let swatch_input = this.previousElementSibling;
      swatch_input.checked = true;
      swatch_input.dispatchEvent(new Event("change", { bubbles: true }));
    }
    onSwatchChange(evt) {
      if (this.image) {
        if (evt.target.dataset.srcset) {
          this.image.setAttribute("srcset", evt.target.dataset.srcset);
        } else {
          this.image.setAttribute("srcset", this.org_srcset);
        }
      }
    }
    enableQuickAdd() {
      this.quick_add.addEventListener("click", this.quickAdd.bind(this));
    }
    quickAdd(evt) {
      evt.preventDefault();
      if (this.quick_add.disabled) {
        return;
      }
      this.quick_add.classList.add("loading");
      this.quick_add.setAttribute("aria-disabled", true);

      const config = {
        method: "POST",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          Accept: "application/javascript",
        },
      };

      let formData = new FormData();

      formData.append("id", this.quick_add.dataset.productId);
      formData.append("quantity", 1);
      formData.append(
        "sections",
        this.getSectionsToRender().map((section) => section.section)
      );
      formData.append("sections_url", window.location.pathname);

      config.body = formData;

      fetch(`${theme.routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((response) => {
          if (response.status) {
            return;
          }
          this.renderContents(response);
          dispatchCustomEvent("cart:item-added", {
            product: response.hasOwnProperty("items")
              ? response.items[0]
              : response,
          });
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          this.quick_add.classList.remove("loading");
          this.quick_add.removeAttribute("aria-disabled");
        });

      return false;
    }
    getSectionsToRender() {
      return [
        {
          id: "Cart",
          section: "main-cart",
          selector: ".thb-cart-form",
        },
        {
          id: "Cart-Drawer",
          section: "cart-drawer",
          selector: ".cart-drawer",
        },
        {
          id: "cart-drawer-toggle",
          section: "cart-bubble",
          selector: ".thb-secondary-area--item-count",
        },
        {
          id: "cart-drawer-toggle",
          section: "cart-bubble",
          selector: ".thb-secondary-area--item-amount",
        },
      ];
    }
    renderContents(parsedState) {
      this.getSectionsToRender().forEach((section) => {
        if (!document.getElementById(section.id)) {
          return;
        }
        const elementToReplace =
          document.getElementById(section.id).querySelector(section.selector) ||
          document.getElementById(section.id);
        elementToReplace.innerHTML = this.getSectionInnerHTML(
          parsedState.sections[section.section],
          section.selector
        );
      });

      if (document.getElementById("Cart-Drawer")) {
        document.getElementById("Cart-Drawer").open();
        document.getElementById("Cart-Drawer").removeProductEvent();
      }
    }
    getSectionInnerHTML(html, selector = ".shopify-section") {
      return new DOMParser()
        .parseFromString(html, "text/html")
        .querySelector(selector)?.innerHTML;
    }
  }
  customElements.define("product-card", ProductCard);
}

/**
 *  @class
 *  @function PanelClose
 */
if (!customElements.get("side-panel-close")) {
  class PanelClose extends HTMLElement {
    constructor() {
      super();
      let cc = document.querySelector(".click-capture");

      // Add functionality to buttons
      this.addEventListener("click", (e) => this.close_panel(e));
      document.addEventListener("panel:close", (e) => {
        let panel = document.querySelectorAll(".side-panel.active");
        if (panel.length) {
          this.close_panel(e, panel[0]);
        }
      });
      cc.addEventListener("click", (e) => {
        let panel = document.querySelectorAll(".side-panel.active");
        if (panel) {
          this.close_panel(e, panel[0]);
        }
      });
    }

    close_panel(e, panel) {
      if (e) {
        e.preventDefault();
      }
      if (!panel) {
        panel = e?.target.closest(".side-panel");

        if (!panel) {
          return;
        }
      }
      panel.classList.remove("active");
      document.body.classList.remove("open-cc");
      panel.setAttribute("inert", "");
    }
  }
  customElements.define("side-panel-close", PanelClose);

  document.addEventListener("keyup", (e) => {
    if (e.code) {
      if (e.code.toUpperCase() === "ESCAPE") {
        dispatchCustomEvent("panel:close");
      }
    }
  });
}
/**
 *  @class
 *  @function CartDrawer
 */
if (!customElements.get("cart-drawer")) {
  class CartDrawer extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.isOpen = false;
      this.button = document.getElementById("cart-drawer-toggle");

      this.debouncedOnChange = debounce((event) => {
        this.onChange(event);
      }, 300);

      document.addEventListener("cart:refresh", (event) => {
        this.refresh();
      });

      this.addEventListener("change", this.debouncedOnChange.bind(this));

      this.removeProductEvent();

      document.addEventListener("click", this.onWindowClick.bind(this));

      // Add functionality to button
      this.button.addEventListener("click", (e) => {
        e.preventDefault();
        this.isOpen ? this.close() : this.open();
      });

      document.addEventListener("keyup", (e) => {
        if (e.code) {
          if (e.code.toUpperCase() === "ESCAPE") {
            this.close();
          }
        }
      });
    }

    onWindowClick(event) {
      if (
        !this.contains(event.target) &&
        this.isOpen &&
        !this.button.contains(event.target)
      ) {
        this.close();
      }
    }
    open() {
      this.removeAttribute("inert");
      this.focus();
      this.isOpen = true;
      dispatchCustomEvent("cart-drawer:open");
    }
    close() {
      this.setAttribute("inert", "");
      this.isOpen = false;
    }
    onChange(event) {
      if (event.target.classList.contains("qty")) {
        this.updateQuantity(event.target.dataset.index, event.target.value);
      }
    }
    removeProductEvent() {
      let removes = this.querySelectorAll(".remove");

      removes.forEach((remove) => {
        remove.addEventListener("click", (event) => {
          this.updateQuantity(event.target.dataset.index, "0");
          event.preventDefault();
        });
      });
    }
    getSectionsToRender() {
      return [
        {
          id: "Cart-Drawer",
          section: "cart-drawer",
          selector: ".cart-drawer--inner",
        },
        {
          id: "cart-drawer-toggle",
          section: "cart-bubble",
          selector: ".thb-secondary-area--item-count",
        },
        {
          id: "cart-drawer-toggle",
          section: "cart-bubble",
          selector: ".thb-secondary-area--item-amount",
        },
      ];
    }
    getSectionInnerHTML(html, selector) {
      return new DOMParser()
        .parseFromString(html, "text/html")
        .querySelector(selector)?.innerHTML;
    }
    updateQuantity(line, quantity) {
      this.querySelector(`#CartDrawerItem-${line}`)?.classList.add(
        "thb-loading"
      );
      const body = JSON.stringify({
        line,
        quantity,
        sections: this.getSectionsToRender().map((section) => section.section),
        sections_url: window.location.pathname,
      });

      dispatchCustomEvent("line-item:change:start", {
        quantity: quantity,
      });

      fetch(`${theme.routes.cart_change_url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: `application/json`,
        },
        ...{
          body,
        },
      })
        .then((response) => {
          return response.text();
        })
        .then((state) => {
          const parsedState = JSON.parse(state);

          this.getSectionsToRender().forEach((section) => {
            const elementToReplace =
              document
                .getElementById(section.id)
                .querySelector(section.selector) ||
              document.getElementById(section.id);

            if (parsedState.sections) {
              elementToReplace.innerHTML = this.getSectionInnerHTML(
                parsedState.sections[section.section],
                section.selector
              );
            }
          });

          this.removeProductEvent();
          dispatchCustomEvent("line-item:change:end", {
            quantity: quantity,
            cart: parsedState,
          });

          if (this.querySelector(`#CartDrawerItem-${line}`)) {
            this.querySelector(`#CartDrawerItem-${line}`).classList.remove(
              "thb-loading"
            );
          }
        });
    }
    refresh() {
      let sections = "cart-drawer,cart-bubble";
      fetch(`${window.location.pathname}?sections=${sections}`)
        .then((response) => {
          return response.text();
        })
        .then((state) => {
          const parsedState = JSON.parse(state);

          this.getSectionsToRender().forEach((section) => {
            const elementToReplace =
              document
                .getElementById(section.id)
                .querySelector(section.selector) ||
              document.getElementById(section.id);

            elementToReplace.innerHTML = this.getSectionInnerHTML(
              parsedState[section.section],
              section.selector
            );
          });

          this.removeProductEvent();
        });
    }
  }
  customElements.define("cart-drawer", CartDrawer);
}

/**
 *  @class
 *  @function LocalizationForm
 */
if (!customElements.get("localization-form")) {
  class LocalizationForm extends HTMLElement {
    constructor() {
      super();
      this.form = this.querySelector("form");
      this.inputs = this.form.querySelectorAll(
        '[name="locale_code"], [name="country_code"]'
      );
      this.debouncedOnSubmit = debounce((event) => {
        this.onSubmitHandler(event);
      }, 200);
      this.inputs.forEach((item) =>
        item.addEventListener("change", this.debouncedOnSubmit.bind(this))
      );
    }
    onSubmitHandler(event) {
      if (this.form) this.form.submit();
    }
  }
  customElements.define("localization-form", LocalizationForm);
}

/**
 *  @class
 *  @function ResizeSelect
 */
if (!customElements.get("resize-select")) {
  class ResizeSelect extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.select = this.querySelector("select");
      this.addEventListeners();
    }
    addEventListeners() {
      this.addEventListener("change", this.resizeSelect.bind(this));
      window.addEventListener("load", this.resizeSelect.bind(this));
      this.resizeSelect();
    }
    resizeSelect() {
      let tempOption = document.createElement("option");
      tempOption.textContent = this.select.selectedOptions[0].textContent;

      let tempSelect = document.createElement("select"),
        offset = 10;
      tempSelect.style.visibility = "hidden";
      tempSelect.style.position = "fixed";
      tempSelect.appendChild(tempOption);
      this.after(tempSelect);
      if (tempSelect.clientWidth > 0) {
        this.select.style.width = `${+tempSelect.clientWidth + offset}px`;
      }
      tempSelect.remove();
    }
  }
  customElements.define("resize-select", ResizeSelect);
}

/**
 *  @class
 *  @function QuickView
 */
if (!customElements.get("quick-view")) {
  class QuickView extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.drawer = document.getElementById("Product-Modal");
      this.body = document.body;

      this.addEventListener("click", this.setupEventListener.bind(this));
      this.addEventListener("keypress", this.setupEventListener.bind(this));
    }
    setupEventListener(e) {
      if (e.key && e.key !== "Enter") {
        return;
      }
      e.preventDefault();
      let productHandle = this.dataset.productHandle,
        href = `${theme.routes.root_url}/products/${productHandle}?view=quick-view`;

      // remove double `/` in case shop might have /en or language in URL
      href = href.replace("//", "/");
      if (!href || !productHandle) {
        return;
      }
      if (this.classList.contains("loading")) {
        return;
      }
      this.classList.add("loading");
      fetch(href, {
        method: "GET",
      })
        .then((response) => {
          this.classList.remove("loading");
          return response.text();
        })
        .then((text) => {
          const sectionInnerHTML = new DOMParser()
            .parseFromString(text, "text/html")
            .querySelector("#Product-Modal-Content").innerHTML;
          this.renderQuickview(sectionInnerHTML, href, productHandle);
        });
    }
    renderQuickview(sectionInnerHTML, href, productHandle) {
      if (sectionInnerHTML) {
        this.drawer.querySelector("#Product-Modal-Content").innerHTML =
          sectionInnerHTML;

        let js_files = this.drawer
          .querySelector("#Product-Modal-Content")
          .querySelectorAll("script");

        if (js_files.length > 0) {
          var head = document.getElementsByTagName("head")[0];
          js_files.forEach((js_file, i) => {
            let script = document.createElement("script");
            script.src = js_file.src;
            head.appendChild(script);
          });
        }

        setTimeout(() => {
          if (Shopify && Shopify.PaymentButton) {
            Shopify.PaymentButton.init();
          }
          if (window.ProductModel) {
            window.ProductModel.loadShopifyXR();
          }
        }, 300);

        this.drawer.setAttribute("open", "");
        this.drawer.querySelector(".product-modal__toggle").focus();

        setTimeout(() => {
          let slider = this.drawer.querySelector("#Product-Slider");

          slider.reInit();
          window.dispatchEvent(new Event("resize"));
        }, 100);

        dispatchCustomEvent("quick-view:open", {
          productUrl: href,
          productHandle: productHandle,
        });
        addIdToRecentlyViewed(productHandle);
      }
    }
  }
  customElements.define("quick-view", QuickView);
}

/**
 *  @class
 *  @function ThemeScroll
 */
if (!customElements.get("theme-scroll")) {
  class ThemeScroll extends HTMLElement {
    constructor() {
      super();

      this.viewport = this.querySelector(".theme-scroll--inner");
      this.slideWidth = 274;
      this.slidesToScroll = 1;
    }
    connectedCallback() {
      window.OverlayScrollbarsGlobal.OverlayScrollbars(
        {
          target: this,
          elements: {
            viewport: this.viewport,
          },
        },
        {}
      );

      this.init();
    }
    init() {
      this.setSlides();
      this.reachedEnd = 0;

      if (this.slides.length < 1) {
        return;
      }
      this.nav = this.querySelector(".theme-scroll-nav");
      this.navPrev = this.querySelector(".flickity-prev");
      this.navNext = this.querySelector(".flickity-next");
      this.resizeObserver = new ResizeObserver(
        (entries) => {
          this.slideWidth =
            this.slides[1].offsetLeft - this.slides[0].offsetLeft;
          this.reachedEnd =
            this.viewport.scrollWidth - this.viewport.offsetWidth ==
            this.viewport.scrollLeft;
          this.onNavDisabled();
        },
        {
          root: this,
        }
      );
      this.debouncedOnScroll = debounce((event) => {
        this.onScroll(event);
      }, 100);

      this.setListeners();
      this.centerArrows();
    }
    setSlides() {
      this.slides = this.querySelectorAll(".carousel__slide");
      this.slidesLength = this.slides.length;
      this.lastSlide = this.slides[this.slides.length - 1];
    }
    setListeners() {
      this.nav.addEventListener("click", this.onNavClick.bind(this));
      this.viewport.addEventListener(
        "scroll",
        this.debouncedOnScroll.bind(this)
      );
      this.viewport.addEventListener(
        "resize",
        this.debouncedOnScroll.bind(this)
      );
      this.resizeObserver.observe(this.slides[0]);
    }
    onScroll() {
      this.reachedEnd =
        this.viewport.scrollWidth - this.viewport.offsetWidth ==
        Math.floor(this.viewport.scrollLeft);
      this.onNavDisabled();
    }
    onNavClick(e) {
      if (!e.target.matches(".flickity-nav")) {
        return;
      }
      if (e.target.name === "next") {
        this.scrollPos =
          this.viewport.scrollLeft + this.slidesToScroll * this.slideWidth;
      } else if (e.target.name === "prev") {
        this.scrollPos =
          this.viewport.scrollLeft - this.slidesToScroll * this.slideWidth;
      }
      this.viewport.scrollTo({
        left: this.scrollPos,
        behavior: "smooth",
      });
    }
    onNavDisabled() {
      if (this.navPrev) {
        this.navPrev.disabled = this.viewport.scrollLeft === 0 ? 1 : 0;
      }
      if (this.navNext) {
        this.navNext.disabled = this.reachedEnd ? 1 : 0;
      }
    }
    centerArrows() {
      let first_cell = this.slides[0],
        max_height = 0,
        image_height = 0;
      if (first_cell.querySelector(".product-card-image")) {
        image_height = first_cell.querySelector(
          ".product-card-image"
        ).clientHeight;
      } else if (first_cell.querySelector(".gallery--item")) {
        image_height = this.slides[1].querySelector(
          ".product-card-image"
        ).clientHeight;
      }
      if (image_height > 0) {
        this.slides.forEach((item, i) => {
          if (item.clientHeight > max_height) {
            max_height = item.clientHeight;
          }
        });

        if (max_height > image_height) {
          let difference = (max_height - image_height) / -2;

          this.navPrev.style.transform = "translateY(" + difference + "px)";
          this.navNext.style.transform = "translateY(" + difference + "px)";
        }
      }
    }
  }
  customElements.define("theme-scroll", ThemeScroll);
}

/**
 *  @class
 *  @function CollapsibleRow
 */
if (!customElements.get("collapsible-row")) {
  // https://css-tricks.com/how-to-animate-the-details-element/
  class CollapsibleRow extends HTMLElement {
    constructor() {
      super();

      this.details = this.querySelector("details");
      this.summary = this.querySelector("summary");
      this.content = this.querySelector(".collapsible__content");
      this.collapsed_mobile = this.classList.contains(
        "accordion--collapsed-mobile"
      );

      // Store the animation object (so we can cancel it if needed)
      this.animation = null;
      // Store if the element is closing
      this.isClosing = false;
      // Store if the element is expanding
      this.isExpanding = false;
    }
    connectedCallback() {
      this.setListeners();
    }
    setListeners() {
      if (this.initialized) {
        return;
      }
      this.querySelector("summary").addEventListener("click", (e) =>
        this.onClick(e)
      );

      this.initialized = true;
      if (this.collapsed_mobile) {
        window.addEventListener("resize", () => {
          this.details.open = window.innerWidth > 768;
        });
        window.dispatchEvent(new Event("resize"));
      }
    }
    onClick(e) {
      // Stop default behaviour from the browser
      e.preventDefault();
      // Add an overflow on the <details> to avoid content overflowing
      this.details.style.overflow = "hidden";

      // Check if the element is being closed or is already closed
      if (this.isClosing || !this.details.open) {
        this.open();
        // Check if the element is being openned or is already open
      } else if (this.isExpanding || this.details.open) {
        this.shrink();
      }
    }
    shrink() {
      // Set the element as "being closed"
      this.isClosing = true;

      // Store the current height of the element
      const startHeight = `${this.details.offsetHeight}px`;
      // Calculate the height of the summary
      const endHeight = `${this.summary.offsetHeight}px`;

      // If there is already an animation running
      if (this.animation) {
        // Cancel the current animation
        this.animation.cancel();
      }

      // Start a WAAPI animation
      this.animation = this.details.animate(
        {
          // Set the keyframes from the startHeight to endHeight
          height: [startHeight, endHeight],
        },
        {
          duration: 250,
          easing: "ease",
        }
      );

      // When the animation is complete, call onAnimationFinish()
      this.animation.onfinish = () => this.onAnimationFinish(false);
      // If the animation is cancelled, isClosing variable is set to false
      this.animation.oncancel = () => (this.isClosing = false);
    }

    open() {
      // Apply a fixed height on the element
      this.details.style.height = `${this.details.offsetHeight}px`;
      // Force the [open] attribute on the details element
      this.details.open = true;
      // Wait for the next frame to call the expand function
      window.requestAnimationFrame(() => this.expand());
    }

    expand() {
      // Set the element as "being expanding"
      this.isExpanding = true;
      // Get the current fixed height of the element
      const startHeight = `${this.details.offsetHeight}px`;
      // Calculate the open height of the element (summary height + content height)
      const endHeight = `${
        this.summary.offsetHeight + this.content.offsetHeight
      }px`;

      // If there is already an animation running
      if (this.animation) {
        // Cancel the current animation
        this.animation.cancel();
      }

      // Start a WAAPI animation
      this.animation = this.details.animate(
        {
          // Set the keyframes from the startHeight to endHeight
          height: [startHeight, endHeight],
        },
        {
          duration: 250,
          easing: "ease-out",
        }
      );
      // When the animation is complete, call onAnimationFinish()
      this.animation.onfinish = () => this.onAnimationFinish(true);
      // If the animation is cancelled, isExpanding variable is set to false
      this.animation.oncancel = () => (this.isExpanding = false);
    }

    onAnimationFinish(open) {
      // Set the open attribute based on the parameter
      this.details.open = open;
      // Clear the stored animation
      this.animation = null;
      // Reset isClosing & isExpanding
      this.isClosing = false;
      this.isExpanding = false;
      // Remove the overflow hidden and the fixed height
      this.details.style.height = this.details.style.overflow = "";

      this.dispatchEvent(new Event("animationend", { bubbles: false }));
    }
  }
  customElements.define("collapsible-row", CollapsibleRow);
}

/**
 *  @function addIdToRecentlyViewed
 */
function addIdToRecentlyViewed(handle) {
  if (!handle) {
    let product = document.querySelector(".thb-product-detail");

    if (product) {
      handle = product.dataset.handle;
    }
  }
  if (!handle) {
    return;
  }
  if (window.localStorage) {
    let recentIds = window.localStorage.getItem("recently-viewed");
    if (recentIds && typeof recentIds !== undefined) {
      window.recentlyViewedIds = JSON.parse(recentIds);
    }
  }
  // Remove current product if already in recently viewed array
  var i = window.recentlyViewedIds.indexOf(handle);

  if (i > -1) {
    window.recentlyViewedIds.splice(i, 1);
  }

  // Add id to array
  window.recentlyViewedIds.unshift(handle);

  if (window.localStorage) {
    window.localStorage.setItem(
      "recently-viewed",
      JSON.stringify(window.recentlyViewedIds)
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  let scrollbarWidth = window.innerWidth - document.body.clientWidth;
  document.documentElement.style.setProperty(
    "--scrollbar-width",
    scrollbarWidth + "px"
  );
});

document.addEventListener('DOMContentLoaded', function() {
  // Map gallery heading to dropdown value (update as needed)
  const storeMap = {
    "GEELONG": "#template--24939128848665__1652081672ff9b3c2c-pin_w4D8wD",
    "MELTON": "#template--24939128848665__1652081672ff9b3c2c-pin_bkrQM3",
    "CAROLINE SPRINGS": "#template--24939128848665__1652081672ff9b3c2c-pin_TpJjDC",
    "BALLARAT": "#template--24939128848665__1652081672ff9b3c2c-pin_qfbk39",
    "TAYLORS LAKES": "#template--24939128848665__1652081672ff9b3c2c-pin_pBxGEi"
  };

  document.querySelectorAll('.gallery__item').forEach(function(item) {
    item.addEventListener('click', function() {
      const heading = item.querySelector('.gallery__item-content-heading');
      if (!heading) return;
      let storeName = heading.textContent.trim().toUpperCase();
      // Remove ' (OPENING SOON)' or similar from the end
      storeName = storeName.replace(/\s*\(OPENING SOON\)$/, '');
      const value = storeMap[storeName];
      if (!value) {
        console.log('No map pin found for store:', storeName);
        return;
      }
      const select = document.querySelector('.google-map--select');
      if (!select) {
        console.log('No .google-map--select found');
        return;
      }
      select.value = value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      // Scroll to the Google Maps section
      const mapSection = document.querySelector('.google-map, .google-map--select, .google-map--container');
      if (mapSection) {
        mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
