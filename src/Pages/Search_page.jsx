import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star, Eye, Heart, Check } from 'lucide-react';
import { apiFetch, API_BASE, MEDIA_BASE } from '../base_api';
import { addToCart as addToLocalCart, getCart } from '../utils/cart';
import { createProductUrl } from '../utils/slug';

const ProductSkeleton = () => (
  <div className="w-full bg-slate-50 dark:bg-slate-700 rounded-lg shadow transition-all duration-300 group relative overflow-hidden animate-pulse" style={{ minHeight: '8rem' }} />
);

const SearchPage = ({ addToCart, isDarkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState(new Set());

  useEffect(() => {
    const updateCartState = () => {
      const cart = getCart();
      setCartItems(new Set(cart.map(item => String(item.id))));
    };
    updateCartState();
    window.addEventListener('cartUpdated', updateCartState);
    return () => window.removeEventListener('cartUpdated', updateCartState);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    apiFetch(`/v2/products/search/${encodeURIComponent(query)}/`)
      .then((data) => {
        setSearchResults(data || []);
      })
      .catch((err) => {
        console.error('Error fetching search results:', err);
        setSearchResults([]);
      })
      .finally(() => setLoading(false));
  }, [query]);

  const handleAddToCart = (product) => {
    const firstImage = product.images?.[0]?.images || '';
    const cartItem = {
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      image: firstImage
        ? (firstImage.startsWith('http') ? firstImage : `${MEDIA_BASE}${firstImage.startsWith('/') ? '' : '/'}${firstImage}`)
        : '',
    };
    addToLocalCart(cartItem, 1);
    if (addToCart) addToCart(product);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'} py-8`}>
      <div className="w-full mx-2 px-1">
        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Search Results for "{query}"
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-4">
            {[...Array(12)].map((_, i) => <ProductSkeleton key={`s-${i}`} />)}
          </div>
        ) : searchResults.length === 0 ? (
          <p className={`text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No results found for "{query}"
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-4">
            {searchResults.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(createProductUrl(product.id, product.name))}
                className={`w-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'} rounded-lg shadow hover:shadow-lg transition-all duration-300 group relative overflow-hidden cursor-pointer`}
              >
                <div className="relative w-full h-24 sm:h-32 overflow-hidden rounded-t-lg">
                  {(product.images || []).map((img, idx) => (
                    <img
                      key={idx}
                      src={img.images.startsWith('http') ? img.images : `${MEDIA_BASE}${img.images.startsWith('/') ? '' : '/'}${img.images}`}
                      alt={product.name}
                      className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-300 ${idx === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100'}`}
                      loading="lazy"
                    />
                  ))}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); /* maybe show quick view */ }}
                        className="bg-white/90 p-1 rounded-full hover:bg-white transition-colors"
                      >
                        <Eye size={10} className="text-slate-700" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); /* maybe wishlist */ }}
                        className="bg-white/90 p-1 rounded-full hover:bg-white transition-colors"
                      >
                        <Heart size={10} className="text-slate-700" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  <h3 className={`font-medium text-xs leading-tight line-clamp-2 text-left ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {product.rating && (
                        <>
                          <Star size={10} fill="currentColor" />
                          <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {product.rating}
                          </span>
                        </>
                      )}
                    </div>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      ${product.price}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                      className={`flex-1 flex items-center justify-center gap-1 text-white py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-colors duration-200 ${cartItems.has(String(product.id))
                        ? 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                        : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                        }`}
                    >
                      {cartItems.has(String(product.id)) ? <><Check size={12} /> Added</> : 'Add to Cart'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(product); navigate(createProductUrl(product.id, product.name)); }}
                      className={`flex-1 bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-colors duration-200`}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;