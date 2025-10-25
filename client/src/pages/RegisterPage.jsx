/* eslint-disable no-unused-vars */
import React, { useState, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
// Swapped to lucide-react icons to match theme
import { User, Mail, Lock, Eye, EyeOff, Loader } from "lucide-react";

// Particle imports removed as they are causing compilation errors.
// import { loadSlim } from "@tsparticles/slim";
// import Particles from "@tsparticles/react";

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


const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // For loading state

  // Particle logic removed.
  // const particlesInit = useCallback(async (engine) => {
  //   await loadSlim(engine);
  // }, []);

  // const particlesLoaded = useCallback(async () => {}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    // Field validation (logic unchanged)
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password.trim() || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setIsLoading(true); // Start loading
    try {
      await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name,
          email,
          password,
        }
      );
      setSuccessMessage("Registration successful! You can now log in.");

      // Clear the fields after successful registration
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.msg || "Something went wrong!");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <>
      <AnimatedGradientStyles />
      {/* Main container with themed background and font */}
      <div className="relative flex items-center justify-center min-h-screen w-full px-4 py-12 bg-gradient-to-br from-gray-900 via-emerald-900 to-black text-gray-200 animate-gradient-shift overflow-hidden font-['Inter',_sans-serif]">
        
        {/* Particle background removed to fix compilation errors */}
        {/* <Particles
          id="tsparticles"
          init={particlesInit}
          loaded={particlesLoaded}
          options={{
            background: { color: { value: "transparent" } },
            fpsLimit: 120,
            interactivity: {
              events: {
                onClick: { enable: true, mode: "push" },
                onHover: { enable: true, mode: "repulse" },
                resize: true,
              },
              modes: {
                push: { quantity: 4 },
                repulse: { distance: 100, duration: 0.4 },
              },
            },
            particles: {
              color: { value: "#10b981" },
              links: {
                color: "#0d9488",
                distance: 150,
                enable: true,
                opacity: 0.4,
                width: 1,
              },
              collisions: { enable: false },
              move: {
                direction: "none",
                enable: true,
                outModes: { default: "bounce" },
                random: false,
                speed: 1,
                straight: false,
              },
              number: { density: { enable: true, area: 800 }, value: 80 },
              opacity: { value: 0.5 },
              shape: { type: "circle" },
              size: { value: { min: 1, max: 3 } },
            },
            detectRetina: true,
          }}
          className="absolute inset-0 z-0"
        /> */}

        {/* Main Register Card with Glassmorphism Effect */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          // Themed border
          className="relative z-10 w-full max-w-md bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-emerald-700/50"
        >
          {/* Header */}
          <div className="text-center mb-8">
            {/* Themed gradient text */}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-2">
              Skill Swap
            </h1>
            <p className="text-gray-400 text-lg">
              Join the community
            </p>
          </div>

          {/* Register Box */}
          <div>
            <h2 className="text-3xl font-semibold text-white text-center mb-6">
              Create Account
            </h2>
            
            {/* Success Message */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                // Themed success message box
                className="text-green-300 font-medium text-center mb-4 bg-green-900/30 p-3 rounded-lg border border-green-700/50"
              >
                {successMessage}
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                // Themed error message box
                className="text-red-400 font-medium text-center mb-4 bg-red-900/30 p-3 rounded-lg border border-red-700/50"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Name Field */}
              <div className="relative">
                <User className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error === "Please enter your full name.") setError("");
                  }}
                  autoComplete="off"
                  // Themed input
                  className="pl-12 pr-4 py-3 w-full rounded-lg border border-emerald-700/50 outline-none text-lg text-gray-200 bg-transparent placeholder-gray-400 focus:bg-white/10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 disabled:opacity-50"
                  disabled={isLoading}
                />
              </div>

              {/* Email Field */}
              <div className="relative">
                <Mail className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error === "Please enter a valid email address.") setError("");
                  }}
                  autoComplete="off"
                  // Themed input
                  className="pl-12 pr-4 py-3 w-full rounded-lg border border-emerald-700/50 outline-none text-lg text-gray-200 bg-transparent placeholder-gray-400 focus:bg-white/10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 disabled:opacity-50"
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <Lock className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password (min. 6 characters)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error === "Password must be at least 6 characters long.") setError("");
                  }}
                  autoComplete="new-password"
                  // Themed input
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

              {/* Confirm Password Field */}
              <div className="relative">
                <Lock className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error === "Passwords do not match!") setError("");
                  }}
                  autoComplete="new-password"
                  // Themed input
                  className="pl-12 pr-12 py-3 w-full rounded-lg border border-emerald-700/50 outline-none text-lg text-gray-200 bg-transparent placeholder-gray-400 focus:bg-white/10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 disabled:opacity-50"
                  disabled={isLoading}
                />
                <div
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-emerald-400 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                // Themed button
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
                  'Register'
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-8">
              <p className="text-base text-gray-400">
                Already have an account?{" "}
                {/* Themed link (using 'a' tag to avoid router errors) */}
                <a 
                  href="/login" 
                  className={`font-medium text-emerald-400 hover:text-emerald-300 transition-colors duration-300 ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
                  onClick={(e) => {
                    if (isLoading) e.preventDefault();
                  }}
                >
                  Login here
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default RegisterPage;

