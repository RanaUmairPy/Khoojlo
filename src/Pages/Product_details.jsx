import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, ArrowLeft, Heart, Share2, ShoppingCart, Truck, Shield, RotateCcw, Plus, Minus, Check, AlertCircle, Sparkles } from 'lucide-react';
import { API_BASE, MEDIA_BASE, apiFetch } from '../base_api';
import { addToCart as addToLocalCart, getCart } from '../utils/cart';

const ProductDetails = () => {
  const { id: paramId } = useParams();
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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Extract ID from slug-id pattern (e.g., "my-product-123" -> "123")
  const productId = useMemo(() => {
    if (!paramId) return null;
    // If purely numeric, return as is
    if (/^\d+$/.test(paramId)) return paramId;
    // Otherwise try to extract the last segment
    const parts = paramId.split('-');
    const lastPart = parts[parts.length - 1];
    return /^\d+$/.test(lastPart) ? lastPart : paramId;
  }, [paramId]);

  // resolve image paths to absolute URLs (use MEDIA_BASE for relative paths)
  const resolveImage = (path) => {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return `${MEDIA_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  useEffect(() => {
    if (!productId) return;
    const cacheKey = `product_${productId}`;

    // Try local cache first for instant UI
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setProduct(JSON.parse(cached));
        setLoading(false);
      }
    } catch (e) {
      console.warn('product cache read failed', e);
    }

    // Fetch fresh data
    setLoading(true);
    apiFetch(`/v2/products/details/${productId}/`)
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
  }, [productId]);

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
      document.title = seoTitle;
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
        "priceCurrency": "PKR",
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

    return () => {
      const s = document.getElementById(`product-ld-${product.id}`);
      if (s) s.remove();
    };
  }, [product]);

  // Check if product is in cart
  useEffect(() => {
    if (!product) return;
    const checkCart = () => {
      const cart = getCart();
      const inCart = cart.some(item => String(item.id) === String(product.id));
      setAddedToCart(inCart);
    };

    checkCart();

    const handleCartUpdate = () => checkCart();
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
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
        if (e.name !== 'AbortError') fallbackShare();
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      // Could show toast here
    } catch (e) {
      console.warn('Failed to copy link', e);
    }
  };

  const renderRating = () => {
    // Only render if we have a valid rating
    if (!product.rating) return null;

    return (
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={18}
            className={`${i < Math.round(product.rating)
              ? 'text-yellow-400 fill-current'
              : 'text-gray-200 dark:text-gray-600'
              }`}
          />
        ))}
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 ml-2">
          {Number(product.rating).toFixed(1)}
        </span>
      </div>
    );
  };

  const handleImageError = () => setImageError(true);
  const handleImageLoad = () => {
    setImgLoaded(true);
    setImageError(false);
  };

  // Loading State
  if (loading && !product) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-gray-200 dark:bg-gray-800 aspect-square rounded-2xl"></div>
              <div className="flex gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
              <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="flex gap-4">
                <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded flex-1"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded flex-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {error || 'Product Not Found'}
          </h2>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2 rounded-full font-medium transition-transform hover:scale-105"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const currentImage = product.images?.[mainIndex];
  const hasImages = product.images && product.images.length > 0;
  const imageUrl = hasImages ? resolveImage(currentImage?.images || '') : '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Home</Link>
          <span className="mx-2">/</span>
          {product.category && (
            <>
              <Link to={`/category/${product.category.toLowerCase()}`} className="hover:text-gray-900 dark:hover:text-white transition-colors capitalize">
                {product.category}
              </Link>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="text-gray-900 dark:text-gray-200 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">

            {/* Gallery Section */}
            <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-800/50">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-white dark:bg-gray-700 mb-4 group shadow-sm border border-gray-100 dark:border-gray-600">
                {hasImages && !imageError ? (
                  <>
                    <img
                      src={imageUrl}
                      alt={product.name}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      className={`w-full h-full object-contain p-4 transition-all duration-500 ${imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                        }`}
                    />
                    {!imgLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <Sparkles size={48} className="mb-2 opacity-50" />
                    <span className="text-sm">No Image</span>
                  </div>
                )}

                {/* Floating Actions */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <button
                    onClick={toggleWishlist}
                    className="p-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                  >
                    <Heart size={20} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
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
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 bg-white dark:bg-gray-700 ${idx === mainIndex
                        ? 'border-blue-600 ring-2 ring-blue-600/20'
                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                      <img
                        src={resolveImage(img.images)}
                        alt={`View ${idx + 1}`}
                        className="w-full h-full object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="p-6 lg:p-8 lg:pr-12">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  {product.category && (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide">
                      {product.category}
                    </span>
                  )}
                  {product.stock_status === 'in_stock' && (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> In Stock
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight leading-tight">
                  {product.name}
                </h1>

                {renderRating()}

                <div className="flex items-baseline gap-4 mt-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    Rs {Number(product.price).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Quantity & Buttons moved UP */}
              <div className="space-y-6 mb-8">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">Quantity</span>
                  <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-all disabled:opacity-50"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= 10}
                      className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-all disabled:opacity-50"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={loading}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-lg transition-all transform active:scale-95 ${addedToCart
                      ? 'bg-green-500 text-white shadow-green-500/30'
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 hover:border-gray-900 dark:hover:border-white'
                      }`}
                  >
                    {addedToCart ? <Check size={20} /> : <ShoppingCart size={20} />}
                    {addedToCart ? 'Added' : 'Add to Cart'}
                  </button>

                  <button
                    onClick={() => { handleAddToCart(); navigate('/checkout'); }}
                    disabled={loading}
                    className="flex-[2] flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-xl shadow-gray-200 dark:shadow-none transition-all transform active:scale-95"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Features (Delivery/Genuine) moved below buttons */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <Truck className="text-blue-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Fast Delivery</h3>
                    <p className="text-xs text-gray-500">Ships within 24h</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <Shield className="text-blue-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Genuine Product</h3>
                    <p className="text-xs text-gray-500">100% Authentic</p>
                  </div>
                </div>
              </div>

              {/* Description moved to bottom with Read More */}
              {product.description && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-3">Description</h3>
                  <div className={`prose prose-sm dark:prose-invert text-gray-600 dark:text-gray-300 max-w-none relative ${!isDescriptionExpanded ? 'max-h-32 overflow-hidden' : ''}`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{product.description}</p>
                    {!isDescriptionExpanded && (
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-50 dark:from-gray-800/50 to-transparent"></div>
                    )}
                  </div>
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline focus:outline-none flex items-center gap-1"
                  >
                    {isDescriptionExpanded ? 'Read Less' : 'Read More'}
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;