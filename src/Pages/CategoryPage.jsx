import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Eye, Heart } from 'lucide-react';
import { addToCart as addToLocalCart } from '../utils/cart';
import { API_BASE, apiFetch } from '../base_api';

const BATCH = 24;
const CART_STORAGE_KEY = 'react_cart';

const CategoryPage = ({ addToCart, isDarkMode }) => {
  const navigate = useNavigate();
  const { category } = useParams(); // Get category from URL
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // incremental loading
  const [displayCount, setDisplayCount] = useState(BATCH);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const fetchCategory = category || 'shoes'; // Fallback to 'shoes'
    const cacheKey = `category_${fetchCategory}`;

    // try cache first
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        setCategoryProducts(parsed);
        setDisplayCount(Math.min(BATCH, parsed.length));
        setLoading(false);
      }
    } catch (e) {
      console.warn('Failed to read category cache', e);
    }

    setLoading(true);
    apiFetch(`/v2/show/category/${fetchCategory}/`)
      .then((data) => {
        setCategoryProducts(data || []);
        setDisplayCount(Math.min(BATCH, (data || []).length));
        try { localStorage.setItem(cacheKey, JSON.stringify(data || [])); } catch (e) {}
      })
      .catch((err) => {
        console.error(`Error fetching ${fetchCategory} products:`, err);
        setError(err.message || String(err));
      })
      .finally(() => setLoading(false));
  }, [category]);

  // IntersectionObserver to load more items
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const sentinel = loadMoreRef.current;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setDisplayCount((prev) => Math.min((categoryProducts || []).length, prev + BATCH));
        }
      });
    }, { root: null, rootMargin: '200px', threshold: 0.1 });
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [categoryProducts]);

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

  const handleAddToCart = (product) => {
    // normalize item shape for local cart: id, name, price (number), image (full url)
    const firstImage = product.images?.[0]?.images || '';
    const cartItem = {
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      image: firstImage ? `${API_BASE}${firstImage}` : '',
    };
    addToLocalCart(cartItem, 1);
    persistCartItem(cartItem, 1);
    if (addToCart) addToCart(product);
    try { window.dispatchEvent(new CustomEvent('cartUpdated')); } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800">
      {/* Category Products Section */}
      <section className="bg-white dark:bg-slate-800 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2 capitalize">{(category || 'shoes') + ' Collection'}</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Discover our premium {(category || 'shoes')} products</p>
          </div>

          {error && (
            <div className="text-center text-red-500 dark:text-red-400 mb-4">Error: {error}</div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-4">
            {loading && (!categoryProducts || categoryProducts.length === 0) ? (
              // show skeletons
              [...Array(12)].map((_, i) => (
                <div key={`s-${i}`} className="w-full h-56 sm:h-72 bg-slate-50 dark:bg-slate-700 rounded-lg shadow transition-all duration-300 group relative overflow-hidden animate-pulse" />
              ))
            ) : (
              // render only visible slice
              (categoryProducts || []).slice(0, displayCount).map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="w-full h-56 sm:h-72 bg-slate-50 dark:bg-slate-700 rounded-lg shadow hover:shadow-lg transition-all duration-300 group relative overflow-hidden cursor-pointer"
                >
                  <div className="relative w-full h-24 sm:h-32 overflow-hidden rounded-t-lg">
                    {(product.images || []).map((img, index) => (
                      <img key={index} src={`${API_BASE}${img.images}`} alt={product.name} className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-500 ${index === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100'}`} loading="lazy" />
                    ))}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); /* quick view */ }} className="bg-white/90 p-1 rounded-full hover:bg-white transition-colors"><Eye size={10} className="text-slate-700" /></button>
                        <button onClick={(e) => { e.stopPropagation(); /* wishlist */ }} className="bg-white/90 p-1 rounded-full hover:bg-white transition-colors"><Heart size={10} className="text-slate-700" /></button>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 space-y-1 flex-1">
                    <h3 className="font-medium text-slate-900 dark:text-white text-xs leading-tight line-clamp-2 text-left">{product.name}</h3>
                    <div className="flex items-center gap-1 text-amber-500">{[...Array(5)].map((_, i) => (<Star key={i} size={8} fill={i < 4 ? 'currentColor' : 'none'} />))}
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 ml-1">({Math.floor(Math.random() * 500) + 100})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-sm font-black text-slate-900 dark:text-white">${product.price}</span>
                        <div className="text-xs text-slate-500 dark:text-slate-400 line-through">${(parseFloat(product.price) * 1.3).toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-colors duration-200"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-colors duration-200"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                  <div className="absolute top-1.5 right-1.5 bg-red-500 dark:bg-red-400 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">-30%</div>
                </div>
              ))
            )}
          </div>

          {/* sentinel for loading more */}
          <div ref={loadMoreRef} className="h-6 flex items-center justify-center mt-4">
            {displayCount < (categoryProducts || []).length && !loading && (
              <div className="text-sm text-gray-500">Loading more…</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoryPage;