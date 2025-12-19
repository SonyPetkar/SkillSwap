/* eslint-disable no-unused-vars */
import React, { useState, useCallback } from "react";
import axios from "axios";
import { Mail, Lock, Eye, EyeOff, Loader } from "lucide-react";
import { motion } from "framer-motion";

const AnimatedGradientStyles = () => (
  <style>
    {`
      @keyframes gradient-shift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      .animate-gradient-shift {
        background-size: 200% 200%;
        animation: gradient-shift 15s ease infinite;
      }
    `}
  </style>
);

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 
    setIsLoading(true);

    // 1. Email validation
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

    // 2. Password format validation (Matched with RegisterPage)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    
    if (!password.trim()) {
      setError("Password is required.");
      setIsLoading(false);
      return;
    }

    if (!passwordRegex.test(password)) {
      setError("Invalid password format. Check your credentials.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      const token = response.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        name: response.data.name,
        email: response.data.email,
        _id: response.data.id,
      }));

      window.location.href = '/profile';

    } catch (err) {
      const errorMessage = err.response?.data?.msg || "Something went wrong!";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatedGradientStyles />
      <div className="relative flex items-center justify-center min-h-screen w-full px-4 py-12 bg-gradient-to-br from-gray-900 via-emerald-900 to-black text-gray-200 animate-gradient-shift overflow-hidden font-['Inter',_sans-serif]">
        
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-emerald-700/50"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-2">
              Skill Swap
            </h1>
            <p className="text-gray-400 text-lg">
              Welcome back to the community
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-semibold text-white text-center mb-6">
              Sign In
            </h2>
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 font-medium text-center mb-4 bg-red-900/30 p-3 rounded-lg border border-red-700/50 text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Mail className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error.includes("email")) setError("");
                  }}
                  className="pl-12 pr-4 py-3 w-full rounded-lg border border-emerald-700/50 outline-none text-lg text-gray-200 bg-transparent placeholder-gray-400 focus:bg-white/10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 disabled:opacity-50"
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <Lock className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error.includes("password") || error.includes("format")) setError("");
                  }}
                  className="pl-12 pr-12 py-3 w-full rounded-lg border border-emerald-700/50 outline-none text-lg text-gray-200 bg-transparent placeholder-gray-400 focus:bg-white/10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 disabled:opacity-50"
                  disabled={isLoading}
                />
                <div
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-emerald-400 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </div>
              </div>

              <button
                type="submit"
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

            <div className="text-center mt-8">
              <p className="text-base text-gray-400">
                Don't have an account?{" "}
                <a 
                  href="/register" 
                  className={`font-medium text-emerald-400 hover:text-emerald-300 transition-colors duration-300 ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
                  onClick={(e) => { if (isLoading) e.preventDefault(); }}
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