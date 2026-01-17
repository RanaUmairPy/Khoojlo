import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Truck, MapPin, Package, Home, ArrowRight } from 'lucide-react';

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId, orderDetails } = location.state || {}; // Expecting { orderId, orderDetails: { ... } }

    if (!orderId) {
        // If accessed directly without state, redirect home
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Order not found</h2>
                    <button onClick={() => navigate('/')} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Go Home</button>
                </div>
            </div>
        );
    }

    const { items, total_amount, shipping_address } = orderDetails || {};
    // Assuming orderDetails follows the structure sent to backend or similar

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">

                {/* Success Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Order Placed Successfully!</h1>
                    <p className="text-gray-600 dark:text-gray-400">Thank you for your purchase. Your order has been confirmed.</p>
                    <div className="mt-4 inline-block px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-sm text-gray-600 dark:text-gray-400">
                        Order ID: <span className="font-bold text-gray-900 dark:text-white">#{orderId}</span>
                    </div>
                </div>

                {/* Order Details Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
                    <div className="p-6 md:p-8">

                        {/* Status Steps */}
                        <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-100 dark:border-gray-700 relative">
                            {/* Simple progress visual */}
                            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-100 dark:bg-gray-700 -z-10"></div>
                            <div className="flex flex-col items-center bg-white dark:bg-gray-800 px-2 lg:px-4 z-10">
                                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center mb-2">
                                    <Package size={16} />
                                </div>
                                <span className="text-xs font-semibold text-green-600">Confirmed</span>
                            </div>
                            <div className="flex flex-col items-center bg-white dark:bg-gray-800 px-2 lg:px-4 z-10">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400 flex items-center justify-center mb-2">
                                    <Truck size={16} />
                                </div>
                                <span className="text-xs font-medium text-gray-500">Shipped</span>
                            </div>
                            <div className="flex flex-col items-center bg-white dark:bg-gray-800 px-2 lg:px-4 z-10">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400 flex items-center justify-center mb-2">
                                    <Home size={16} />
                                </div>
                                <span className="text-xs font-medium text-gray-500">Delivered</span>
                            </div>
                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Shipping Address */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <MapPin size={16} /> Shipping Address
                                </h3>
                                <div className="space-y-1 text-gray-600 dark:text-gray-400 text-sm">
                                    <p className="font-medium text-gray-900 dark:text-white">{shipping_address?.firstName} {shipping_address?.lastName}</p>
                                    <p>{shipping_address?.address}</p>
                                    <p>{shipping_address?.city}, {shipping_address?.zip}</p>
                                    <p>{shipping_address?.phone}</p>
                                    <p>{shipping_address?.email}</p>
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <CheckCircle size={16} /> Payment Summary
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Payment Method</span>
                                        <span className="font-medium text-gray-900 dark:text-white">Cash on Delivery</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            Rs {items?.reduce((s, i) => s + (i.price * i.quantity), 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Shipping</span>
                                        <span className="font-medium text-green-600">Free</span>
                                    </div>
                                    <div className="border-t border-gray-100 dark:border-gray-700 pt-2 flex justify-between items-center mt-2">
                                        <span className="font-bold text-gray-900 dark:text-white">Total Amount</span>
                                        <span className="font-bold text-xl text-blue-600 dark:text-blue-400">Rs {Number(total_amount).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ordered Items */}
                        <div className="mt-8 border-t border-gray-100 dark:border-gray-700 pt-8">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Ordered Items</h3>
                            <div className="space-y-4">
                                {items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 py-2">
                                        <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                                            {item.image && (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</h4>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                            Rs {(item.price * item.quantity).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        Continue Shopping <ArrowRight size={18} />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default OrderSuccess;
