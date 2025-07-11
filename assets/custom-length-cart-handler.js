/**
 * Custom Length Cart Handler
 * Updates cart prices for custom length products
 */

(function () {
  // Cache for price data
  const priceDataCache = {};

  // Initialize after DOM is ready
  document.addEventListener("DOMContentLoaded", initCustomLengthHandler);

  // Function to initialize the custom length handler
  function initCustomLengthHandler() {
    // Run initially
    setTimeout(handleCustomLengthPricing, 300);

    // Set up event listeners
    setupEventListeners();

    // Set up mutation observers
    setupMutationObservers();
  }

  // Set up event listeners for cart changes
  function setupEventListeners() {
    // Listen for cart refresh event
    document.addEventListener("cart:refresh", function () {
      setTimeout(handleCustomLengthPricing, 300);
    });

    // Listen for line item change events
    document.addEventListener("line-item:change:end", function () {
      setTimeout(handleCustomLengthPricing, 300);
    });

    // Listen for quantity changes
    document.addEventListener("click", function (e) {
      if (e.target.closest(".quantity button, .cart-update button")) {
        setTimeout(handleCustomLengthPricing, 300);
      }
    });

    // Listen for quantity input changes
    document.addEventListener("change", function (e) {
      if (e.target.matches(".qty")) {
        setTimeout(handleCustomLengthPricing, 300);
      }
    });
  }

  // Set up mutation observers for cart changes
  function setupMutationObservers() {
    // Observer for cart drawer opening
    const cartDrawer = document.querySelector(".cart-drawer");
    if (cartDrawer) {
      const observer = new MutationObserver(function (mutations) {
        for (const mutation of mutations) {
          if (
            mutation.attributeName === "inert" &&
            !cartDrawer.hasAttribute("inert")
          ) {
            // Cart drawer was opened
            setTimeout(handleCustomLengthPricing, 300);
          }
        }
      });

      observer.observe(cartDrawer, { attributes: true });
    }

    // Observer for cart content changes
    const cartContainers = [
      document.querySelector(".cart-drawer--content"),
      document.querySelector(".thb-cart-form--items"),
    ];

    cartContainers.forEach((container) => {
      if (container) {
        const contentObserver = new MutationObserver(function (mutations) {
          let shouldUpdate = false;

          for (const mutation of mutations) {
            if (
              mutation.type === "childList" ||
              (mutation.type === "attributes" &&
                mutation.target.classList.contains("cart-item"))
            ) {
              shouldUpdate = true;
              break;
            }
          }

          if (shouldUpdate) {
            setTimeout(handleCustomLengthPricing, 300);
          }
        });

        contentObserver.observe(container, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["class", "style"],
        });
      }
    });
  }

  // Main function to handle custom length pricing
  function handleCustomLengthPricing() {
    // Get all cart items
    const cartItems = document.querySelectorAll(
      ".cart-item, .product-cart-item"
    );
    if (!cartItems.length) return;

    let totalAdjustment = 0;
    const processedItems = new Set(); // To avoid processing the same item twice

    cartItems.forEach((item) => {
      // Get item key to avoid duplicate processing
      const itemKey = item.dataset.key;
      if (processedItems.has(itemKey)) return;
      processedItems.add(itemKey);

      // Check if this item has a custom length property
      const lengthPropertyElement = item.querySelector(
        '.cart-item__property-value[data-property="Length"]'
      );
      if (!lengthPropertyElement) return;

      // Get the length value
      const length = parseFloat(lengthPropertyElement.textContent.trim());
      if (isNaN(length)) return;

      // Get the product variant ID and handle
      const variantId = item.dataset.variantId;
      const productHandle = item.dataset.handle;
      if (!variantId || !productHandle) return;

      // Get price elements
      const priceElements = document.querySelectorAll(
        `[data-key="${itemKey}"] .cart-item__price, [data-key="${itemKey}"] .price, [data-key="${itemKey}"] .product-subtotal`
      );
      if (!priceElements.length) return;

      // Get quantity
      const quantityInput = item.querySelector("input.qty");
      const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

      // Get original price for adjustment calculation
      const originalPriceText = getPriceText(priceElements[0]);
      const originalPrice = parseMoney(originalPriceText);

      // Check cache first, then make AJAX call if needed
      if (priceDataCache[productHandle]) {
        updatePrices(
          priceDataCache[productHandle],
          length,
          quantity,
          priceElements,
          originalPrice
        );
      } else {
        // Fetch price data from the price-data template
        fetch(`/products/${productHandle}?view=price-data&variant=${variantId}`)
          .then((response) => response.text())
          .then((data) => {
            try {
              console.log(data)
              // Extract price data from the response
              const priceData = JSON.parse(data);

              // Cache the price data
              priceDataCache[productHandle] = priceData;

              // Update prices for this item
              updatePrices(
                priceData,
                length,
                quantity,
                priceElements,
                originalPrice
              );

              // Update cart totals after a short delay
              setTimeout(updateCartTotals, 100);
            } catch (e) {
              console.error("Error parsing price data:", e);
            }
          })
          .catch((error) => {
            console.error("Error fetching price data:", error);
          });
      }
    });

    // Update cart totals after all items have been processed
    setTimeout(updateCartTotals, 100);

    // Function to update prices for an item
    function updatePrices(
      priceData,
      length,
      quantity,
      priceElements,
      originalPrice
    ) {
      if (!priceData.price_per_meter) return;

      // Calculate the new price: price_per_meter * length * quantity
      const newPriceCents = Math.round(
        priceData.price_per_meter * 100 * length * quantity
      );
      const formattedPrice = formatMoney(newPriceCents);

      // Update all price elements for this item
      priceElements.forEach((element) => {
        // Check if the element has the specific structure with ins/del tags
        const insElement = element.querySelector("ins .amount");
        if (insElement) {
          insElement.innerHTML = formattedPrice;
        } else {
          // Otherwise update the whole price
          element.innerHTML = `<span class="price"><ins><span class="amount">${formattedPrice}</span></ins></span>`;
        }
      });

      // Calculate adjustment for the cart total
      totalAdjustment += newPriceCents - originalPrice;
    }
  }

  // Function to update cart totals
  function updateCartTotals() {
    // Calculate new total based on visible line items
    let newTotal = 0;

    // Get all price elements from cart items
    const priceElements = document.querySelectorAll(
      ".cart-item__price, .product-subtotal, .product-cart-item .price"
    );

    priceElements.forEach((element) => {
      const price = parseMoney(getPriceText(element));
      if (!isNaN(price)) {
        newTotal += price;
      }
    });

    // Update all subtotal elements
    const totalElements = document.querySelectorAll(
      ".totals__subtotal-value, .cart-drawer--discount .amount"
    );

    totalElements.forEach((element) => {
      element.innerHTML = formatMoney(newTotal);
    });
  }

  // Helper function to get the price text from a price element
  function getPriceText(element) {
    // First try to get the text from an ins/amount element
    const amountElement = element.querySelector("ins .amount");
    if (amountElement) {
      return amountElement.textContent.trim();
    }

    // Otherwise get the text from the element itself
    return element.textContent.trim();
  }

  // Helper function to parse money string to cents
  function parseMoney(moneyString) {
    // Remove currency symbols, commas, etc. and convert to cents
    const numericValue = moneyString.replace(/[^0-9.]/g, "");
    return Math.round(parseFloat(numericValue) * 100);
  }

  // Helper function to format money
  function formatMoney(cents) {
    if (typeof Shopify !== "undefined" && Shopify.formatMoney) {
      return Shopify.formatMoney(cents);
    }

    if (
      typeof theme !== "undefined" &&
      theme.Currency &&
      theme.Currency.formatMoney
    ) {
      return theme.Currency.formatMoney(
        cents,
        theme.moneyFormat || "${{amount}}"
      );
    }

    // Fallback formatting
    return +(cents / 100).toFixed(2);
  }
})();
