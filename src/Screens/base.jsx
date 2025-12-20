import React, { useState, useEffect, useRef, memo } from "react";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Heart,
  User,
  Moon,
  Sun,
  Bell,
  Sparkles,
  LogOut,
  Star,
} from "lucide-react";
import { useNavigate, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { apiFetch, API_BASE, MEDIA_BASE } from "../base_api";
import Cart from "../Pages/Cart";
import Home from "../Pages/Home";
import Login from "../Auth/login";
import CategoryPage from "../Pages/CategoryPage";
import ProductDetails from "../Pages/Product_details";
import SearchPage from "../Pages/Search_page";
import Checkout from "../Pages/Checkout"; // Import Checkout
import { getCart } from "../utils/cart";
import Products from "../Pages/Lastest_all";
import { createProductUrl } from "../utils/slug"; // Import helper
// Memoized NavLink component for better performance
const NavLinkMemo = memo(({ to, children, className = "", onClick = () => { } }) => (
  <NavLink
    to={to}
    onClick={(e) => {
      try {
        onClick(e);
      } catch (err) {
        /* swallow errors from handlers */
      }
    }}
    className={({ isActive }) =>
      `${className} ${isActive ? "text-red-500 font-semibold" : ""}`
    }
  >
    {children}
  </NavLink>
));

const Base = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [debouncedSearchValue] = useDebounce(searchValue, 100);

  const menuRef = useRef(null);
  const menuBtnRef = useRef(null);

  // Check for user data in localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Load cart from localStorage on mount and subscribe to updates
  useEffect(() => {
    const load = () => {
      try {
        const latest = getCart();
        setCartItems(latest);
      } catch (e) {
        setCartItems([]);
      }
    };
    load();
    const onUpdate = () => load();
    window.addEventListener('cartUpdated', onUpdate);
    return () => window.removeEventListener('cartUpdated', onUpdate);
  }, []);

  // Handle scroll for header shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle outside clicks and escape key for mobile menu
  useEffect(() => {
    const handleOutside = (e) => {
      if (!menuOpen) return;
      if (menuBtnRef.current && menuBtnRef.current.contains(e.target)) return;
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape" && menuOpen) setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  // Handle search API calls with debouncing
  useEffect(() => {
    if (!debouncedSearchValue.trim() || !searchFocused) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    apiFetch(`/v2/products/search/${encodeURIComponent(debouncedSearchValue)}/`)
      .then((data) => {
        setSearchResults(data || []);
      })
      .catch((err) => {
        console.error('Error fetching search results:', err);
        setSearchResults([]);
      })
      .finally(() => setSearchLoading(false));
  }, [debouncedSearchValue, searchFocused]);

  // Handle Enter key to navigate to search page
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchValue.trim()) {
      setSearchFocused(false);
      setSearchResults([]);
      navigate(`/search?q=${encodeURIComponent(searchValue)}`);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const clearSearch = () => {
    setSearchValue("");
    setSearchResults([]);
  };

  const addToCart = (product) => {
    try {
      setCartItems(getCart());
    } catch (e) {
      /* ignore */
    }
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setUser(null);
    setMenuOpen(false);
  };

  const categories = [
    { name: "Shoes", href: "/category/shoes", icon: "shoes.png" },
    { name: "Bags", href: "/category/bags", icon: "school-bag.png" },
    { name: "Belts", href: "/category/belts", icon: "belt.png" },
    { name: "Leather Jackets", href: "/category/leather jackets", icon: "jacket.png" },
    { name: "Suit Jackets", href: "/category/suit jackets", icon: "jacket.png" },
  ];

  // Lightweight global SEO helper (no external Helmet dependency)
  useEffect(() => {
    const setMeta = (nameOrProp, content, isProperty = false) => {
      if (!content && content !== 0) return;
      const sel = isProperty ? `meta[property="${nameOrProp}"]` : `meta[name="${nameOrProp}"]`;
      let el = document.head.querySelector(sel);
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) el.setAttribute('property', nameOrProp);
        else el.setAttribute('name', nameOrProp);
        document.head.appendChild(el);
      }
      el.setAttribute('content', String(content));
    };

    const setCanonical = (href) => {
      if (!href) return;
      let canon = document.head.querySelector('link[rel="canonical"]');
      if (!canon) {
        canon = document.createElement('link');
        canon.setAttribute('rel', 'canonical');
        document.head.appendChild(canon);
      }
      canon.setAttribute('href', href);
    };

    window.setSEO = ({ title, description, url, image, type = 'website', twitterCard = 'summary_large_image', canonical } = {}) => {
      try {
        if (title) document.title = title;
        if (description) setMeta('description', description);
        setMeta('og:site_name', 'Khoojlo', true);
        if (title) setMeta('og:title', title, true);
        if (description) setMeta('og:description', description, true);
        setMeta('og:type', type, true);
        if (url) setMeta('og:url', url, true);
        if (image) {
          setMeta('og:image', image, true);
          setMeta('twitter:image', image);
        }
        setMeta('twitter:card', twitterCard);
        if (canonical) setCanonical(canonical);
        else if (url) setCanonical(url);
      } catch (e) {
        console.warn('setSEO failed', e);
      }
    };

    return () => {
      try { delete window.setSEO; } catch (e) { }
    };
  }, []);

  // Apply a sensible default SEO when location changes (helpful for category/search)
  useEffect(() => {
    const pathname = location?.pathname || '/';
    const defaults = {
      '/': {
        title: 'Khoojlo — Shop Smart, Live Better',
        description: 'Discover premium products at amazing prices. Free shipping on orders over RS-500.',
      },
    };
    // category pages: /category/:name
    if (pathname.startsWith('/category/')) {
      const cat = decodeURIComponent(pathname.replace('/category/', '') || 'Category');
      const title = `${cat} — Khoojlo`;
      const description = `Browse ${cat} at Khoojlo. Find great prices and fast shipping.`;
      if (window.setSEO) window.setSEO({ title, description, url: window.location.href, canonical: window.location.href });
      else {
        document.title = title;
      }
      return;
    }

    // search pages: keep a simple default
    if (pathname.startsWith('/search')) {
      const title = `Search results — Khoojlo`;
      const description = `Search results on Khoojlo`;
      if (window.setSEO) window.setSEO({ title, description, url: window.location.href, canonical: window.location.href });
      else document.title = title;
      return;
    }

    const def = defaults[pathname] || defaults['/'];
    if (window.setSEO) window.setSEO({ title: def.title, description: def.description, url: window.location.href, canonical: window.location.href });
    else document.title = def.title;
  }, [location]);

  return (
    <>
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .menu-item-enter {
          transform: translateX(-20px);
          opacity: 0;
        }
        .menu-item-enter-active {
          transform: translateX(0);
          opacity: 1;
          transition: all 0.3s ease-out;
        }
        .profile-img {
          border-radius: 50%;
          object-fit: cover;
        }
      `}</style>

      <div
        className={`font-sans transition-all duration-300 min-h-screen ${isDarkMode ? "bg-slate-900" : "bg-slate-50"
          } app-bg`}
      >
        {/* Header */}
        <header
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "shadow-lg backdrop-blur-lg bg-opacity-95" : "shadow-sm"
            } ${isDarkMode ? "bg-gray-900/95 border-gray-700" : "bg-white/95 border-gray-200"
            } border-b backdrop-blur-sm`}
        >
          <div className="w-full max-w-full px-3 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between h-14 sm:h-16">
              {/* Logo */}
              <NavLinkMemo
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/");
                }}
                to="/"
                className={`text-lg sm:text-xl md:text-2xl font-bold transition-all duration-300 flex items-center gap-1 sm:gap-2 shrink-0 transform hover:scale-105 ${isDarkMode ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-700"
                  }`}
              >
                <Sparkles
                  className={`h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 animate-pulse ${isDarkMode ? "text-red-400" : "text-red-600"
                    }`}
                />
                Khoojlo
              </NavLinkMemo>

              {/* Search */}
              <div className="flex-1 mx-2 sm:mx-2 md:mx-3 max-w-md lg:max-w-xl relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  onKeyDown={handleSearchKeyDown}
                  className={`w-full rounded-full pl-10 pr-10 py-2 sm:py-2.5 text-sm border transition-all duration-300 ${searchFocused
                    ? `ring-2 ${isDarkMode
                      ? "border-red-500 ring-red-500/50 bg-gray-800 shadow-lg"
                      : "border-red-500 ring-red-500/50 bg-white shadow-lg"
                    }`
                    : `${isDarkMode
                      ? "border-gray-600 bg-gray-800 hover:bg-gray-750"
                      : "border-gray-300 bg-gray-50 hover:bg-white"
                    }`
                    } ${isDarkMode ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500"
                    } focus:outline-none`}
                />
                <Search
                  className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-300 ${searchFocused ? "text-red-500" : isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                />
                {searchValue && (
                  <button
                    onClick={clearSearch}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-300 ${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    <X className="h-full w-full" />
                  </button>
                )}
                {searchFocused && (
                  <div
                    className={`absolute top-full left-0 right-0 mt-1 rounded-lg border z-50 p-3 transition-all duration-300 max-h-96 overflow-y-auto scrollbar-hide ${isDarkMode ? "bg-gray-800 border-gray-700 shadow-xl" : "bg-white border-gray-200 shadow-xl"
                      }`}
                  >
                    {searchValue && searchLoading ? (
                      <div className="text-center text-xs font-medium text-gray-500 py-2">Searching...</div>
                    ) : searchValue && searchResults.length > 0 ? (
                      <div className="space-y-2">
                        {searchResults.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => {
                              setSearchFocused(false);
                              setSearchValue("");
                              setSearchResults([]);
                              navigate(createProductUrl(product.id, product.name));
                            }}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-opacity-80 ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                              }`}
                          >
                            <img
                              src={(function (p) { if (!p) return ''; if (/^https?:\/\//i.test(p)) return p; return `${MEDIA_BASE}${p.startsWith('/') ? '' : '/'}${p}` })(product.images[0]?.images || '')}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-md"
                              loading="lazy"
                            />
                            <div className="flex-1">
                              <h3 className={`text-sm font-medium line-clamp-1 ${isDarkMode ? "text-white" : "text-gray-900"
                                }`}>{product.name}</h3>
                              <div className="flex items-center justify-between">
                                {product.rating && (
                                  <div className="flex items-center gap-1 text-amber-500">
                                    <Star size={10} fill="currentColor" />
                                    <span className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"
                                      }`}>{product.rating}</span>
                                  </div>
                                )}
                                <span className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-gray-900"
                                  }`}>${product.price}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : searchValue ? (
                      <div className="text-center text-xs font-medium text-gray-500 py-2">No results found</div>
                    ) : (
                      <>
                        <p
                          className={`text-xs font-medium mb-2 flex items-center gap-1.5 ${isDarkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                        >
                          <Sparkles className="h-3 w-3 text-red-500" /> Trending
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {["Sneakers Winter", "Womens Bags", "Mens Jackets", "Kids Fashion"].map((tag) => (
                            <button
                              key={tag}
                              onClick={() => {
                                setSearchValue(tag);
                                setSearchFocused(true);
                              }}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 transform hover:scale-105 ${isDarkMode
                                ? "bg-gray-700 text-gray-300 hover:bg-red-600/20 hover:text-red-300"
                                : "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600"
                                }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Desktop Icons */}
              <div className="hidden md:flex items-center space-x-7 shrink-0">
                <button
                  className={`relative p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${isDarkMode
                    ? "text-gray-300 hover:text-red-400 hover:bg-gray-800"
                    : "text-gray-600 hover:text-red-600 hover:bg-gray-100"
                    }`}
                >
                  <Bell className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full w-4 h-4 flex items-center justify-center animate-bounce">
                    2
                  </span>
                </button>

                {user ? (
                  <div className="relative group">
                    <NavLinkMemo
                      to="/profile"
                      className={`flex items-center px-6 py-4 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${isDarkMode
                        ? "text-gray-300 hover:text-white hover:bg-gray-800"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                    >
                      {user.profile_picture ? (
                        <img
                          src={`https://khoojlo.vercel.app/${user.profile_picture}`}
                          className="h-6 w-6 mr-1.5 profile-img"
                        />
                      ) : (
                        <User className="h-6 w-6 mr-1.5" />
                      )}
                      {(user.first_name || '').toUpperCase()}
                    </NavLinkMemo>

                    <div
                      className={`absolute top-full right-0 mt-2 w-48 rounded-lg shadow-xl z-50 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 opacity-0 translate-y-2 pointer-events-none group-hover:pointer-events-auto ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                        }`}
                    >
                      <button
                        onClick={handleLogout}
                        className={`w-full flex items-center px-4 py-2 text-sm font-medium transition-all duration-300 ${isDarkMode
                          ? "text-gray-300 hover:text-white hover:bg-gray-700"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                      >
                        <LogOut className="h-4 w-4 mr-2" /> Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <NavLinkMemo
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/login");
                    }}
                    to="/login"
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${isDarkMode
                      ? "text-gray-300 hover:text-white hover:bg-gray-800"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                  >
                    <User className="h-6 w-6 mr-1.8" />
                  </NavLinkMemo>
                )}

                <NavLinkMemo
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/cart");
                  }}
                  to="/cart"
                  className={`relative p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${isDarkMode
                    ? "text-gray-300 hover:text-red-400 hover:bg-gray-800"
                    : "text-gray-600 hover:text-red-600 hover:bg-gray-100"
                    }`}
                >
                  <ShoppingCart className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-medium rounded-full w-4 h-4 flex items-center justify-center animate-bounce">
                    {cartItems.reduce((s, it) => s + Number(it.quantity || 0), 0)}
                  </span>
                </NavLinkMemo>

                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 hover:rotate-180 ${isDarkMode
                    ? "text-yellow-400 hover:text-yellow-300 hover:bg-gray-800"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
                    }`}
                >
                  {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                </button>
              </div>

              {/* Mobile Icons */}
              <div className="flex md:hidden items-center space-x-1 shrink-0">
                <NavLinkMemo
                  to="/cart"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/cart");
                  }}
                  className={`relative p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${isDarkMode ? "text-gray-300 hover:text-red-400" : "text-gray-600 hover:text-red-600"
                    }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white text-xs font-medium rounded-full w-3.5 h-3.5 flex items-center justify-center animate-bounce">
                    {cartItems.reduce((s, it) => s + Number(it.quantity || 0), 0)}
                  </span>
                </NavLinkMemo>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={`p-2 rounded-lg transition-all duration-300 transform ${menuOpen ? "rotate-90 scale-110" : ""
                    } ${isDarkMode ? "text-gray-300 hover:text-red-400" : "text-gray-600 hover:text-red-600"}`}
                  ref={menuBtnRef}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            ref={menuRef}
            className={`md:hidden absolute left-0 right-0 top-full z-50 transform origin-top transition-all duration-500 ease-out ${menuOpen
              ? "scale-y-100 opacity-100 pointer-events-auto translate-y-0"
              : "scale-y-0 opacity-0 pointer-events-none -translate-y-4"
              }`}
          >
            <div
              className={`px-3 sm:px-4 py-6 space-y-2 border-t backdrop-blur-lg ${isDarkMode ? "border-gray-700 bg-gray-900/95" : "border-gray-200 bg-white/95"
                } shadow-xl`}
            >
              <div
                className={`transform transition-all duration-700 delay-100 ${menuOpen ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
                  }`}
              >
                {user ? (
                  <>
                    <NavLinkMemo
                      to="/profile"
                      className={`flex items-center p-3 rounded-xl transition-all duration-300 transform hover:translate-x-2 hover:scale-105 active:scale-95 ${isDarkMode
                        ? "text-gray-300 hover:text-white hover:bg-gray-800/80"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        } hover:shadow-lg`}
                    >
                      {user.profile_picture ? (
                        <img
                          src={`http://127.0.0.1:8000/${user.profile_picture}`}
                          alt="Profile"
                          className="h-6 w-6 mr-3 profile-img"
                        />
                      ) : (
                        <User className="h-5 w-5 mr-3" />
                      )}
                      <span className="font-large font-semibold">{(user.first_name || '').toUpperCase()}</span>
                    </NavLinkMemo>
                    <button
                      onClick={handleLogout}
                      className={`flex items-center w-full p-3 rounded-xl transition-all duration-300 transform hover:translate-x-2 hover:scale-105 active:scale-95 ${isDarkMode
                        ? "text-gray-300 hover:text-white hover:bg-gray-800/80"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        } hover:shadow-lg`}
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  <NavLinkMemo
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/login");
                    }}
                    to="/login"
                    className={`flex items-center p-3 rounded-xl transition-all duration-300 transform hover:translate-x-2 hover:scale-105 active:scale-95 ${isDarkMode
                      ? "text-gray-300 hover:text-white hover:bg-gray-800/80"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      } hover:shadow-lg`}
                  >
                    <User className="h-5 w-5 mr-3" />
                    <span className="font-medium">Login / Register</span>
                  </NavLinkMemo>
                )}
              </div>

              <div
                className={`transform transition-all duration-700 delay-300 ${menuOpen ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
                  }`}
              >
                <button
                  className={`flex items-center justify-between w-full p-3 rounded-xl transition-all duration-300 transform hover:translate-x-2 hover:scale-105 active:scale-95 ${isDarkMode
                    ? "text-gray-300 hover:text-white hover:bg-gray-800/80"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    } hover:shadow-lg`}
                >
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 mr-3" />
                    <span className="font-medium">Notifications</span>
                  </div>
                  <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full px-2.5 py-1 animate-pulse shadow-lg">
                    2
                  </span>
                </button>
              </div>

              <div
                className={`border-t pt-4 mt-4 transform transition-all duration-700 delay-400 ${menuOpen ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
                  } ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
              >
                <button
                  onClick={toggleDarkMode}
                  className={`flex items-center w-full p-3 rounded-xl transition-all duration-300 transform hover:translate-x-2 hover:scale-105 active:scale-95 ${isDarkMode
                    ? "text-gray-300 hover:text-white hover:bg-gray-800/80"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    } hover:shadow-lg`}
                >
                  {isDarkMode ? (
                    <>
                      <Sun className="h-5 w-5 mr-3 transition-transform duration-300 hover:rotate-180" />
                      <span className="font-medium">Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5 mr-3 transition-transform duration-300 hover:rotate-180" />
                      <span className="font-medium">Dark Mode</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Category Navbar */}
        <nav
          className={`${isDarkMode ? "bg-gray-800/80" : "bg-white/80"
            } backdrop-blur-md border-y ${isDarkMode ? "border-gray-700" : "border-gray-200"
            } shadow-sm sticky top-[56px] sm:top-[64px] z-40`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center relative">
              <div
                className={`absolute left-0 top-0 bottom-0 w-12 pointer-events-none bg-gradient-to-r ${isDarkMode ? "from-gray-800/80" : "from-white/80"
                  }`}
              ></div>
              <ul
                className="flex gap-2 sm:gap-8 items-center overflow-x-auto flex-nowrap py-2"
                style={{
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {categories.map((category) => (
                  <li key={category.name} className="flex-shrink-0">
                    <NavLinkMemo
                      to={category.href}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${isDarkMode
                        ? "text-gray-300 bg-gray-700/50 hover:bg-red-600 hover:text-white"
                        : "text-gray-600 bg-gray-100 hover:bg-red-500 hover:text-white"
                        } hover:shadow-lg hover:shadow-red-500/30 active:scale-95`}
                    >
                      {category.icon && (
                        <img
                          src={`/${category.icon}`}
                          alt={category.name}
                          className="w-5 h-5 object-contain"
                        />
                      )}
                      {category.name}
                    </NavLinkMemo>
                  </li>
                ))}
              </ul>
              <div
                className={`absolute right-0 top-0 bottom-0 w-12 pointer-events-none bg-gradient-to-l ${isDarkMode ? "from-gray-800/80" : "from-white/80"
                  }`}
              ></div>
            </div>
          </div>
        </nav>

        <div className="pt-16 sm:pt-21">
          <Routes>
            <Route path="/" element={<Home addToCart={addToCart} />} />
            <Route
              path="/cart"
              element={<Cart cartItems={cartItems} removeFromCart={removeFromCart} />}
            />
            <Route path="/login" element={<Login />} />
            <Route
              path="/category/:category"
              element={<CategoryPage addToCart={addToCart} isDarkMode={isDarkMode} />}
            />
            <Route
              path="/product/:id"
              element={<ProductDetails addToCart={addToCart} isDarkMode={isDarkMode} />}
            />
            <Route
              path="/search"
              element={<SearchPage addToCart={addToCart} isDarkMode={isDarkMode} />}
            />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
          <Routes>
            <Route path="/latest" element={<Products addToCart={addToCart} isDarkMode={isDarkMode} />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default memo(Base);