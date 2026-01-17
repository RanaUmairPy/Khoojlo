import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getCart, clearCart } from '../utils/cart';
import { CreditCard, Truck, AlertCircle } from 'lucide-react';
import { API_BASE, MEDIA_BASE } from '../base_api';

const Checkout = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        zip: '',
        phone: '',
        paymentMethod: 'cod', // default to Cash on Delivery
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        // Load cart items on mount
        const cart = getCart();
        if (!cart || cart.length === 0) {
            navigate('/cart');
            return;
        }
        // Normalize image paths
        const normalized = cart.map((it) => ({
            ...it,
            price: Number(it.price) || 0,
            quantity: Number(it.quantity) || 0,
            image: it.image
                ? (String(it.image).startsWith('http') ? it.image : `${MEDIA_BASE}${it.image.startsWith('/') ? '' : '/'}${it.image}`)
                : ''
        }));
        setItems(normalized);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const calculateTotal = () => {
        const subtotal = items.reduce((s, i) => s + (i.price * i.quantity), 0);
        const shipping = subtotal > 500 ? 0 : 99; // Example logic: Free shipping over 500
        return { subtotal, shipping, total: subtotal + shipping };
    };

    const { subtotal, shipping, total } = calculateTotal();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.address || !formData.city || !formData.phone) {
            setError("Please fill in all shipping details.");
            return;
        }

        try {
            const orderPayload = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                zip_code: formData.zip,
                total_amount: total,
                cash_on_delivery: formData.paymentMethod === 'cod',
                items: items.map(item => ({
                    product: item.id,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            const response = await axios.post(`${API_BASE}/v2/order/`, orderPayload);

            // Prepare details for success page
            const successDetails = {
                orderId: response.data.id,
                orderDetails: {
                    items: items,
                    total_amount: total,
                    shipping_address: formData
                }
            };
            clearCart();
            navigate('/order-success', { state: successDetails });
        } catch (err) {
            console.error("Order submission failed:", err);
            setError("Failed to place order. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 lg:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Checkout</h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                    {/* Shipping Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 lg:p-8">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Truck className="text-blue-600" /> Shipping Information
                        </h2>
                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                                    <input required name="firstName" value={formData.firstName} onChange={handleChange} type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                                    <input required name="lastName" value={formData.lastName} onChange={handleChange} type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                                <input required name="address" value={formData.address} onChange={handleChange} type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="House number and street name" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                                    <input required name="city" value={formData.city} onChange={handleChange} type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ZIP Code</label>
                                    <input required name="zip" value={formData.zip} onChange={handleChange} type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <CreditCard className="text-blue-600" /> Payment Method
                                </h2>
                                <div className="space-y-3">
                                    <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                                        <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleChange} className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <span className="block font-medium text-gray-900 dark:text-white">Cash on Delivery</span>
                                            <span className="text-sm text-gray-500">Pay when you receive your order</span>
                                        </div>
                                    </label>
                                    <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'card' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                                        <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleChange} className="w-5 h-5 text-blue-600" />
                                        <div className="opacity-50">
                                            <span className="block font-medium text-gray-900 dark:text-white">Credit/Debit Card</span>
                                            <span className="text-sm text-gray-500">Coming soon</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 lg:p-8 sticky top-24">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto scrollbar-hide">
                                {items.map((item, idx) => (
                                    <div key={`${item.id}-${idx}`} className="flex gap-4">
                                        <img src={item.image || '/default-product.png'} alt={item.name} className="w-16 h-16 object-cover rounded-md bg-gray-100 dark:bg-gray-700" />
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">{item.name}</h4>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Rs {Number(item.price).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>Rs {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    {shipping === 0 ? <span className="text-green-600">Free</span> : <span>Rs {shipping}</span>}
                                </div>
                                <div className="flex justify-between font-bold text-xl text-gray-900 dark:text-white pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <span>Total</span>
                                    <span>Rs {total.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                form="checkout-form"
                                type="submit"
                                className="w-full mt-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 dark:hover:bg-gray-100 shadow-xl shadow-gray-200 dark:shadow-none transition-all transform active:scale-95"
                            >
                                Place Order
                            </button>

                            <p className="text-center text-xs text-gray-500 mt-4">
                                By placing this order, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Checkout;
