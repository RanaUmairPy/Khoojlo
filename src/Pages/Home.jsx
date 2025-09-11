import React, { useEffect, useState } from 'react';
import { ArrowRight, Star, Zap, Shield, Truck, Gift, Eye, Heart, Search, ShoppingBag, Menu } from 'lucide-react';
import { addToCart as addToLocalCart } from '../utils/cart';
import { apiFetch, API_BASE } from '../base_api';

const Home = ({ addToCart }) => {
  const [latestProducts, setLatestProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  
  useEffect(() => {
    apiFetch('/v2/show/latest/')
      .then((data) => setLatestProducts(data))
      .catch((err) => console.error('Error fetching latest products:', err));

    apiFetch('/v2/show/all/')
      .then((data) => setAllProducts(data))
      .catch((err) => console.error('Error fetching all products:', err));
  }, []);

  const handleAddToCart = (product) => {
    // store in session only (no login required)
    addToLocalCart(product, 1);
    // notify parent if provided
    if (addToCart) addToCart(product);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Banner - Compact */}
      <section className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-800 dark:via-blue-800 dark:to-purple-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
        <div className="relative w-full mx-2 px-1 py-2 md:py-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Left Content */}
            <div className="text-white space-y-2">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                <Zap size={12} className="mr-1" />
                New Collection
              </div>
              <h1 className="text-2xl md:text-4xl font-bold leading-tight">
                Shop Smart,
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Live Better
                </span>
              </h1>
              <p className="text-blue-100 text-sm md:text-base max-w-md">
                Discover premium products at amazing prices. Free shipping on orders over RS-500.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex gap-3">
                <button className="bg-white text-slate-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2 text-sm">
                  <ShoppingBag size={16} />
                  Shop Now
                </button>
                <button className="border border-white/30 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/10 transition-colors duration-200 text-sm">
                  View Deals
                </button>
              </div>
              
              {/* Quick Features */}
              <div className="flex gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-blue-100">
                  <Truck size={14} />
                  Free Shipping
                </div>
                <div className="flex items-center gap-1.5 text-xs text-blue-100">
                  <Shield size={14} />
                  Secure Pay
                </div>
                <div className="flex items-center gap-1.5 text-xs text-blue-100">
                  <Gift size={14} />
                  Gift Cards
                </div>
              </div>
            </div>

            {/* Right Side - Featured Products Stack */}
            <div className="hidden mx-auto lg:block">
              <div className="space-y-2">
                {latestProducts.slice(0, 3).map((product, index) => (
                  <div
                    key={product.id}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
                    style={{ 
                      transform: `translateX(${index * 4}px)`,
                      zIndex: 3 - index 
                    }}
                  >
                    <div className="relative overflow-hidden rounded-lg flex-shrink-0">
                      <img
                        src={`${API_BASE}${product.images[0]?.images}`}
                        alt={product.name}
                        className="w-12 h-12 object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-xs leading-tight line-clamp-1 mb-0.5">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star size={8} fill="currentColor" className="text-yellow-400" />
                          <span className="text-xs text-blue-100">4.8</span>
                        </div>
                        <span className="text-sm font-bold text-white">${product.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-4 right-10 w-8 h-8 bg-yellow-300/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-4 left-10 w-6 h-6 bg-pink-300/20 rounded-full"></div>
      </section>

      {/* Latest Products Section */}
      <section className="w-full mx-2 px-1 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Latest Arrivals</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Fresh picks just for you</p>
          </div>
          <button className="flex items-center gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
            View All
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Mobile: Horizontal Scroll, Desktop: Grid */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-4">
          {latestProducts.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-36 sm:w-full bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
            >
              {/* Product Images */}
              <div className="relative w-full h-24 sm:h-32 overflow-hidden rounded-t-lg">
                {product.images.map((img, index) => (
                  <img
                    key={index}
                    src={`${API_BASE}${img.images}`}
                    alt={product.name}
                    className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-500 ${
                      index === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-110 group-hover:opacity-100 group-hover:scale-100'
                    }`}
                    loading="lazy"
                  />
                ))}
                
                {/* Quick Action Buttons - Show on all screens */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-1">
                    <button className="bg-white/90 p-1 rounded-full hover:bg-white transition-colors">
                      <Eye size={10} className="text-slate-700" />
                    </button>
                    <button className="bg-white/90 p-1 rounded-full hover:bg-white transition-colors">
                      <Heart size={10} className="text-slate-700" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-2 space-y-1">
                <h3 className="font-medium text-slate-900 dark:text-white text-xs leading-tight line-clamp-2 text-left">{product.name}</h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={10} fill="currentColor" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{product.rating || 4.8}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">${product.price}</span>
                </div>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-colors duration-200"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-colors duration-200"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* New Badge */}
              <div className="absolute top-1.5 left-1.5 bg-green-500 dark:bg-green-400 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                NEW
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All Products Section */}
      <section className="bg-white dark:bg-slate-800 py-8">
        <div className="w-full mx-2 px-1">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">All Products</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Explore our complete collection of premium products
            </p>
          </div>

          {/* Mobile: 2-column Grid, Desktop: Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-4">
            {allProducts.map((product) => (
              <div
                key={product.id}
                className="w-full bg-slate-50 dark:bg-slate-700 rounded-lg shadow hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
              >
                {/* Product Images */}
                <div className="relative w-full h-24 sm:h-32 overflow-hidden rounded-t-lg">
                  {product.images.map((img, index) => (
                    <img
                      key={index}
                      src={`${API_BASE}${img.images}`}
                      alt={product.name}
                      className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-500 ${
                        index === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100'
                      }`}
                      loading="lazy"
                    />
                  ))}
                
                  {/* Quick Action Buttons - Show on all screens */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-1">
                      <button className="bg-white/90 p-1 rounded-full hover:bg-white transition-colors">
                        <Eye size={10} className="text-slate-700" />
                      </button>
                      <button className="bg-white/90 p-1 rounded-full hover:bg-white transition-colors">
                        <Heart size={10} className="text-slate-700" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-2 space-y-1">
                  <h3 className="font-medium text-slate-900 dark:text-white text-xs leading-tight line-clamp-2 text-left">{product.name}</h3>
                  
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={8} fill={i < 4 ? "currentColor" : "none"} />
                    ))}
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 ml-1">
                      ({Math.floor(Math.random() * 500) + 100})
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-sm font-black text-slate-900 dark:text-white">${product.price}</span>
                      <div className="text-xs text-slate-500 dark:text-slate-400 line-through">
                        ${(parseFloat(product.price) * 1.3).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-colors duration-200"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-colors duration-200"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>

                {/* Sale Badge */}
                <div className="absolute top-1.5 right-1.5 bg-red-500 dark:bg-red-400 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                  -30%
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;