import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, Heart, Share2, ShoppingCart, Truck, Shield, RotateCcw, Plus, Minus, Check, AlertCircle } from 'lucide-react';
import { API_BASE, MEDIA_BASE, apiFetch } from '../base_api';
import { addToCart as addToLocalCart } from '../utils/cart';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainIndex, setMainIndex] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageError, setImageError] = useState(false);

  // resolve image paths to absolute URLs (use MEDIA_BASE for relative paths)
  const resolveImage = (path) => {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return `${MEDIA_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  useEffect(() => {
    if (!id) return;
    const cacheKey = `product_${id}`;
    
    // Try local cache first for instant UI
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const cachedProduct = JSON.parse(cached);
        setProduct(cachedProduct);
        setLoading(false);
      }
    } catch (e) {
      console.warn('product cache read failed', e);
    }

    // Fetch fresh data
    setLoading(true);
    apiFetch(`/v2/products/details/${id}/`)
      .then((data) => {
        setProduct(data);
        setMainIndex(0);
        setImageError(false);
        try { 
          localStorage.setItem(cacheKey, JSON.stringify(data || {})); 
        } catch (e) {
          console.warn('Failed to cache product data', e);
        }
      })
      .catch((err) => {
        console.error('Product fetch error', err);
        setError('Failed to load product details. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Reset image loading state when main index changes
  useEffect(() => {
    setImgLoaded(false);
    setImageError(false);
  }, [mainIndex]);

  // Handle wishlist from localStorage
  useEffect(() => {
    if (product?.id) {
      try {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setIsWishlisted(wishlist.includes(product.id));
      } catch (e) {
        console.warn('Failed to read wishlist', e);
      }
    }
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;

    const seoTitle = `${product.name} — Khoojlo`;
    const seoDescription = (product.description || '').slice(0, 160);
    const firstImage = product.images?.[0]?.images ? resolveImage(product.images[0].images) : undefined;
    const seoUrl = window.location.href;

    if (window.setSEO) {
      window.setSEO({
        title: seoTitle,
        description: seoDescription,
        url: seoUrl,
        image: firstImage,
        type: 'product',
        canonical: seoUrl
      });
    } else {
      // fallback minimal meta update
      const prevTitle = document.title;
      document.title = seoTitle;
      let canon = document.querySelector('link[rel="canonical"]');
      if (!canon) { canon = document.createElement('link'); canon.setAttribute('rel', 'canonical'); document.head.appendChild(canon); }
      canon.setAttribute('href', seoUrl);
      // leave prevTitle restoration to outer scope if desired
    }

    // Product JSON-LD
    const productLd = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "image": (product.images || []).map(i => resolveImage(i.images)).filter(Boolean),
      "description": product.description || '',
      "sku": product.id ? String(product.id) : undefined,
      "brand": product.brand || undefined,
      "offers": {
        "@type": "Offer",
        "url": seoUrl,
        "priceCurrency": "USD",
        "price": Number(product.price) || 0,
        "availability": "http://schema.org/InStock"
      }
    };
    if (product.rating) {
      productLd.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": product.rating,
        "reviewCount": product.reviews_count || 1
      };
    }
    const pScript = document.createElement('script');
    pScript.type = 'application/ld+json';
    pScript.id = `product-ld-${product.id}`;
    pScript.text = JSON.stringify(productLd);
    document.head.appendChild(pScript);

    // BreadcrumbList JSON-LD for product
    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": window.location.origin + "/" },
        { "@type": "ListItem", "position": 2, "name": product.category || 'Product', "item": window.location.origin + `/category/${encodeURIComponent(product.category || '')}` },
        { "@type": "ListItem", "position": 3, "name": product.name, "item": seoUrl }
      ]
    };
    const bScript = document.createElement('script');
    bScript.type = 'application/ld+json';
    bScript.id = `breadcrumb-ld-${product.id}`;
    bScript.text = JSON.stringify(breadcrumb);
    document.head.appendChild(bScript);

    return () => {
      const s = document.getElementById(`product-ld-${product.id}`);
      if (s) s.remove();
      const b = document.getElementById(`breadcrumb-ld-${product.id}`);
      if (b) b.remove();
    };
  }, [product]);

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, Math.min(99, prev + delta)));
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const firstImage = product.images?.[0]?.images || '';
    const cartItem = {
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      image: firstImage ? resolveImage(firstImage) : '',
    };
    
    addToLocalCart(cartItem, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const toggleWishlist = () => {
    if (!product?.id) return;
    
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      let updatedWishlist;
      
      if (isWishlisted) {
        updatedWishlist = wishlist.filter(id => id !== product.id);
      } else {
        updatedWishlist = [...wishlist, product.id];
      }
      
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      setIsWishlisted(!isWishlisted);
    } catch (e) {
      console.warn('Failed to update wishlist', e);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product?.name || 'Product',
      text: `Check out this product: ${product?.name || 'Amazing product'}`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        if (e.name !== 'AbortError') {
          fallbackShare();
        }
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
      console.log('Link copied to clipboard');
    } catch (e) {
      console.warn('Failed to copy link', e);
    }
  };

  const renderStars = (rating = 4.8) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={`${
                i < fullStars 
                  ? 'text-amber-400 fill-current' 
                  : i === fullStars && hasHalfStar
                  ? 'text-amber-400 fill-current opacity-50'
                  : 'text-gray-300 dark:text-gray-600'
              } transition-colors`}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 ml-2">
          {rating}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          (2,847 reviews)
        </span>
      </div>
    );
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImgLoaded(true);
    setImageError(false);
  };

  // Loading State
  if (loading && !product) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="w-full">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="p-4 md:p-8 space-y-4">
                <div className="bg-gray-200 dark:bg-gray-700 aspect-square"></div>
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 dark:bg-gray-700"></div>
                  ))}
                </div>
              </div>
              <div className="p-4 md:p-8 space-y-4 md:space-y-6">
                <div className="h-6 md:h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-10 md:h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="flex-1 h-10 md:h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="w-full text-blue-600 hover:text-blue-700 underline transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Product Not Found
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentImage = product.images?.[mainIndex];
  const hasImages = product.images && product.images.length > 0;
  const imageUrl = hasImages ? resolveImage(currentImage?.images || '') : '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
     

      {/* Main Content */}
      <div className="max-w-10xl mx-auto sm:px-6 lg:px-9 py-1">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 lg:p-8">
            
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden aspect-square group">
                {hasImages && !imageError ? (
                  <>
                    <img
                      key={`${mainIndex}-${currentImage?.id}`}
                      src={imageUrl}
                      alt={product.name}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      className={`w-full h-full object-cover transition-all duration-500 ${
                        imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                      }`}
                    />
                    
                    {/* Loading overlay */}
                    {!imgLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </>
                ) : (
                  // Fallback when no image or error
                  <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📦</div>
                      <p className="text-lg font-medium">No image available</p>
                    </div>
                  </div>
                )}
                
                {/* Image Counter */}
                {hasImages && (
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                    {mainIndex + 1} / {product.images.length}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={toggleWishlist}
                    className={`p-2 rounded-full backdrop-blur-sm transition-all transform hover:scale-110 ${
                      isWishlisted 
                        ? 'bg-red-500 text-white shadow-lg' 
                        : 'bg-white bg-opacity-80 text-gray-700 hover:bg-opacity-100'
                    }`}
                    title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full bg-white bg-opacity-80 text-gray-700 hover:bg-opacity-100 backdrop-blur-sm transition-all transform hover:scale-110"
                    title="Share product"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              {hasImages && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {product.images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      onClick={() => setMainIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-200 ${
                        idx === mainIndex 
                          ? 'ring-2 ring-blue-500 scale-105 shadow-lg' 
                          : 'ring-1 ring-gray-200 dark:ring-gray-600 hover:scale-105 hover:shadow-md'
                      }`}
                    >
                      <img 
                        src={resolveImage(img.images)} 
                        alt={`${product.name} view ${idx + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              {/* Product Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                    {product.category}
                  </span>
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full font-medium">
                    In Stock
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                  {product.name}
                </h1>
                {renderStars()}
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  ${product.price}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  ${(parseFloat(product.price) * 1.2).toFixed(2)}
                </span>
                <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-sm font-medium">
                  17% OFF
                </span>
              </div>

              

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <Truck className="mx-auto text-blue-600 mb-2" size={24} />
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Free Shipping</div>
                  <div className="text-xs text-gray-500">Orders over $50</div>
                </div>
                <div className="text-center">
                  <RotateCcw className="mx-auto text-green-600 mb-2" size={24} />
                  <div className="text-sm font-medium text-gray-900 dark:text-white">30-Day Returns</div>
                  <div className="text-xs text-gray-500">Money back guarantee</div>
                </div>
                <div className="text-center">
                  <Shield className="mx-auto text-purple-600 mb-2" size={24} />
                  <div className="text-sm font-medium text-gray-900 dark:text-white">2-Year Warranty</div>
                  <div className="text-xs text-gray-500">Full protection</div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantity:
                </label>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 font-medium text-gray-900 dark:text-white min-w-[60px] text-center border-x border-gray-300 dark:border-gray-600">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 99}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-lg"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 transform disabled:opacity-50 disabled:cursor-not-allowed ${
                    addedToCart
                      ? 'bg-green-600 text-white scale-105'
                      : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {addedToCart ? (
                      <>
                        <Check size={20} />
                        Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        Add to Cart
                      </>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => { handleAddToCart(); navigate('/checkout'); }}
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-xl font-semibold text-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>
              {/* Description */}
              {product.description && (
                
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <h4 className="text-xl font-bold dark:text-white mb-4">Product Description:</h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                     {product.description}...
                  </p>
                </div>
              )}
              {/* Product Details */}
              
            </div>
          </div>
        </div>

        {/* Reviews Section Placeholder */}
        
      </div>
    </div>
  );
};

export default ProductDetails;