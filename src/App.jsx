import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Base from "./Screens/base";
import Signup from "./Auth/signup";
import Cart from "./Pages/Cart";
import Login from "./Auth/login";
import SellerDashboard from "./Seller/SellerDashboard";
import SellerLogin from "./Seller/SellerLogin";
import { apiFetch } from "./base_api";

function App() {
  console.log("App rendered");

  useEffect(() => {
    // Keep-alive mechanism to prevent free backend instance from sleeping
    // Keep-alive mechanism to prevent free backend instance from sleeping
    const PING_INTERVAL = 10000; // 5 seconds

    const pingValues = async () => {
      try {
        console.log(`[Keep-Alive] Pinging backend at ${new Date().toLocaleTimeString()}...`);
        await apiFetch('/v2/products/');
        console.log('[Keep-Alive] Ping successful');
      } catch (err) {
        console.warn('[Keep-Alive] Ping failed (this is expected if network is down)', err);
      }
    };

    // Ping immediately on mount
    pingValues();

    // Set interval
    const intervalId = setInterval(pingValues, PING_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<Base />} />
        <Route path="signup/" element={<Signup />} />
        <Route path="login/" element={<Login />} />
        <Route path="seller/" element={<SellerDashboard />} />
        <Route path="seller-login/" element={<SellerLogin />} />
      </Routes>
    </Router>
  );
}

export default App;
