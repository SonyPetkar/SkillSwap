/* eslint-disable no-unused-vars */
import React, { useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  LogIn,
  UserPlus,
  Search,
  Users,
  TrendingUp,
  ArrowDownCircle,
  Zap,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
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

const Home = () => {
  const howItWorksRef = useRef(null);
  const featuresRef = useRef(null);
  const isHowItWorksInView = useInView(howItWorksRef, { once: true, amount: 0.3 });
  const isInView = useInView(featuresRef, { once: true, amount: 0.3 });

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
          Your Gateway to Collaborative Growth
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl leading-relaxed relative z-10"
        >
          Unlock new potentials by connecting with a vibrant community.{" "}
          <br className="hidden sm:inline" /> Teach what you master, learn what
          ignites your curiosity, and grow together in a world of shared
          knowledge.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="relative z-10 w-full max-w-lg mb-10"
        >
          <div className="relative p-1 rounded-lg bg-black/20 backdrop-blur-md border border-emerald-700/50 shadow-lg">
            <input
              type="text"
              readOnly
              placeholder="What do you want to learn today?"
              className="w-full py-3 pl-5 pr-20 bg-transparent text-white placeholder-gray-400 outline-none"
            />
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.0 }}
          className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-md sm:max-w-none relative z-10"
        >
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
          Start Your Journey
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isHowItWorksInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center p-6 rounded-xl bg-white/5 shadow-lg"
          >
            <div className="flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md">
              <UserPlus size={36} />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              1. Create Your Profile
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Sign up and showcase the skills you can teach and the ones you're
              eager to learn.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center p-6 rounded-xl bg-white/5 shadow-lg"
          >
            <div className="flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md">
              <Search size={36} />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              2. Find Your Match
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Our smart algorithm suggests the best peers for you to connect
              with based on your skills.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center p-6 rounded-xl bg-white/5 shadow-lg"
          >
            <div className="flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md">
              <Zap size={36} />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              3. Connect & Grow
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Schedule sessions, chat with your partners, and start swapping
              knowledge immediately.
            </p>
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
          animate={isInView ? "visible" : "hidden"}
          className="bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8 md:p-12 border border-emerald-700/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -8, rotateZ: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              className="flex flex-col items-center p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md">
                <Search size={36} />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">
                Discover Skills
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Dive into a rich library of peer-offered skills, from coding to
                cooking. Your next passion project awaits!
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -8, rotateZ: -1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              className="flex flex-col items-center p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md">
                <Users size={36} />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">
                Forge Connections
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Our intelligent matching algorithm connects you with ideal
                learning partners who share your ambitions and expertise.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -8, rotateZ: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              className="flex flex-col items-center p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 text-white shadow-md">
                <TrendingUp size={36} />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">
                Elevate Together
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Beyond learning, it's about mutual growth. Teach, collaborate,
                and ascend to new levels of mastery with your peers.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
