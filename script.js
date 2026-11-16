// RCF Furniture catalogue interactions
// Replace this with the business WhatsApp number, digits only, with country code.
// The contact number supplied for RCF is prefilled below.
const RCF_WHATSAPP = "919084535529";
let activeCategory = "All";
let cart = JSON.parse(localStorage.getItem("rcfEnquiryCart") || "[]");
const categories = ["All", ...new Set((window.RCF_PRODUCTS || []).map(p => p.category))];
const $ = id => document.getElementById(id);

function sendWhatsApp(message) {
  if (!/^\d{10,15}$/.test(RCF_WHATSAPP)) {
    alert("Please set a valid WhatsApp number in script.js.");
    return;
  }
  window.open("https://wa.me/" + RCF_WHATSAPP + "?text=" + encodeURIComponent(message), "_blank", "noopener");
}
function renderFilters() {
  $("filters").innerHTML = categories.map(c => `<button class="filter ${c === activeCategory ? "active" : ""}" data-category="${c}">${c}</button>`).join("");
  document.querySelectorAll(".filter").forEach(b => b.addEventListener("click", () => {
    activeCategory = b.dataset.category; renderFilters(); renderProducts();
  }));
}
function renderProducts() {
  let q = $("searchInput").value.trim().toLowerCase();
  let list = (window.RCF_PRODUCTS || []).filter(p =>
    (activeCategory === "All" || p.category === activeCategory) &&
    (p.name + " " + p.category + " " + p.description + " " + p.id).toLowerCase().includes(q)
  );
  if ($("sortSelect").value === "az") list.sort((a,b) => a.name.localeCompare(b.name));
  $("productGrid").innerHTML = list.length ? list.map(p => `
    <article class="product-card">
      <div class="product-image-wrap"><img class="product-image" src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://placehold.co/700x820/e9e6de/343832?text=RCF+Furniture'"><span class="product-tag">${p.tag || "RCF Collection"}</span></div>
      <div class="product-info"><span class="product-category">${p.category}</span><h3 class="product-name">${p.name}</h3><span class="product-code">${p.id}</span><div class="product-bottom"><span class="price-enquiry">Price on enquiry</span><button class="text-btn" data-detail="${p.id}">View details ↗</button></div></div>
    </article>`).join("") : `<div class="empty-state">No matching furniture found. Try another search or category.</div>`;
  document.querySelectorAll("[data-detail]").forEach(b => b.addEventListener("click", () => showProduct(b.dataset.detail)));
}
function saveCart() {
  localStorage.setItem("rcfEnquiryCart", JSON.stringify(cart));
  $("cartCount").textContent = cart.reduce((n,x) => n + x.qty, 0);
}
function addToCart(id) {
  const found = cart.find(x => x.id === id);
  if (found) found.qty++; else cart.push({id, qty:1});
  saveCart(); renderCart(); openCart();
}
function updateQty(id, delta) {
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(x => x.id !== id);
  saveCart(); renderCart();
}
function renderCart() {
  const host = $("cartItems");
  if (!cart.length) { host.innerHTML = `<div class="empty-cart">Your enquiry cart is empty.<br>Add products from the collection.</div>`; return; }
  host.innerHTML = cart.map(item => {
    const p = window.RCF_PRODUCTS.find(x => x.id === item.id);
    if (!p) return "";
    return `<div class="cart-row"><img src="${p.image}" alt=""><div><strong>${p.name}</strong><small>${p.id} · Price on enquiry</small><div class="qty-controls"><button data-minus="${p.id}">−</button><span>${item.qty}</span><button data-plus="${p.id}">+</button></div></div><button class="remove-item" data-remove="${p.id}">Remove</button></div>`;
  }).join("");
  document.querySelectorAll("[data-minus]").forEach(b => b.addEventListener("click", () => updateQty(b.dataset.minus,-1)));
  document.querySelectorAll("[data-plus]").forEach(b => b.addEventListener("click", () => updateQty(b.dataset.plus,1)));
  document.querySelectorAll("[data-remove]").forEach(b => b.addEventListener("click", () => { cart=cart.filter(x=>x.id!==b.dataset.remove);saveCart();renderCart(); }));
}
function openCart(){ $("scrim").classList.add("show"); $("cartPanel").classList.add("show"); }
function closeCart(){ $("scrim").classList.remove("show"); $("cartPanel").classList.remove("show"); }
function showProduct(id) {
  const p = window.RCF_PRODUCTS.find(x => x.id === id); if (!p) return;
  $("modalImage").src = p.image; $("modalImage").alt = p.name;
  $("modalCategory").textContent = p.category + " · " + p.id;
  $("modalName").textContent = p.name; $("modalDescription").textContent = p.description;
  $("modalAdd").onclick = () => { $("productModal").classList.remove("show"); addToCart(id); };
  $("productModal").classList.add("show");
}
function sendCartEnquiry() {
  if (!cart.length) { alert("Please add at least one product to your enquiry cart."); return; }
  const buyer = $("buyerType").value;
  const lines = cart.map(x => { const p=window.RCF_PRODUCTS.find(z=>z.id===x.id); return `- ${p.name} (${p.id}) | Quantity: ${x.qty}`; });
  sendWhatsApp(`Hello RCF Furniture,\nI am enquiring as: ${buyer}.\n\nPlease share price, dimensions, available finishes and delivery/wholesale details for:\n${lines.join("\n")}\n\nName:\nCity:\nThank you.`);
}
document.querySelectorAll("[data-wa]").forEach(b => b.addEventListener("click", () => sendWhatsApp(b.dataset.wa)));
$("searchInput").addEventListener("input", renderProducts);
$("sortSelect").addEventListener("change", renderProducts);
$("openCart").addEventListener("click", openCart);
$("closeCart").addEventListener("click", closeCart);
$("scrim").addEventListener("click", closeCart);
$("sendCart").addEventListener("click", sendCartEnquiry);
$("closeModal").addEventListener("click", () => $("productModal").classList.remove("show"));
$("productModal").addEventListener("click", e => { if (e.target === $("productModal")) $("productModal").classList.remove("show"); });
$("menuTrigger").addEventListener("click", () => {
  const nav = document.querySelector(".desktop-nav");
  const isOpen = nav.style.display === "flex";
  nav.style.cssText = isOpen ? "" : "display:flex;position:absolute;top:65px;left:0;right:0;background:#fbfaf7;padding:22px 6%;flex-direction:column;gap:18px;border-bottom:1px solid #dedbd3";
});
$("year").textContent = new Date().getFullYear();
renderFilters(); renderProducts(); saveCart(); renderCart();
