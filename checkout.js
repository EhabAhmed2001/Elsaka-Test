(() => {
  "use strict";

  const KEY = "shopping_cart";
  const MAX_QUANTITY = 99;
  const catalog = {
    "trial-15": { name: "الباقة التجريبية", duration: "15 يوم", price: 350 },
    "month-30": { name: "باقة الشهر", duration: "30 يوم", price: 620 },
    "months-2": { name: "باقة الشهرين", duration: "60 يوم", price: 1100 },
    "family-90": { name: "الباقة العائلية", duration: "90 يوم", price: 1550 }
  };

  const fallbackGovernorates = [
    ["cairo", "القاهرة"], ["giza", "الجيزة"], ["alexandria", "الإسكندرية"],
    ["dakahlia", "الدقهلية"], ["red-sea", "البحر الأحمر"], ["beheira", "البحيرة"],
    ["fayoum", "الفيوم"], ["gharbia", "الغربية"], ["ismailia", "الإسماعيلية"],
    ["monufia", "المنوفية"], ["minya", "المنيا"], ["qalyubia", "القليوبية"],
    ["new-valley", "الوادي الجديد"], ["suez", "السويس"], ["aswan", "أسوان"],
    ["assiut", "أسيوط"], ["beni-suef", "بني سويف"], ["port-said", "بورسعيد"],
    ["damietta", "دمياط"], ["sharqia", "الشرقية"], ["south-sinai", "جنوب سيناء"],
    ["kafr-el-sheikh", "كفر الشيخ"], ["matrouh", "مطروح"], ["luxor", "الأقصر"],
    ["qena", "قنا"], ["north-sinai", "شمال سيناء"], ["sohag", "سوهاج"]
  ].map(([id, name]) => ({ id, name, shippingCost: null }));

  const format = value => `${new Intl.NumberFormat("en-US").format(value)} ج.م`;
  const params = new URLSearchParams(location.search);
  const directId = params.get("package");
  const isDirectOrder = Boolean(directId && catalog[directId]);
  let cart = [];
  let shippingCost = 0;
  let shippingIsConfigured = false;

  if (isDirectOrder) {
    cart = [{ id: directId, quantity: 1 }];
  } else {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (Array.isArray(raw)) {
        cart = raw
          .filter(item => item && catalog[item.id] && Number.isSafeInteger(item.quantity) && item.quantity > 0)
          .map(item => ({ id: item.id, quantity: Math.min(MAX_QUANTITY, item.quantity) }));
      }
    } catch {
      cart = [];
    }
  }

  const summary = document.getElementById("checkoutSummary");
  const subtotalElement = document.getElementById("checkoutSubtotal");
  const shippingElement = document.getElementById("checkoutShipping");
  const totalElement = document.getElementById("checkoutTotal");
  const form = document.getElementById("checkoutForm");
  const notice = document.getElementById("checkoutNotice");
  const submitButton = form.querySelector('button[type="submit"]');
  const governorateSelect = document.getElementById("customerGovernorate");
  const shippingMessage = document.getElementById("shippingMessage");
  const shippingCostInput = document.getElementById("shippingCostInput");
  const firstNameInput = document.getElementById("customerFirstName");
  const lastNameInput = document.getElementById("customerLastName");
  const fullNameInput = document.getElementById("customerFullName");

  const subtotalAmount = () => cart.reduce(
    (sum, item) => sum + catalog[item.id].price * item.quantity,
    0
  );

  function syncFullName() {
    fullNameInput.value = `${firstNameInput.value.trim()} ${lastNameInput.value.trim()}`.trim();
  }

  function updateSubmitState() {
    submitButton.disabled = !cart.length || !shippingIsConfigured;
  }

  function renderTotals() {
    const subtotal = subtotalAmount();
    subtotalElement.textContent = format(subtotal);

    if (!governorateSelect.value) {
      shippingElement.textContent = "اختار المحافظة";
    } else if (!shippingIsConfigured) {
      shippingElement.textContent = "غير محدد";
    } else {
      shippingElement.textContent = format(shippingCost);
    }

    totalElement.textContent = format(subtotal + (shippingIsConfigured ? shippingCost : 0));
    shippingCostInput.value = shippingIsConfigured ? String(shippingCost) : "";
    updateSubmitState();
  }

  function saveCartIfNeeded() {
    if (isDirectOrder) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(cart));
    } catch {}
  }

  function render() {
    if (!cart.length) {
      summary.innerHTML = `<div class="checkout-empty"><i class="bi bi-bag-x"></i><p>سلتك فارغة. أضف باقة أولًا للمتابعة.</p><a class="btn btn-soft" href="index.html#packages">العودة للباقات</a></div>`;
    } else {
      summary.innerHTML = cart.map(item => {
        const product = catalog[item.id];
        return `<div class="checkout-line" data-item-id="${item.id}">
          <div class="checkout-line-info">
            <strong>${product.name}</strong>
            <small>${product.duration} · سعر الوحدة: ${format(product.price)}</small>
            <div class="checkout-quantity" aria-label="تحديد الكمية">
              <button type="button" data-qty-action="decrease" aria-label="تقليل كمية ${product.name}" ${item.quantity <= 1 ? "disabled" : ""}>−</button>
              <span aria-live="polite">${item.quantity}</span>
              <button type="button" data-qty-action="increase" aria-label="زيادة كمية ${product.name}" ${item.quantity >= MAX_QUANTITY ? "disabled" : ""}>+</button>
              <small>الكمية</small>
            </div>
          </div>
          <div class="checkout-line-price"><b>${format(product.price * item.quantity)}</b><small>إجمالي الصنف</small></div>
        </div>`;
      }).join("");

      // if (isDirectOrder && !summary.querySelector(".direct-order-note")) {
      //   summary.insertAdjacentHTML(
      //     "afterbegin",
      //     '<p class="direct-order-note">طلب مباشر — بدون إضافة المنتج إلى السلة.</p>'
      //   );
      // }
    }

    renderTotals();
  }

  function populateGovernorates(governorates) {
    governorateSelect.replaceChildren(new Option("اختار المحافظة", ""));

    governorates.forEach(governorate => {
      if (!governorate || typeof governorate.name !== "string") return;

      const option = document.createElement("option");
      const numericCost = Number(governorate.shippingCost);
      const hasValidCost = governorate.shippingCost !== null
        && governorate.shippingCost !== ""
        && Number.isFinite(numericCost)
        && numericCost >= 0;

      option.value = governorate.name;
      option.textContent = governorate.name;
      option.dataset.governorateId = governorate.id || "";
      option.dataset.shippingCost = hasValidCost ? String(numericCost) : "";
      governorateSelect.append(option);
    });

    governorateSelect.disabled = false;
    shippingMessage.classList.remove("is-error");
    shippingMessage.textContent = "اختار المحافظة لحساب مصاريف الشحن.";
  }

  async function loadGovernorates() {
    if (location.protocol === "file:") {
      populateGovernorates(fallbackGovernorates);
      return;
    }

    try {
      const response = await fetch("governorates.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load governorates");

      const governorates = await response.json();
      if (!Array.isArray(governorates)) throw new Error("Invalid governorates data");
      populateGovernorates(governorates);
    } catch {
      populateGovernorates(fallbackGovernorates);
    }
  }

  governorateSelect.addEventListener("change", () => {
    const selectedOption = governorateSelect.selectedOptions[0];
    const rawCost = selectedOption?.dataset.shippingCost ?? "";
    const numericCost = rawCost === "" ? Number.NaN : Number(rawCost);

    shippingIsConfigured = governorateSelect.value !== ""
      && Number.isFinite(numericCost)
      && numericCost >= 0;
    shippingCost = shippingIsConfigured ? numericCost : 0;

    shippingMessage.classList.remove("is-ready", "is-error");

    if (!governorateSelect.value) {
      governorateSelect.setCustomValidity("");
      shippingMessage.textContent = "اختار المحافظة لحساب مصاريف الشحن.";
    } else if (!shippingIsConfigured) {
      governorateSelect.setCustomValidity("سعر الشحن لهذه المحافظة لم يتم تحديده بعد.");
      shippingMessage.textContent = "سعر الشحن لهذه المحافظة لم يضفه صاحب الموقع بعد.";
      shippingMessage.classList.add("is-error");
    } else {
      governorateSelect.setCustomValidity("");
      shippingMessage.textContent = `مصاريف الشحن إلى ${governorateSelect.value}: ${format(shippingCost)}`;
      shippingMessage.classList.add("is-ready");
    }

    renderTotals();
  });

  summary.addEventListener("click", event => {
    const button = event.target.closest("[data-qty-action]");
    if (!button) return;

    const line = button.closest("[data-item-id]");
    const item = cart.find(entry => entry.id === line?.dataset.itemId);
    if (!item) return;

    if (button.dataset.qtyAction === "increase") {
      item.quantity = Math.min(MAX_QUANTITY, item.quantity + 1);
    }
    if (button.dataset.qtyAction === "decrease") {
      item.quantity = Math.max(1, item.quantity - 1);
    }

    saveCartIfNeeded();
    render();
  });

  form.addEventListener("input", event => {
    if (event.target === firstNameInput || event.target === lastNameInput) syncFullName();
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    syncFullName();

    if (!shippingIsConfigured && governorateSelect.value) {
      governorateSelect.setCustomValidity("سعر الشحن لهذه المحافظة لم يتم تحديده بعد.");
    }

    if (!cart.length || !form.reportValidity() || !shippingIsConfigured) return;

    notice.textContent = `تم التحقق من البيانات محليًا. إجمالي الطلب شامل الشحن: ${format(subtotalAmount() + shippingCost)}. سيتم تفعيل الإرسال عند ربط الـ Backend.`;
    notice.classList.add("notice-success");
  });

  render();
  loadGovernorates();
})();
