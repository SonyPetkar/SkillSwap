/* eslint-disable no-unused-vars */
import React, { useState, useCallback } from "react";
// Removed 'react-redux' imports as they are causing compilation errors.
// The app's logic will be maintained with local state (isLoading).
import axios from "axios";
// Removed 'useNavigate' and 'Link' from 'react-router-dom' to fix router context errors.
// Navigation will be handled by 'window.location.href'.
import { Mail, Lock, Eye, EyeOff, Loader } from "lucide-react"; // Replaced with lucide-react, added Loader
import { motion } from "framer-motion";
// Removed 'jwt-decode' as it was causing a compilation error.
// Role-based navigation will be simplified to a single redirect.

// Removed 'tsparticles' imports as they were causing compilation errors.
// The particle background will be omitted to ensure the component compiles.

/**
 * A utility component to add our animated gradient styles.
 * This keeps the main component clean.
 */
const AnimatedGradientStyles = () => (
  <style>
    {`
      @keyframes gradient-shift {
        0%, 100% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
      }

      .animate-gradient-shift {
        background-size: 200% 200%;
        animation: gradient-shift 15s ease infinite;
      }
    `}
  </style>
);

const LoginPage = () => {
  // Removed 'dispatch' as Redux is not available in this environment.
  // Removed 'useNavigate' hook.
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Use local state for loading

  // Particle logic removed as it was causing compilation errors.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setIsLoading(true); // Set loading state

    // Field validation (logic unchanged)
    if (!email.trim()) {
      setError("Please enter your email address.");
      setIsLoading(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }
    if (!password.trim()) {
      setError("Password is required.");
      setIsLoading(false);
      return;
    }

    // API call (logic updated to remove Redux)
    try {
      // This is the real API call
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      const token = response.data.token;
      
      // Removed 'jwt-decode' logic.
      // The role-based redirect can no longer be performed.

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        name: response.data.name,
        email: response.data.email,
        _id: response.data.id,
        // Role property cannot be determined without jwt-decode
      }));

      // Redux dispatch removed.

      // Redirect based on role (logic simplified)
      // Since we cannot use 'useNavigate', we'll use window.location to redirect.
      // This will cause a full page reload, but it resolves the error.
      window.location.href = '/profile';

    } catch (err) {
      const errorMessage = err.response?.data?.msg || "Something went wrong!";
      // Redux dispatch removed.
      setError(errorMessage);
    } finally {
      setIsLoading(false); // Stop loading state
    }
  };

  return (
    <>
      <AnimatedGradientStyles />
      {/* Updated background gradient and font to match Home */}
      <div className="relative flex items-center justify-center min-h-screen w-full px-4 py-12 bg-gradient-to-br from-gray-900 via-emerald-900 to-black text-gray-200 animate-gradient-shift overflow-hidden font-['Inter',_sans-serif]">
        
        {/* Particle background removed to fix compile errors */}
        
        {/* Main Login Card with Glassmorphism Effect */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          // Updated border color to match theme
          className="relative z-10 w-full max-w-md bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-emerald-700/50"
        >
          {/* Header */}
          <div className="text-center mb-8">
            {/* Updated gradient text to match theme */}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-2">
              Skill Swap
            </h1>
            <p className="text-gray-400 text-lg">
              Welcome back to the community
            </p>
          </div>

          {/* Login Box */}
          <div>
            <h2 className="text-3xl font-semibold text-white text-center mb-6">
              Sign In
            </h2>
            
            {/* Error Message (Styling is universal, no change needed) */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 font-medium text-center mb-4 bg-red-900/30 p-3 rounded-lg border border-red-700/50"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="relative">
                <Mail className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (
                      error === "Please enter your email address." ||
                      error === "Please enter a valid email address."
                    ) {
                      setError(""); // Clear error when user starts typing
                    }
                  }}
                  // Updated input styling to match theme
                  className="pl-12 pr-4 py-3 w-full rounded-lg border border-emerald-700/50 outline-none text-lg text-gray-200 bg-transparent placeholder-gray-400 focus:bg-white/10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 disabled:opacity-50"
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <Lock className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error === "Password is required.") {
                      setError(""); // Clear error when user starts typing
                    }
                  }}
                  // Updated input styling to match theme
                  className="pl-12 pr-12 py-3 w-full rounded-lg border border-emerald-700/50 outline-none text-lg text-gray-200 bg-transparent placeholder-gray-400 focus:bg-white/10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 disabled:opacity-50"
                  disabled={isLoading}
                />
                <div
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-emerald-400 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {/* Updated icons */}
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                // Updated button gradient and hover/focus effects to match theme
                className="w-full flex items-center justify-center bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 text-lg hover:scale-105 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 disabled:opacity-70 disabled:hover:scale-100 disabled:hover:-translate-y-0 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader className="w-6 h-6" />
                  </motion.div>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="text-center mt-8">
              <p className="text-base text-gray-400">
                Don't have an account?{" "}
                {/* Replaced 'Link' with 'a' tag to fix router context error */}
                <a 
                  href="/register" 
                  className={`font-medium text-emerald-400 hover:text-emerald-300 transition-colors duration-300 ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
                  onClick={(e) => {
                    if (isLoading) e.preventDefault(); // Prevent navigation while loading
                    // To prevent full page reload if it's part of a router elsewhere,
                    // but for this context, standard href is fine.
                  }}
                >
                  Register here
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;

