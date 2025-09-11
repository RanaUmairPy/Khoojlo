export const CART_KEY = 'react_cart';

const API_BASE = 'https://khoojlo-backend.onrender.com';

export function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // normalize entries
    return parsed.map((it) => ({
      id: it == null ? '' : String(it.id),
      name: it.name || '',
      price: Number(it.price) || 0,
      quantity: Number(it.quantity) || 0,
      image: it.image || ''
    }));
  } catch (e) {
    console.error('Failed to read cart from localStorage', e);
    return [];
  }
}

export function saveCart(cart) {
  try {
    // normalize before saving
    const normalized = (cart || []).map((it) => ({
      id: it == null ? '' : String(it.id),
      name: it.name || '',
      price: Number(it.price) || 0,
      quantity: Number(it.quantity) || 0,
      image: it.image || ''
    }));
    localStorage.setItem(CART_KEY, JSON.stringify(normalized));
    try {
      // emit a global event so other components (badge, header) can update
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: normalized }));
    } catch (e) {
      // ignore in non-browser environments
    }
  } catch (e) {
    console.error('Failed to save cart to localStorage', e);
  }
}

function normalizeId(id) {
  return id == null ? '' : String(id);
}

export function addToCart(product, quantity = 1) {
  const cart = getCart();
  const pid = normalizeId(product.id);
  const existing = cart.find((i) => normalizeId(i.id) === pid);
  const qtyToAdd = Number(quantity) || 1;

  if (existing) {
    existing.quantity = Number(existing.quantity || 0) + qtyToAdd;
    existing.quantity = Math.min(existing.quantity, 999);
  } else {
    // Resolve image: prefer product.image (already normalized by callers), else use product.images array.
    let image = '';
    if (product && product.image) {
      image = String(product.image);
    } else if (product && product.images && product.images[0] && product.images[0].images) {
      image = String(product.images[0].images);
    } else {
      image = '';
    }
    // Ensure full URL when possible
    if (image && !image.startsWith('http')) {
      // image may be a relative path like "/product_images/..."
      image = `${API_BASE}${image}`;
    }
    cart.push({
      id: pid,
      name: product.name,
      price: Number(product.price) || 0,
      quantity: qtyToAdd,
      image: image
    });
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(productId) {
  const pid = normalizeId(productId);
  const cart = getCart().filter((i) => normalizeId(i.id) !== pid);
  saveCart(cart);
  return cart;
}

export function updateQuantity(productId, quantity) {
  const pid = normalizeId(productId);
  const qty = Number(quantity) || 0;
  const cart = getCart();
  const item = cart.find((i) => normalizeId(i.id) === pid);
  if (item) {
    item.quantity = qty > 0 ? qty : 0;
  }
  const newCart = cart.filter((i) => Number(i.quantity) > 0);
  saveCart(newCart);
  return newCart;
}

export function clearCart() {
  saveCart([]);
}

export function getCartCount() {
  const cart = getCart();
  return cart.reduce((s, it) => s + Number(it.quantity || 0), 0);
}
