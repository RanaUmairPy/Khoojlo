import React, { useEffect, useState, useRef } from 'react';
import { Star, Eye, Heart, ShoppingBag } from 'lucide-react';
import { addToCart as addToLocalCart } from '../utils/cart';
import { apiFetch, API_BASE, MEDIA_BASE } from '../base_api';
import { useNavigate } from 'react-router-dom';

const ProductSkeleton = () => (
  <div className="w-full bg-slate-50 dark:bg-slate-700 rounded-lg shadow transition-all duration-300 group relative overflow-hidden product-skeleton animate-pulse" style={{ minHeight: '8rem' }} />
);
const Products = ({ addToCart }) => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [allLoading, setAllLoading] = useState(true);
  const [error, setError] = useState(null); // Added for error handling
  const BATCH = 24;
  const [displayCount, setDisplayCount] = useState(BATCH);
  const loadMoreRef = useRef(null);

  // resolve image paths to absolute URLs (use MEDIA_BASE for relative paths)
  const resolveImage = (path) => {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return `${MEDIA_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  useEffect(() => {
    // Read cached data first for instant UI
    try {
      const cachedLatest = localStorage.getItem('home_latest_products'); // Use 'home_latest_products' for consistency
      if (cachedLatest) {
        const parsed = JSON.parse(cachedLatest);
        console.log('Loaded cached latest products:', parsed); // Debug log
        setAllProducts(parsed);
        setAllLoading(false);
      }
    } catch (e) {
      console.warn('Failed to read product cache:', e);
    }

    // Fetch latest products
    setAllLoading(true);
    apiFetch('/v2/show/latest/')
      .then((data) => {
        console.log('Fetched latest products:', data); // Debug log
        if (!data || !Array.isArray(data)) {
          throw new Error('Invalid data format from /v2/show/latest/');
        }
        setAllProducts(data);
        try {
          localStorage.setItem('home_latest_products', JSON.stringify(data));
        } catch (e) {
          console.warn('Failed to cache latest products:', e);
        }
        setDisplayCount(Math.min(BATCH, data.length));
        setError(null); // Clear any previous errors
      })
      .catch((err) => {
        console.error('Error fetching latest products:', err);
        setError(err.message || 'Failed to fetch products');
        setAllLoading(false); // Ensure loading state is cleared
      })
      .finally(() => setAllLoading(false));
  }, []);

  // IntersectionObserver for incremental loading
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const sentinel = loadMoreRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !allLoading) {
            setDisplayCount((prev) => Math.min(allProducts.length, prev + BATCH));
          }
        });
      },
      { root: null, rootMargin: '200px', threshold: 0.1 }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [allProducts, allLoading]);

  // Add product to cart
  const handleAddToCart = (product) => {
    const firstImage = product.images?.[0]?.images || '';
    const cartItem = {
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      image: firstImage ? resolveImage(firstImage) : '',
    };
    addToLocalCart(cartItem, 1);
    if (addToCart) addToCart(product);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .smooth-scroll {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }
        .product-skeleton {
          min-height: 8rem;
        }
      `}</style>

      <section className="w-full mx-0 px-3 sm:mx-2 sm:px-1">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">Latest Products</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Explore our newest collection of premium products</p>
        </div>

        {error && (
          <div className="text-center text-red-500 mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-4 smooth-scroll">
          {allLoading && (!allProducts || allProducts.length === 0) ? (
            [...Array(12)].map((_, i) => <ProductSkeleton key={`s-all-${i}`} />)
          ) : allProducts.length === 0 ? (
            <div className="col-span-full text-center text-slate-600 dark:text-slate-400">
              No products available at the moment.
            </div>
          ) : (
            allProducts.slice(0, displayCount).map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="w-full bg-slate-50 dark:bg-slate-700 rounded-lg shadow hover:shadow-lg transition-all duration-300 group relative overflow-hidden cursor-pointer"
              >
                <div className="relative w-full h-24 sm:h-32 overflow-hidden rounded-t-lg">
                  {(product.images || []).map((img, idx) => (
                    <img
                      key={idx}
                      src={resolveImage(img.images)}
                      alt={product.name}
                      className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-500 ${
                        idx === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100'
                      }`}
                      loading="lazy"
                      onError={() => console.error(`Failed to load image: ${resolveImage(img.images)}`)}
                    />
                  ))}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          /* Implement quick view */
                        }}
                        className="bg-white/90 p-1 rounded-full hover:bg-white transition-colors"
                      >
                        <Eye size={10} className="text-slate-700" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          /* Implement wishlist */
                        }}
                        className="bg-white/90 p-1 rounded-full hover:bg-white transition-colors"
                      >
                        <Heart size={10} className="text-slate-700" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  <h3 className="font-medium text-slate-900 dark:text-white text-xs leading-tight line-clamp-2 text-left">{product.name}</h3>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={8} fill={i < (product.rating || 4) ? 'currentColor' : 'none'} />
                    ))}
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 ml-1">({Math.floor(Math.random() * 500) + 100})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-sm font-black text-slate-900 dark:text-white">Rs{product.price}</span>
                      <div className="text-xs text-slate-500 dark:text-slate-400 line-through">Rs{(parseFloat(product.price) * 1.3).toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-colors duration-200"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product); // Update for Buy Now logic if needed
                      }}
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

        <div ref={loadMoreRef} className="h-6 flex items-center justify-center mt-4">
          {displayCount < allProducts.length && !allLoading && (
            <div className="text-sm text-gray-500">Loading more…</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Products;