(() => {
  "use strict";
  const STORAGE_KEY = "shopping_cart";
  // Prices are sourced from the package cards; LocalStorage stores IDs and quantities only.
  const PACKAGES = {
    "trial-15": {
      id: "trial-15",
      name: "الباقة التجريبية",
      duration: "15 يوم",
      price: 350,
    },
    "month-30": {
      id: "month-30",
      name: "باقة الشهر",
      duration: "30 يوم",
      price: 620,
    },
    "months-2": {
      id: "months-2",
      name: "باقة الشهرين",
      duration: "60 يوم",
      price: 1100,
    },
    "family-90": {
      id: "family-90",
      name: "الباقة العائلية",
      duration: "90 يوم",
      price: 1550,
    },
  };
  const money = (value) =>
    `${new Intl.NumberFormat("ar-EG").format(value)} ج.م`;
  const readCart = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(raw)) return [];
      return raw
        .filter(
          (x) =>
            x &&
            PACKAGES[x.id] &&
            Number.isSafeInteger(x.quantity) &&
            x.quantity > 0 &&
            x.quantity <= 99,
        )
        .map((x) => ({ id: x.id, quantity: x.quantity }));
    } catch {
      return [];
    }
  };
  let cart = readCart();
  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {}
  };
  const count = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = () =>
    cart.reduce(
      (sum, item) => sum + PACKAGES[item.id].price * item.quantity,
      0,
    );
  const badge = document.getElementById("cartBadge");
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  const itemsEl = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  const toastEl = document.getElementById("orderToast");
  const toastText = document.getElementById("toastText");
  const showToast = (message) => {
    if (!toastEl || !window.bootstrap) return;
    toastText.textContent = message;
    bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 2600 }).show();
  };
  function render() {
    if (badge) {
      badge.textContent = count();
      badge.hidden = count() === 0;
    }
    if (!itemsEl) return;
    if (!cart.length) {
      itemsEl.innerHTML = `<div class="cart-empty"><i class="bi bi-bag-x"></i><h3>عربتك فارغة</h3><p>لسه ما ضفتش أي باقة للسلة.</p><a class="btn btn-soft" href="index.html#packages" id="emptyCartShop">تصفح الباقات</a></div>`;
      document.getElementById("cartFooter").hidden = true;
    } else {
      document.getElementById("cartFooter").hidden = false;
      itemsEl.innerHTML = cart
        .map((item) => {
          const p = PACKAGES[item.id];
          return `<article class="cart-item" data-id="${p.id}">
          <div class="cart-item-icon"><i class="bi bi-box-seam"></i></div>
          <div class="cart-item-info"><h3>${p.name}</h3><small>${p.duration} · ${money(p.price)}</small>
            <div class="quantity-control"><button type="button" data-action="decrease" aria-label="تقليل الكمية">−</button><span>${item.quantity}</span><button type="button" data-action="increase" aria-label="زيادة الكمية">+</button></div>
          </div>
          <div class="cart-item-side"><strong>${money(p.price * item.quantity)}</strong><button class="remove-item" type="button" data-action="remove"><i class="bi bi-trash"></i><span>حذف</span></button></div>
        </article>`;
        })
        .join("");
    }
    if (totalEl) totalEl.textContent = money(total());
  }
  function openCart() {
    if (!drawer) return;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    overlay.hidden = false;
    document.body.classList.add("cart-locked");
    document
      .getElementById("cartToggle")
      ?.setAttribute("aria-expanded", "true");
    document.getElementById("cartClose")?.focus();
  }
  function closeCart() {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    overlay.hidden = true;
    document.body.classList.remove("cart-locked");
    document
      .getElementById("cartToggle")
      ?.setAttribute("aria-expanded", "false");
  }
  function persistAndRender() {
    save();
    render();
  }
  function addToCart(id) {
    if (!PACKAGES[id]) return;
    const found = cart.find((x) => x.id === id);
    if (found) found.quantity = Math.min(99, found.quantity + 1);
    else cart.push({ id, quantity: 1 });
    persistAndRender();
    showToast(`تمت إضافة ${PACKAGES[id].name} إلى السلة`);
    openCart();
  }
  document.addEventListener("click", (event) => {
    const add = event.target.closest(".order-package[data-package-id]");
    if (add) {
      event.preventDefault();
      addToCart(add.dataset.packageId);
      return;
    }
    if (event.target.closest("#cartToggle")) {
      openCart();
      return;
    }
    if (event.target.closest("#cartClose") || event.target === overlay) {
      closeCart();
      return;
    }
    const action = event.target.closest("[data-action]");
    if (action && action.closest(".cart-item")) {
      const id = action.closest(".cart-item").dataset.id;
      const item = cart.find((x) => x.id === id);
      if (!item) return;
      if (action.dataset.action === "increase")
        item.quantity = Math.min(99, item.quantity + 1);
      if (action.dataset.action === "decrease")
        item.quantity = Math.max(1, item.quantity - 1);
      if (action.dataset.action === "remove")
        cart = cart.filter((x) => x.id !== id);
      persistAndRender();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && drawer?.classList.contains("is-open"))
      closeCart();
  });
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      cart = readCart();
      render();
    }
  });
  save();
  render();
  window.StoreCart = {
    getItems: () =>
      cart.map((x) => ({ ...PACKAGES[x.id], quantity: x.quantity })),
    getTotal: total,
    formatMoney: money,
  };
})();
