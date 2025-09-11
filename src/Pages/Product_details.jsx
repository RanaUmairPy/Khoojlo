import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft } from 'lucide-react';
import { API_BASE, apiFetch } from '../base_api';
import { addToCart as addToLocalCart } from '../utils/cart';

const CART_STORAGE_KEY = 'react_cart';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainIndex, setMainIndex] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    const cacheKey = `product_${id}`;
    // try local cache first for instant UI
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setProduct(JSON.parse(cached));
        setLoading(false);
      }
    } catch (e) {
      console.warn('product cache read failed', e);
    }

    setLoading(true);
    apiFetch(`/v2/products/details/${id}/`)
      .then((data) => {
        setProduct(data);
        setMainIndex(0);
        try { localStorage.setItem(cacheKey, JSON.stringify(data || {})); } catch (e) {}
      })
      .catch((err) => {
        console.error('Product fetch error', err);
        setError('Failed to load product');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // when mainIndex changes, mark image as not loaded to animate on load
  useEffect(() => {
    setImgLoaded(false);
  }, [mainIndex]);

  const persistCartItem = (item, qty = 1) => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      const idStr = String(item.id);
      const existing = arr.find((i) => String(i.id) === idStr);
      if (existing) {
        existing.quantity = Number(existing.quantity || 0) + qty;
        existing.image = existing.image || item.image || '';
        existing.price = Number(item.price || existing.price || 0);
        existing.name = existing.name || item.name;
      } else {
        arr.push({
          id: idStr,
          name: item.name,
          price: Number(item.price) || 0,
          quantity: qty,
          image: item.image || ''
        });
      }
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(arr));
      try { window.dispatchEvent(new CustomEvent('cartUpdated')); } catch (e) {}
    } catch (e) {
      console.warn('persistCartItem error', e);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    // normalize item for local cart
    const firstImage = product.images?.[0]?.images || '';
    const cartItem = {
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      image: firstImage ? `${API_BASE}${firstImage}` : '',
    };
    addToLocalCart(cartItem, 1);
    persistCartItem(cartItem, 1);
    try { window.dispatchEvent(new CustomEvent('cartUpdated')); } catch (e) {}
    // feedback
    // optionally replace alert with nicer toast
    alert('Added to cart');
  };

  if (loading) return <div className="p-6">Loading product…</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!product) return <div className="p-6">Product not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-5xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow p-6 flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2">
          <button onClick={() => navigate(-1)} className="mb-4 text-sm text-gray-600 hover:underline flex items-center gap-2">
            <ArrowLeft size={14} /> Back
          </button>

          <div className="bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden relative">
            <img
              key={mainIndex} // ensure re-render logic for onLoad
              src={`${API_BASE}${product.images?.[mainIndex]?.images || ''}`}
              alt={product.name}
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-80 object-cover transition-opacity duration-400 ease-in-out ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
            {/* subtle overlay/indicator */}
            <div className="absolute bottom-2 left-2 bg-black/30 px-2 py-1 rounded text-white text-xs">Image {mainIndex + 1}/{product.images?.length || 1}</div>
          </div>

          {product.images && product.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {product.images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setMainIndex(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border transition-transform duration-150 ${idx === mainIndex ? 'border-blue-500 scale-105' : 'border-transparent hover:scale-105'}`}
                >
                  <img src={`${API_BASE}${img.images}`} alt={`${product.name}-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="md:w-1/2 flex flex-col">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{product.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{product.category}</p>

          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < 4 ? 'currentColor' : 'none'} />)}
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-300">4.8</span>
          </div>

          <div className="mt-4 text-lg font-extrabold text-slate-900 dark:text-white">${product.price}</div>

          <div className="mt-4 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {product.description}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Add to Cart
            </button>
            <button
              onClick={() => { handleAddToCart(); navigate('/checkout'); }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Buy Now
            </button>
          </div>

          <div className="mt-auto text-xs text-slate-500 dark:text-slate-400 pt-4">
            Product ID: {product.id}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
