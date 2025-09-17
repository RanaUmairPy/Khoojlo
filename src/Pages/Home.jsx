import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight, Star, Zap, Shield, Truck, Gift, Eye, Heart, ShoppingBag } from 'lucide-react';
import { addToCart as addToLocalCart } from '../utils/cart';
import { apiFetch, API_BASE, MEDIA_BASE } from '../base_api';
import { useNavigate } from 'react-router-dom';

const ProductSkeleton = ({ compact }) => (
  <div className={`flex-shrink-0 ${compact ? 'w-36 sm:w-full' : 'w-full'} bg-white dark:bg-slate-800 rounded-lg shadow transition-all duration-300 group relative overflow-hidden product-skeleton animate-pulse`} />
);

const Home = ({ addToCart }) => {
  // resolve image URL: use absolute if provided, else prefix MEDIA_BASE
  const resolveImage = (path) => {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return `${MEDIA_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const navigate = useNavigate();
  const [latestProducts, setLatestProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [latestLoading, setLatestLoading] = useState(true);
  const [allLoading, setAllLoading] = useState(true);
  // incremental loading for All Products grid
  const BATCH = 24;
  const [displayCount, setDisplayCount] = useState(BATCH);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    // read cached data first for instant UI
    try {
      const cachedLatest = localStorage.getItem('home_latest_products');
      const cachedAll = localStorage.getItem('home_all_products');
      if (cachedLatest) {
        setLatestProducts(JSON.parse(cachedLatest));
        setLatestLoading(false);
      }
      if (cachedAll) {
        setAllProducts(JSON.parse(cachedAll));
        setAllLoading(false);
      }
    } catch (e) {
      console.warn('Failed to read product cache', e);
    }

    // fetch fresh latest
    setLatestLoading(true);
    apiFetch('/v2/show/latest/')
      .then((data) => {
        setLatestProducts(data || []);
        try { localStorage.setItem('home_latest_products', JSON.stringify(data || [])); } catch(e) {}
      })
      .catch((err) => console.error('Error fetching latest products:', err))
      .finally(() => setLatestLoading(false));

    // fetch fresh all
    setAllLoading(true);
    apiFetch('/v2/show/all/')
      .then((data) => {
        setAllProducts(data || []);
        try { localStorage.setItem('home_all_products', JSON.stringify(data || [])); } catch(e) {}
        // reset display count when new data arrives
        setDisplayCount(Math.min(BATCH, (data || []).length));
      })
      .catch((err) => console.error('Error fetching all products:', err))
      .finally(() => setAllLoading(false));
  }, []);

  // IntersectionObserver to load more items when sentinel is visible
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const sentinel = loadMoreRef.current;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setDisplayCount((prev) => Math.min((allProducts || []).length, prev + BATCH));
        }
      });
    }, { root: null, rootMargin: '200px', threshold: 0.1 });
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [allProducts]);

  // Add product to canonical cart via utils/cart.addToCart which saves and emits cartUpdated
  const handleAddToCart = (product) => {
    const firstImage = product.images?.[0]?.images || '';
    const cartItem = {
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      image: firstImage ? resolveImage(firstImage) : '',
    };
    addToLocalCart(cartItem, 1); // utils/saveCart already persists and emits cartUpdated
    if (addToCart) addToCart(product);
  };

  useEffect(() => {
    const seo = {
      title: 'Khoojlo — Shop Smart, Live Better',
      description: 'Discover premium products at amazing prices. Free shipping on orders over RS-500.',
      url: window.location.origin + '/',
      canonical: window.location.origin + '/'
    };
    if (window.setSEO) window.setSEO(seo);
    else {
      document.title = seo.title;
      // fallback canonical
      let canon = document.querySelector('link[rel="canonical"]');
      if (!canon) { canon = document.createElement('link'); canon.setAttribute('rel', 'canonical'); document.head.appendChild(canon); }
      canon.setAttribute('href', seo.canonical);
    }
    return () => {
      // keep site defaults; no aggressive cleanup
    };
  }, []);

  // Inject ItemList JSON-LD for latest products (helps crawlers understand list)
  useEffect(() => {
    if (!latestProducts || latestProducts.length === 0) return;
    const items = latestProducts.slice(0, 10).map((p, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "url": `${window.location.origin}/product/${p.id}`,
      "name": p.name
    }));
    const ld = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Latest Arrivals - Khoojlo",
      "itemListElement": items
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'home-itemlist-ld';
    script.text = JSON.stringify(ld);
    document.head.appendChild(script);
    return () => {
      const s = document.getElementById('home-itemlist-ld');
      if (s) s.remove();
    };
  }, [latestProducts]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <style>{`.smooth-scroll{scroll-behavior:smooth;-webkit-overflow-scrolling:touch}.product-skeleton{min-height:8rem}`}</style>

      {/* Hero */}
      <section className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-800 dark:via-blue-800 dark:to-purple-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        <div className="relative w-full mx-2 px-1 py-2 md:py-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="text-white space-y-2">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                <Zap size={12} className="mr-1" /> New Collection
              </div>
              <h1 className="text-2xl md:text-4xl font-bold leading-tight">
                Shop Smart,
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Live Better</span>
              </h1>
              <p className="text-blue-100 text-sm md:text-base max-w-md">Discover premium products at amazing prices. Free shipping on orders over RS-500.</p>

              <div className="flex gap-3">
                <button className="bg-white text-slate-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2 text-sm">
                  <ShoppingBag size={16} /> Shop Now
                </button>
                <button className="border border-white/30 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/10 transition-colors duration-200 text-sm">View Deals</button>
              </div>

              <div className="flex gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-blue-100"><Truck size={14} /> Free Shipping</div>
                <div className="flex items-center gap-1.5 text-xs text-blue-100"><Shield size={14} /> Secure Pay</div>
                <div className="flex items-center gap-1.5 text-xs text-blue-100"><Gift size={14} /> Gift Cards</div>
              </div>
            </div>

            <div className="hidden mx-auto lg:block">
              <div className="space-y-2">
                {(latestProducts || []).slice(0, 3).map((product, index) => (
                  <div key={product.id || index} className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 hover:bg-white/20 transition-all duration-300 flex items-center gap-2" style={{ transform: `translateX(${index * 4}px)`, zIndex: 3 - index }}>
                    <div className="relative overflow-hidden rounded-lg flex-shrink-0">
                      <img src={resolveImage(product.images?.[0]?.images || '')} alt={product.name} className="w-12 h-12 object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-xs leading-tight line-clamp-1 mb-0.5">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1"><Star size={8} fill="currentColor" className="text-yellow-400" /><span className="text-xs text-blue-100">4.8</span></div>
                        <span className="text-sm font-bold text-white">${product.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-10 w-8 h-8 bg-yellow-300/20 rounded-full animate-pulse" />
        <div className="absolute bottom-4 left-10 w-6 h-6 bg-pink-300/20 rounded-full" />
      </section>

      {/* Latest */}
      <section className="w-full mx-2 px-1 py-8">
        <div className="flex items-center justify-between mb-6">
          
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Latest Arrivals</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Fresh picks just for you</p>
          </div>
          <button
            onClick={() => navigate('/latest')}
            className="flex items-center gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
            aria-label="View all latest products"
          >
            View All <ArrowRight size={14} />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-4 smooth-scroll">
          {latestLoading && (!latestProducts || latestProducts.length === 0) ? (
            [...Array(6)].map((_, i) => <ProductSkeleton compact key={`s-${i}`} />)
          ) : (
            (latestProducts || []).map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="flex-shrink-0 w-36 sm:w-full bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 group relative overflow-hidden cursor-pointer"
              >
                <div className="relative w-full h-24 sm:h-32 overflow-hidden rounded-t-lg">
                  {(product.images || []).map((img, idx) => (
                    <img key={idx} src={resolveImage(img.images)} alt={product.name} className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-500 ${idx === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-110 group-hover:opacity-100 group-hover:scale-100'}`} loading="lazy" />
                  ))}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); /* maybe show quick view */ }} className="bg-white/90 p-1 rounded-full hover:bg-white transition-colors"><Eye size={10} className="text-slate-700" /></button>
                      <button onClick={(e) => { e.stopPropagation(); /* maybe wishlist */ }} className="bg-white/90 p-1 rounded-full hover:bg-white transition-colors"><Heart size={10} className="text-slate-700" /></button>
                    </div>
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  <h3 className="font-medium text-slate-900 dark:text-white text-xs leading-tight line-clamp-2 text-left">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500"><Star size={10} fill="currentColor" /><span className="text-xs font-medium text-slate-600 dark:text-slate-400">{product.rating || 4.8}</span></div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Rs{product.price}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-colors duration-200"
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

                <div className="absolute top-1.5 left-1.5 bg-green-500 dark:bg-green-400 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">NEW</div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* All Products */}
      <section id="all-products" className="bg-white dark:bg-slate-800 py-8">
        <div className="w-full mx-0 px-3 sm:mx-2 sm:px-1">
          <div className="text-center mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">All Products</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Explore our complete collection of premium products</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-4 smooth-scroll">
            {allLoading && (!allProducts || allProducts.length === 0) ? (
              [...Array(12)].map((_, i) => <div key={`s-all-${i}`} className="w-full bg-slate-50 dark:bg-slate-700 rounded-lg shadow transition-all duration-300 group relative overflow-hidden product-skeleton animate-pulse" />)
            ) : (
              // render only a slice for faster initial render
              (allProducts || []).slice(0, displayCount).map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="w-full bg-slate-50 dark:bg-slate-700 rounded-lg shadow hover:shadow-lg transition-all duration-300 group relative overflow-hidden cursor-pointer"
                >
                  <div className="relative w-full h-24 sm:h-32 overflow-hidden rounded-t-lg">
                    {(product.images || []).map((img, idx) => (
                      <img key={idx} src={resolveImage(img.images)} alt={product.name} className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-500 ${idx === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100'}`} loading="lazy" />
                    ))}
                  </div>

                  <div className="p-2 space-y-1">
                    <h3 className="font-medium text-slate-900 dark:text-white text-xs leading-tight line-clamp-2 text-left">{product.name}</h3>
                    <div className="flex items-center gap-1 text-amber-500">{[...Array(5)].map((_, i) => (<Star key={i} size={8} fill={i < 4 ? 'currentColor' : 'none'} />))}<span className="text-xs font-medium text-slate-600 dark:text-slate-400 ml-1">({Math.floor(Math.random() * 500) + 100})</span></div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-sm font-black text-slate-900 dark:text-white">Rs{product.price}</span>
                        <div className="text-xs text-slate-500 dark:text-slate-400 line-through">Rs{(parseFloat(product.price) * 1.3).toFixed(2)}</div>
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
          {/* sentinel to load more on scroll */}
          <div ref={loadMoreRef} className="h-6 flex items-center justify-center mt-4">
            {displayCount < (allProducts || []).length && !allLoading && (
              <div className="text-sm text-gray-500">Loading more…</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

