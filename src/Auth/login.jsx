import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../base_api"; // ✅ Axios instance

// Memoized NavLink
const NavLinkMemo = React.memo(
  ({ href, children, className = "", onClick = () => {} }) => (
    <a
      href={href}
      onClick={(e) => {
        if (e && typeof e.preventDefault === "function") e.preventDefault();
        try {
          onClick(e);
        } catch (err) {}
      }}
      className={className}
    >
      {children}
    </a>
  )
);

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/v1/login/", formData);

      if (response.status === 200) {
        const data = response.data;

        // ✅ Store tokens & user info in localStorage
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        localStorage.setItem("user", JSON.stringify({
          id: data.user_id,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          profile_picture: data.profile_picture,
          country: data.country,
          contact_number: data.contact_number,
        }));

        // Redirect to homepage or dashboard
        navigate("/");
      }
    } catch (err) {
      if (err.response?.data) {
        setError(
          err.response.data.message ||
            err.response.data.detail ||
            "Invalid email or password."
        );
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="w-full flex justify-center items-center py-4 bg-white shadow-md">
        <NavLinkMemo
          href="/"
          className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-1 sm:gap-2 shrink-0 transform hover:scale-105 text-red-600"
        >
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 animate-pulse text-red-600" />
          Casti
        </NavLinkMemo>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden max-w-4xl w-full">
          {/* Left Side Image */}
          <div className="w-1/2 hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
              alt="login"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Side Form */}
          <div className="w-full md:w-1/2 p-8">
            <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
              Login to your account
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-300 mb-6">
              Enter your email and password to continue.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 dark:bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 dark:hover:bg-red-600 transition"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* Error message */}
            {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

            <p className="mt-6 text-sm text-gray-600 dark:text-gray-300 text-center">
              Don't have an account?{" "}
              <a href="/signup" className="text-red-500 hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
