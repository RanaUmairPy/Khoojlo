import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../base_api";
import { 
  Package, 
  Plus,
  Search,
  Edit3,
  Trash2,
  Upload,
  X,
  TrendingUp,
  DollarSign,
  AlertTriangle
} from "lucide-react";

const CATEGORY_CHOICES = ["Bags", "Shoes"];

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
        src={`${API_BASE}${images[currentIndex].images}`}
        alt={`Product ${currentIndex + 1}`}
        className="w-full h-full object-cover rounded-lg"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/70 p-1 rounded-full hover:bg-white transition-colors"
          >
            &#8592;
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/70 p-1 rounded-full hover:bg-white transition-colors"
          >
            &#8594;
          </button>
        </>
      )}
    </div>
  );
};

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

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/v2/products/`, {
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

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      setFormData({ ...formData, images: [...formData.images, ...Array.from(files)] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle form submit
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
          `${API_BASE}/api/v2/products/${editingProductId}/`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditingProductId(null);
      } else {
        await axios.post(
          `${API_BASE}/api/v2/products/`,
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

  // Handle edit
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

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${API_BASE}/api/v2/products/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchProducts();
      } catch (err) {
        console.error(err);
        alert("Error deleting product. Please try again.");
      }
    }
  };

  // Filtered products
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
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
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-visible animate-pulse">
              <div className="w-full h-24 bg-gray-200"></div>
              <div className="p-3 space-y-1">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="flex gap-1 min-h-[2rem]">
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
            <div className="bg-blue-100 p-3 rounded-lg"><Package className="w-6 h-6 text-blue-600"/></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">PKR {totalValue.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg"><DollarSign className="w-6 h-6 text-green-600"/></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Price</p>
              <p className="text-2xl font-bold text-gray-900">PKR {averagePrice.toFixed(2)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg"><TrendingUp className="w-6 h-6 text-purple-600"/></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockCount}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg"><AlertTriangle className="w-6 h-6 text-yellow-600"/></div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div 
              key={product.id} 
              className="bg-white rounded-lg shadow-sm overflow-visible hover:shadow-md transition-all flex flex-col"
            >
              <div className="w-full h-24 bg-gray-100 relative flex-shrink-0">
                {product.images && product.images.length > 0 ? (
                  <ImageSlider images={product.images} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="p-3 flex flex-col flex-grow space-y-0.5">
                <h3 className="font-bold text-xs line-clamp-2">{product.name}</h3>
                <p className="text-gray-500 text-xs">{product.category}</p>
                <p className="text-gray-600 text-xs line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-900">RS{parseFloat(product.price).toFixed(2)}</span>
                </div>
                <div className="flex gap-1 mt-auto min-h-[2rem]">
                  <button 
                    onClick={() => handleEdit(product)} 
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-1 text-sm"
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)} 
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-1 text-sm"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingProductId ? "Edit Product" : "Add New Product"}</h3>
              <button onClick={() => setShowAddModal(false)} className="hover:bg-gray-100 rounded p-1">
                <X className="w-6 h-6 text-gray-400 hover:text-gray-600"/>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Product Name" 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required 
              />
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="Description" 
                rows={3} 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
                required
              />
              <input 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                placeholder="Price" 
                step="0.01" 
                min="0" 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required
              />
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CATEGORY_CHOICES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2"/>
                <input 
                  type="file" 
                  name="images" 
                  onChange={handleChange} 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                  Click to upload images
                </label>
                {formData.images.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{formData.images.length} image(s) selected</p>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
                >
                  {editingProductId ? "Update" : "Add"} Product
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="flex-1 bg-gray-200 py-3 rounded-lg text-gray-800 hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsTab;