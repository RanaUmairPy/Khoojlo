import React, { useEffect, useState } from 'react';
import { Trash2, MinusCircle, PlusCircle } from 'lucide-react';
import { getCart, updateQuantity, removeFromCart, CART_KEY } from '../utils/cart';
import { API_BASE } from '../base_api';
const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const stored = getCart();
    // normalize quantities to numbers and ensure image is full URL
    const normalized = stored.map((it) => ({
      ...it,
      id: String(it.id),
      quantity: Number(it.quantity) || 0,
      price: Number(it.price) || 0,
      image: it.image
        ? (String(it.image).startsWith('http') ? it.image : `${API_BASE}${it.image}`)
        : ''
    }));
    console.log('Loaded cart from storage:', normalized);
    setCartItems(normalized);
    // listen for external cart updates
    const onUpdate = () => {
      const latest = getCart();
      setCartItems(latest.map((it) => ({
        ...it,
        id: String(it.id),
        quantity: Number(it.quantity) || 0,
        price: Number(it.price) || 0,
        image: it.image
          ? (String(it.image).startsWith('http') ? it.image : `${API_BASE}${it.image}`)
          : ''
      })));
    };
    window.addEventListener('cartUpdated', onUpdate);
    // also listen to storage events (other tabs)
    const onStorage = (e) => {
      if (e.key === CART_KEY) onUpdate();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('cartUpdated', onUpdate);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const inc = (id) => {
    const latest = getCart();
    const item = latest.find((i) => String(i.id) === String(id));
    if (!item) return;
    const updated = updateQuantity(id, (Number(item.quantity || 0) + 1));
    setCartItems(updated.map((it) => ({ ...it, quantity: Number(it.quantity) })));
  };

  const dec = (id) => {
    const latest = getCart();
    const item = latest.find((i) => String(i.id) === String(id));
    if (!item) return;
    const newQty = Number(item.quantity || 0) - 1;
    const updated = newQty > 0 ? updateQuantity(id, newQty) : removeFromCart(id);
    setCartItems(updated.map((it) => ({ ...it, quantity: Number(it.quantity) })));
  };

  const remove = (id) => {
    const updated = removeFromCart(id);
    setCartItems(updated.map((it) => ({ ...it, quantity: Number(it.quantity) })));
  };

  const subtotal = cartItems.reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 0), 0);
  const shipping = cartItems.length > 0 ? 9.99 : 0;
  const total = subtotal + shipping;

  return (
    <div className="w-full mx-0 px-2 py-8">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-grow">
          {cartItems.length === 0 && <div className="text-gray-600">Your cart is empty.</div>}
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 mb-4 bg-white rounded-lg shadow-sm">
              <img src={item.image || `${API_BASE}/static/default-product.png`} alt={item.name} className="w-24 h-24 object-cover rounded-md" />
              <div className="flex-grow">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-gray-600">${Number(item.price).toFixed(2)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => dec(item.id)} className="p-1"><MinusCircle size={20} /></button>
                  <span>{Number(item.quantity)}</span>
                  <button onClick={() => inc(item.id)} className="p-1"><PlusCircle size={20} /></button>
                  <button onClick={() => remove(item.id)} className="ml-auto text-red-500"><Trash2 size={20} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Summary */}
        <div className="w-full lg:w-80">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Rs{shipping.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>Rs{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <button className="w-full bg-red-600 text-white py-3 rounded-lg mt-6 hover:bg-red-700 transition-colors">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;