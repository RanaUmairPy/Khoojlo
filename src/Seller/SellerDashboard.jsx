import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE, MEDIA_BASE } from "../base_api";
import {
  Package,
  ShoppingCart,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  TrendingUp,
  Users,
  DollarSign,
  Menu,
  X,
  Plus,
  Search,
  Edit3,
  Trash2,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from "lucide-react";

const CATEGORY_CHOICES = [
  "Bags",
  "Shoes",
  "Belts",
  "Leather Jackets",
  "Suit Jackets",
];

// ImageSlider Component
const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const next = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <img
        src={`${MEDIA_BASE}${images[currentIndex].images}`}
        alt={`Product ${currentIndex + 1}`}
        className="w-full h-full object-cover rounded-t-lg"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-white/80 p-0.5 rounded-full hover:bg-white"
          >
            &#8592;
          </button>
          <button
            onClick={next}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-white/80 p-0.5 rounded-full hover:bg-white"
          >
            &#8594;
          </button>
        </>
      )}
    </div>
  );
};

// ProductsTab Component
const ProductsTab = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: CATEGORY_CHOICES[0],
    images: [],
  });
  const [editingProductId, setEditingProductId] = useState(null);

  const token = localStorage.getItem("sellerAccessToken");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/v2/products/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      setFormData({ ...formData, images: [...formData.images, ...Array.from(files)] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("category", formData.category);

    if (formData.images && formData.images.length > 0) {
      formData.images.forEach((img) => data.append("images", img));
    }

    try {
      if (editingProductId) {
        await axios.put(
          `${API_BASE}/v2/products/${editingProductId}/`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditingProductId(null);
      } else {
        await axios.post(
          `${API_BASE}/v2/products/`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setFormData({ name: "", description: "", price: "", category: CATEGORY_CHOICES[0], images: [] });
      setShowAddModal(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Error saving product. Please try again.");
    }
  };

  const handleEdit = (product) => {
    setEditingProductId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      images: [],
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${API_BASE}/v2/products/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchProducts();
      } catch (err) {
        console.error(err);
        alert("Error deleting product. Please try again.");
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + parseFloat(product.price || 0), 0);
  const averagePrice = totalProducts > 0 ? totalValue / totalProducts : 0;
  const lowStockCount = 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Products</h2>
            <p className="text-gray-600 mt-1">Manage your product inventory</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse h-[280px]">
              <div className="w-full h-32 bg-gray-200"></div>
              <div className="p-2 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="flex gap-1">
                  <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                  <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-gray-600 mt-1">Manage your product inventory</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
          <button
            onClick={() => {
              setEditingProductId(null);
              setFormData({ name: "", description: "", price: "", category: CATEGORY_CHOICES[0], images: [] });
              setShowAddModal(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg"><Package className="w-6 h-6 text-blue-600" /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">PKR {totalValue.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg"><DollarSign className="w-6 h-6 text-green-600" /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Price</p>
              <p className="text-2xl font-bold text-gray-900">PKR {averagePrice.toFixed(2)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg"><TrendingUp className="w-6 h-6 text-purple-600" /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockCount}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg"><AlertTriangle className="w-6 h-6 text-yellow-600" /></div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-visible hover:shadow-md transition-all flex flex-col">
              <div className="w-full h-32 bg-gray-100 relative flex-shrink-0">
                {product.images && product.images.length > 0 ? (
                  <ImageSlider images={product.images} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="p-2 flex flex-col flex-grow">
                <h3 className="font-bold text-xs line-clamp-2 mb-1">{product.name}</h3>
                <p className="text-gray-500 text-xs mb-1">{product.category}</p>
                <p className="text-gray-600 text-xs line-clamp-2 mb-2 flex-grow">{product.description}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold text-gray-900">RS{parseFloat(product.price).toFixed(2)}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 bg-blue-50 text-blue-600 py-1 px-2 rounded text-xs flex items-center justify-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 bg-red-50 text-red-600 py-1 px-2 rounded text-xs flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Add your first product to get started</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{editingProductId ? "Edit Product" : "Add New Product"}</h3>
                <p className="text-gray-500 text-sm mt-1">Fill in the details to list your product.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="hover:bg-gray-100 rounded-full p-2 transition-colors">
                <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Input */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Premium Leather Jacket"
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (PKR)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rs</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    {CATEGORY_CHOICES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your product features, material, and care instructions..."
                    rows={4}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                  <div className="border-2 border-dashed border-blue-100 bg-blue-50/50 rounded-xl p-8 text-center hover:bg-blue-50 transition-colors group cursor-pointer relative">
                    <input
                      type="file"
                      name="images"
                      onChange={handleChange}
                      multiple
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-blue-900">Click to upload images</p>
                      <p className="text-xs text-blue-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                    </div>
                  </div>
                  {formData.images.length > 0 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                      {formData.images.map((img, i) => (
                        <div key={i} className="bg-gray-100 rounded-lg px-3 py-1 text-xs text-gray-600 flex items-center whitespace-nowrap">
                          {img.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-6 mt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white border border-gray-200 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg shadow-blue-200"
                >
                  {editingProductId ? "Update Product" : "Create Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Order Details Modal (Invoice Style)
const OrderDetailsModal = ({ order, onClose, onUpdateStatus }) => {
  if (!order) return null;

  const totalItems = order.order_items ? order.order_items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  // Show actions if order is not yet finalized (delivered or cancelled)
  const canModify = !['Delivered', 'Cancelled'].includes(order.status);
  const isPending = ['Placed', 'Confirmed', 'Processing'].includes(order.status || 'Placed');

  const handleAction = (status) => {
    // If cancelling, ask for confirmation
    if (status === 'Cancelled' && !window.confirm(`Are you sure you want to cancel this order? This cannot be undone.`)) {
      return;
    }
    // For other statuses, just do it or optional confirm
    if (status !== 'Cancelled' && !window.confirm(`Mark order as ${status}?`)) {
      return;
    }
    onUpdateStatus(order.id, status);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col print:h-full print:shadow-none print:max-w-none">
        {/* Modal Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-8 py-6 flex justify-between items-center print:hidden">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Order #{order.id}</h3>
            <p className="text-gray-500 text-sm mt-1">Placed on {new Date(order.created_at).toLocaleString()}</p>
          </div>
          <div className="flex gap-3">
            <div className={`px-4 py-2 rounded-lg font-medium border ${order.status === 'Cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
              ['Delivered', 'Shipped'].includes(order.status) ? 'bg-green-100 text-green-700 border-green-200' :
                'bg-blue-100 text-blue-700 border-blue-200'
              }`}>
              Status: {order.status || 'Placed'}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="overflow-y-auto p-8 space-y-8 flex-1">

          {/* Customer & Shipping Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Customer Details</h4>
              <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                <span className="text-gray-500">Name:</span>
                <span className="font-medium text-gray-900">{order.first_name} {order.last_name}</span>
                <span className="text-gray-500">Email:</span>
                <span className="font-medium text-gray-900">{order.email}</span>
                <span className="text-gray-500">Phone:</span>
                <span className="font-medium text-gray-900">{order.phone}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Shipping Information</h4>
              <div className="text-sm text-gray-700 leading-relaxed">
                <p>{order.address}</p>
                <p>{order.city}, {order.zip_code}</p>
                <div className="mt-4 flex gap-2">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                    {order.cash_on_delivery ? "Cash on Delivery" : "Paid Online"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items Table (Invoice) */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4 text-center">Quantity</th>
                    <th className="px-6 py-4 text-right">Unit Price</th>
                    <th className="px-6 py-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {order.order_items && order.order_items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.product_image ? `${MEDIA_BASE}${item.product_image.startsWith('/') ? '' : '/'}${item.product_image}` : 'https://via.placeholder.com/50'}
                            alt={item.product_name}
                            className="w-12 h-12 rounded object-cover border"
                          />
                          <span className="font-medium text-gray-900">{item.product_name || `Product #${item.product}`}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-700">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-gray-700">Rs {parseFloat(item.price).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        Rs {(parseFloat(item.price) * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end pt-4">
            <div className="w-full max-w-xs space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({totalItems} items)</span>
                <span>Rs {parseFloat(order.total_amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-3">
                <span>Grand Total</span>
                <span>Rs {parseFloat(order.total_amount).toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer - Actions */}
        <div className="bg-gray-50 border-t border-gray-200 px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
          <button
            onClick={() => window.print()}
            className="text-gray-600 hover:text-gray-900 font-medium text-sm flex items-center gap-2"
          >
            <Package className="w-4 h-4" /> Print Packing Slip
          </button>

          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={onClose} className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              Close
            </button>

            {canModify && (
              <button
                onClick={() => handleAction('Cancelled')}
                className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-lg font-medium hover:bg-red-100 transition-colors"
              >
                Cancel Order
              </button>
            )}

            {/* Workflow Buttons */}
            {(order.status === 'Placed' || !order.status) && (
              <button
                onClick={() => handleAction('Confirmed')}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                Confirm Order
              </button>
            )}
            {order.status === 'Confirmed' && (
              <button
                onClick={() => handleAction('Shipped')}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
              >
                Mark as Shipped
              </button>
            )}
            {order.status === 'Shipped' && (
              <button
                onClick={() => handleAction('Delivered')}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
              >
                Mark Delivered
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// OrdersTab Component
const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All'); // 'All', 'Pending', 'History', 'Cancelled'

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/v2/order/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("sellerAccessToken")}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_BASE}/v2/order/${orderId}/`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("sellerAccessToken")}` },
      });
      // Update local state directly to reflect change immediately
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      // also refresh to be safe
      fetchOrders();
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update order status. Please try again.");
    }
  }

  // Filter Logic
  const getFilteredOrders = () => {
    switch (activeFilter) {
      case 'Pending':
        return orders.filter(o => ['Placed', 'Confirmed', 'Processing', null, ''].includes(o.status));
      case 'History':
        return orders.filter(o => ['Shipped', 'Delivered'].includes(o.status));
      case 'Cancelled':
        return orders.filter(o => o.status === 'Cancelled');
      default:
        return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

  // Counts
  const pendingCount = orders.filter(o => ['Placed', 'Confirmed', 'Processing', null, ''].includes(o.status)).length;
  const historyCount = orders.filter(o => ['Shipped', 'Delivered'].includes(o.status)).length;
  const cancelledCount = orders.filter(o => o.status === 'Cancelled').length;
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);


  if (loading) return <div className="p-12 text-center text-gray-500">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
        <div className="flex gap-3">
          <button onClick={fetchOrders} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Refresh</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700">Export CSV</button>
        </div>
      </div>

      {/* Interactive Filter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveFilter('All')}
          className={`p-6 rounded-xl border cursor-pointer transition-all ${activeFilter === 'All' ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500 ring-opacity-50' : 'bg-white border-gray-100 hover:border-blue-200'}`}
        >
          <p className="text-sm font-medium text-gray-500">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{orders.length}</p>
        </div>

        <div
          onClick={() => setActiveFilter('Pending')}
          className={`p-6 rounded-xl border cursor-pointer transition-all ${activeFilter === 'Pending' ? 'bg-yellow-50 border-yellow-200 ring-2 ring-yellow-500 ring-opacity-50' : 'bg-white border-gray-100 hover:border-yellow-200'}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
            </div>
            <div className="bg-yellow-100 p-2 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div>
          </div>
          <p className="text-xs text-yellow-600 mt-2">Action needed</p>
        </div>

        <div
          onClick={() => setActiveFilter('History')}
          className={`p-6 rounded-xl border cursor-pointer transition-all ${activeFilter === 'History' ? 'bg-green-50 border-green-200 ring-2 ring-green-500 ring-opacity-50' : 'bg-white border-gray-100 hover:border-green-200'}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">History</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{historyCount}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
          </div>
          <p className="text-xs text-green-600 mt-2">Completed orders</p>
        </div>

        <div
          onClick={() => setActiveFilter('Cancelled')}
          className={`p-6 rounded-xl border cursor-pointer transition-all ${activeFilter === 'Cancelled' ? 'bg-red-50 border-red-200 ring-2 ring-red-500 ring-opacity-50' : 'bg-white border-gray-100 hover:border-red-200'}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Cancelled</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{cancelledCount}</p>
            </div>
            <div className="bg-red-100 p-2 rounded-lg"><XCircle className="w-5 h-5 text-red-600" /></div>
          </div>
          <p className="text-xs text-red-600 mt-2">Terminated</p>
        </div>
      </div>

      {/* Filter Tabs Visual */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['All', 'Pending', 'History', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeFilter === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.id}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{order.first_name} {order.last_name}</div>
                  <div className="text-xs text-gray-500">{order.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'Delivered' || order.status === 'Confirmed' || order.status === 'Shipped' ? 'bg-green-100 text-green-800' :
                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                    {order.status || 'Placed'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">Rs {parseFloat(order.total_amount).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm transition-all"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No orders found in {activeFilter} view.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdateStatus={updateStatus} />
      )}
    </div>
  );
};

// Mock PaymentsTab component (replace with your actual component)
const PaymentsTab = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h2 className="text-2xl font-bold text-gray-900">Payments & Analytics</h2>
      <button className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
        Request Payout
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
        <p className="text-3xl font-bold">$24,580</p>
        <p className="text-indigo-100 text-sm mt-1">+12% from last month</p>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">Available Balance</h3>
        <p className="text-3xl font-bold">$3,420</p>
        <p className="text-green-100 text-sm mt-1">Ready for payout</p>
      </div>

      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">This Month</h3>
        <p className="text-3xl font-bold">$8,960</p>
        <p className="text-orange-100 text-sm mt-1">+5% from target</p>
      </div>
    </div>

    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <p className="text-gray-600">Your PaymentsTab component will be rendered here.</p>
      <p className="text-sm text-gray-500 mt-2">Replace this with your actual PaymentsTab import.</p>
    </div>
  </div>
);

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [seller, setSeller] = useState({ firstName: "", lastName: "" });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const access = localStorage.getItem("sellerAccessToken");
    const userId = localStorage.getItem("sellerUserId");
    if (!access || !userId) {
      // if no seller tokens, redirect to login
      window.location.href = '/seller-login';
      return;
    }

    const firstName = localStorage.getItem("sellerFirstName") || "Seller";
    const lastName = localStorage.getItem("sellerLastName") || "";
    setSeller({ firstName, lastName });
  }, []);

  const tabs = [
    {
      id: "products",
      label: "Products",
      icon: Package,
      color: "blue"
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingCart,
      color: "green"
    },
    {
      id: "payments",
      label: "Payments",
      icon: CreditCard,
      color: "purple"
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "products":
        return <ProductsTab />;
      case "orders":
        return <OrdersTab />;
      case "payments":
        return <PaymentsTab />;
      default:
        return <ProductsTab />;
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header */}
      <header className="bg-white backdrop-blur-sm bg-white/95 shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Welcome back, {seller.firstName}! 👋
                </h1>
                <p className="text-gray-600 text-sm">
                  Here's what's happening with your store today
                </p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-xl font-bold text-gray-900">
                  Welcome, {seller.firstName}! 👋
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile menu button */}
              <button
                className="sm:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={toggleMobileMenu}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>

              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  3
                </span>
              </button>

              {/* Settings */}
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>

              {/* Profile & Logout */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {seller.firstName.charAt(0)}{seller.lastName.charAt(0)}
                </div>
                <button
                  className="hidden sm:flex bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                  onClick={() => {
                    localStorage.removeItem('sellerAccessToken');
                    localStorage.removeItem('sellerRefreshToken');
                    localStorage.removeItem('sellerUserId');
                    localStorage.removeItem('sellerFirstName');
                    localStorage.removeItem('sellerLastName');
                    window.location.href = "/seller-login";
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
                <button
                  className="sm:hidden bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm flex items-center space-x-1"
                  onClick={() => {
                    localStorage.removeItem('sellerAccessToken');
                    localStorage.removeItem('sellerRefreshToken');
                    localStorage.removeItem('sellerUserId');
                    localStorage.removeItem('sellerFirstName');
                    localStorage.removeItem('sellerLastName');
                    window.location.href = "/seller-login";
                  }}
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Tab Menu */}
      <div className="sm:hidden bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className={`flex space-x-1 py-2 overflow-x-auto ${mobileMenuOpen ? 'block' : 'hidden'}`} role="tablist">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 font-medium text-sm transition-all duration-200 border rounded-lg flex-shrink-0 min-w-max ${isActive
                    ? `border-${tab.color}-500 text-${tab.color}-600 bg-${tab.color}-50`
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? `text-${tab.color}-600` : 'text-gray-400 group-hover:text-gray-600'
                    }`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modern Navigation - Desktop */}
      <nav className="hidden sm:block bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-all duration-200 border-b-2 relative group ${isActive
                    ? `border-${tab.color}-500 text-${tab.color}-600 bg-${tab.color}-50/50`
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? `text-${tab.color}-600` : 'text-gray-400 group-hover:text-gray-600'
                    }`} />
                  <span>{tab.label}</span>

                  {/* Active indicator */}
                  {isActive && (
                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 rounded-full`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="animate-fadeIn">
          {renderTabContent()}
        </div>
      </main>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SellerDashboard;