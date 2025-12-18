import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Base from "./Screens/base";
import Signup from "./Auth/signup";
import Cart from "./Pages/Cart";
import Login from "./Auth/login";
import SellerDashboard from "./Seller/SellerDashboard";
import SellerLogin from "./Seller/SellerLogin";

function App() {
  console.log("App rendered");
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
