import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ Import navigation hook
import api from "../base_api";

// ✅ Memoized NavLink
const NavLinkMemo = React.memo(
  ({ href, children, className = "", onClick = () => {} }) => (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        try {
          onClick(e);
        } catch (err) {
          console.error("NavLink error:", err);
        }
      }}
      className={className}
    >
      {children}
    </a>
  )
);

const Signup = () => {
  const navigate = useNavigate(); // ✅ Initialize navigate hook

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    profile_picture: null,
    country: "",
    contact_number: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // can be object or string
  const [success, setSuccess] = useState("");

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile_picture") {
      setFormData({ ...formData, profile_picture: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ✅ Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess("");
    setLoading(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      const response = await api.post("/v1/signup/", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201 || response.status === 200) {
        setSuccess(response.data.message || "User created successfully!");
        setError(null);
        console.log("✅ Response:", response.data);

        // ✅ Redirect to login after short delay
        setTimeout(() => {
          navigate("/login"); // redirect user to login page
        }, 1500);
      }
    } catch (err) {
      if (err.response?.data) {
        setError(err.response.data); // backend validation errors
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="w-full flex justify-center items-center py-4 bg-red-600 shadow-md">
        <NavLinkMemo
          href="/"
          onClick={() => (window.location.href = "/")}
          className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 transform hover:scale-105 text-white"
        >
          <Sparkles className="h-6 w-6 md:h-7 md:w-7 animate-pulse text-white" />
          Casti
        </NavLinkMemo>
      </header>

      {/* Signup Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden max-w-4xl w-full">
          {/* Left Side Image */}
          <div className="w-1/2 hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
              alt="signup"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Side Form */}
          <div className="w-full md:w-1/2 p-8">
            <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
              Create your account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  name="first_name"
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-1/2 border rounded-lg px-3 py-2"
                  required
                />
                <input
                  type="text"
                  name="last_name"
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-1/2 border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />

              <input
                type="password"
                name="confirm_password"
                placeholder="Confirm Password"
                value={formData.confirm_password}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />

              <input
                type="text"
                name="country"
                placeholder="Country"
                value={formData.country}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />

              <input
                type="text"
                name="contact_number"
                placeholder="Contact Number"
                value={formData.contact_number}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />

              <input
                type="file"
                name="profile_picture"
                accept="image/*"
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
              >
                {loading ? "Signing up..." : "Sign Up"}
              </button>
            </form>

            {/* ✅ Show Errors */}
            {error && (
              <div className="mt-4 text-red-500 text-sm space-y-1">
                {typeof error === "string"
                  ? error
                  : Object.keys(error).map((key) => (
                      <p key={key}>
                        <strong>{key}:</strong>{" "}
                        {Array.isArray(error[key]) ? error[key][0] : error[key]}
                      </p>
                    ))}
              </div>
            )}

            {/* ✅ Show Success */}
            {success && (
              <p className="text-green-500 mt-4 text-sm">
                {success} <br />
                Redirecting to login...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
