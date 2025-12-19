/* eslint-disable no-unused-vars */
import React, { useRef, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LogIn,
  UserPlus,
  Search,
  Users,
  TrendingUp,
  ArrowDownCircle,
  Zap,
  LayoutDashboard,
  ShieldCheck,
  Globe,
  Award
} from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { loadSlim } from "@tsparticles/slim";
import Particles from "@tsparticles/react";
import Footer from "../components/footer/Footer";

/**
 * A utility component to add our animated gradient styles + Inter font
 */
const AnimatedGradientStyles = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

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

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const howItWorksRef = useRef(null);
  const featuresRef = useRef(null);
  const memberInfoRef = useRef(null);

  const isHowItWorksInView = useInView(howItWorksRef, { once: true, amount: 0.3 });
  const isFeaturesInView = useInView(featuresRef, { once: true, amount: 0.3 });
  const isMemberInfoInView = useInView(memberInfoRef, { once: true, amount: 0.3 });

  useEffect(() => {
    // Check if user is logged in via token
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async () => {}, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen relative w-full bg-gradient-to-br from-gray-900 via-emerald-900 to-black text-gray-200 animate-gradient-shift overflow-x-hidden font-['Inter',_sans-serif]">
      <AnimatedGradientStyles />

      <Particles
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
            move: {
              enable: true,
              speed: 1,
              outModes: { default: "bounce" },
            },
            number: { density: { enable: true, area: 800 }, value: 80 },
            opacity: { value: 0.5 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 3 } },
          },
          detectRetina: true,
        }}
        className="absolute inset-0 z-0"
      />

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-4 relative z-10"
        >
          Skill Swap
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-3xl md:text-4xl font-bold text-white mt-4 mb-6 relative z-10"
        >
          {isLoggedIn ? "Welcome Back, Skill Master!" : "Your Gateway to Collaborative Growth"}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl leading-relaxed relative z-10"
        >
          {isLoggedIn 
            ? "Your journey of continuous learning continues here. Explore new requests from the community or update your teachable skills."
            : "Unlock new potentials by connecting with a vibrant community. Teach what you master, learn what ignites your curiosity, and grow together."
          }
        </motion.p>

        {/* Dynamic Buttons Logic */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.0 }}
          className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-md sm:max-w-none relative z-10"
        >
          {isLoggedIn ? (
            <Link
              to="/profile"
              className="flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-bold text-white text-xl bg-gradient-to-r from-emerald-600 to-teal-600 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-emerald-500/60 transition-all duration-300 hover:scale-105 transform"
            >
              <LayoutDashboard size={24} />
              <span>Go to My Profile</span>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-bold text-white text-lg bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 transform hover:-translate-y-1"
              >
                <LogIn size={20} />
                <span>Join Now</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-bold text-gray-200 text-lg bg-white/10 backdrop-blur-md border border-emerald-700/50 hover:bg-white/20 transition-all duration-300 hover:scale-105 transform hover:-translate-y-1"
              >
                <UserPlus size={20} />
                <span>Sign Up</span>
              </Link>
            </>
          )}
        </motion.div>

        <motion.a
          href="#how-it-works"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="absolute bottom-10 text-gray-400 hover:text-teal-400 transition-colors z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDownCircle size={32} />
          </motion.div>
        </motion.a>
      </div>

      {/* Conditional Info Section for Members Only */}
      <AnimatePresence>
        {isLoggedIn && (
          <motion.section
            ref={memberInfoRef}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10 w-11/12 max-w-6xl mx-auto py-16 px-8 rounded-3xl bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 backdrop-blur-md mb-20"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Platform Insights</h2>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  As a member, you are part of a global network of 5,000+ active learners. Our data shows that members who teach at least one skill learn new subjects 40% faster.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: ShieldCheck, text: "Verified learning sessions and reviews", color: "text-emerald-400" },
                    { icon: Globe, text: "24/7 Access to global knowledge swaps", color: "text-teal-400" },
                    { icon: Award, text: "Earn 'Mastery Badges' for your teaching", color: "text-cyan-400" }
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                       <feat.icon className={feat.color} size={24} />
                       <span className="text-white font-medium">{feat.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-black/40 border border-white/10 text-center">
                  <span className="block text-4xl font-bold text-emerald-400 mb-1">120+</span>
                  <span className="text-gray-400 text-sm uppercase tracking-widest">Categories</span>
                </div>
                <div className="p-6 rounded-2xl bg-black/40 border border-white/10 text-center">
                  <span className="block text-4xl font-bold text-teal-400 mb-1">15k</span>
                  <span className="text-gray-400 text-sm uppercase tracking-widest">Swaps Done</span>
                </div>
                <div className="p-6 rounded-2xl bg-black/40 border border-white/10 text-center col-span-2">
                  <span className="block text-4xl font-bold text-white mb-1">98%</span>
                  <span className="text-gray-400 text-sm uppercase tracking-widest">Satisfaction Rate</span>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        ref={howItWorksRef}
        className="relative z-10 w-11/12 max-w-6xl mx-auto mt-16 mb-20"
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isHowItWorksInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold text-white text-center mb-16"
        >
          {isLoggedIn ? "Keep Progressing" : "Start Your Journey"}
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isHowItWorksInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          {/* ... existing steps 1, 2, 3 ... */}
          <motion.div variants={itemVariants} className="flex flex-col items-center p-6 rounded-xl bg-white/5 shadow-lg">
            <div className="flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md">
              <UserPlus size={36} />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">1. Profile</h3>
            <p className="text-gray-300">Update your portfolio regularly to attract better learning matches.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col items-center p-6 rounded-xl bg-white/5 shadow-lg">
            <div className="flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md">
              <Search size={36} />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">2. Match</h3>
            <p className="text-gray-300">Browse the live library for users offering skills you need right now.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col items-center p-6 rounded-xl bg-white/5 shadow-lg">
            <div className="flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md">
              <Zap size={36} />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">3. Swap</h3>
            <p className="text-gray-300">Engage in sessions and leave reviews to build your community reputation.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        ref={featuresRef}
        className="relative z-10 w-11/12 max-w-6xl mx-auto mt-32 mb-20"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isFeaturesInView ? "visible" : "hidden"}
          className="bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8 md:p-12 border border-emerald-700/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
             {/* ... existing Discovery, Connection, Elevation variants ... */}
             <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} className="flex flex-col items-center p-6 rounded-xl bg-white/5">
                <Search className="text-emerald-400 mb-4" size={48} />
                <h3 className="text-xl font-bold text-white mb-2">Smart Discovery</h3>
                <p className="text-gray-400 text-sm">Filter by skill level, language, and availability.</p>
             </motion.div>
             <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} className="flex flex-col items-center p-6 rounded-xl bg-white/5">
                <Users className="text-teal-400 mb-4" size={48} />
                <h3 className="text-xl font-bold text-white mb-2">Direct Chat</h3>
                <p className="text-gray-400 text-sm">Real-time messaging to coordinate your learning sessions.</p>
             </motion.div>
             <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} className="flex flex-col items-center p-6 rounded-xl bg-white/5">
                <TrendingUp className="text-green-400 mb-4" size={48} />
                <h3 className="text-xl font-bold text-white mb-2">Skill Tracking</h3>
                <p className="text-gray-400 text-sm">Monitor your progress and unlock community achievements.</p>
             </motion.div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;