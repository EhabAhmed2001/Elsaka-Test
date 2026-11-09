(() => {
  "use strict";
  const packages = {
    "trial-15": {name:"الباقة التجريبية", duration:"15 يوم", price:350},
    "month-30": {name:"باقة الشهر", duration:"30 يوم", price:620},
    "months-2": {name:"باقة الشهرين", duration:"60 يوم", price:1100},
    "family-90": {name:"الباقة العائلية", duration:"90 يوم", price:1550}
  };
  const id = new URLSearchParams(location.search).get("package") || "trial-15";
  const selected = packages[id] || packages["trial-15"];
  const money = n => `${new Intl.NumberFormat("ar-EG").format(n)} ج.م`;
  // document.getElementById("selectedPackage").textContent = `${selected.name} · ${selected.duration}`;
  document.getElementById("productPrice").textContent = money(selected.price);
  document.getElementById("detailsOrder").href = `checkout.html?package=${encodeURIComponent(id)}`;

  // Replace these three local image paths with the real product photos.
  const images = ["assets/product-1.svg", "assets/product-2.svg", "assets/product-3.svg"];
  const image = document.getElementById("galleryImage");
  const dots = document.getElementById("galleryDots");
  let current = 0;

  images.forEach((src, index) => {
    const dot = document.createElement("button");
    dot.type = "button"; 
    dot.className = `gallery-dot${index === 0 ? " active" : ""}`;
    dot.setAttribute("aria-label", `عرض الصورة ${index + 1}`);
    dot.addEventListener("click", () => show(index)); dots.appendChild(dot);
  });

  function show(index) {
    current = (index + images.length) % images.length;
    image.src = images[current];
    dots.querySelectorAll("button").forEach((dot, i) => dot.classList.toggle("active", i === current));
  }

  document.getElementById("galleryPrev").addEventListener("click", () => show(current - 1));
  document.getElementById("galleryNext").addEventListener("click", () => show(current + 1));
  let timer = window.setInterval(() => show(current + 1), 4500);
  const gallery = document.querySelector(".product-gallery");
  gallery.addEventListener("mouseenter", () => window.clearInterval(timer));
  gallery.addEventListener("mouseleave", () => { window.clearInterval(timer); timer = window.setInterval(() => show(current + 1), 4500); });
})();
