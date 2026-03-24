/* eslint-disable no-unused-vars */
import React, { useState } from "react";
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

    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: email.trim(),
        password: password,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        name: response.data.name,
        email: response.data.email,
        _id: response.data.id,
      }));

      window.location.href = '/profile';

    } catch (err) {
      const backendErrors = err.response?.data?.errors;
      const errorMessage = backendErrors 
        ? backendErrors[0].msg 
        : (err.response?.data?.msg || "Login failed.");
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatedGradientStyles />
      <div className="relative flex items-center justify-center min-h-screen w-full px-4 py-12 bg-gradient-to-br from-gray-900 via-emerald-900 to-black text-gray-200 animate-gradient-shift overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-emerald-700/50"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-8 text-center">Skill Swap</h1>
          
          {error && (
            <div className="text-red-400 text-center mb-4 bg-red-900/30 p-3 rounded-lg border border-red-700/50 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Mail className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 pr-4 py-3 w-full rounded-lg border border-emerald-700/50 bg-transparent text-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="relative">
              <Lock className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 pr-12 py-3 w-full rounded-lg border border-emerald-700/50 bg-transparent text-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <div className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-gray-400" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-all flex justify-center items-center disabled:opacity-50"
            >
              {isLoading ? <Loader className="animate-spin" /> : "Login"}
            </button>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;