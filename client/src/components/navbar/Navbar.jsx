import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'; // Using motion for animations

const Navbar = () => {
  // State, user info, admin check, and logout logic remain exactly the same
  const token = localStorage.getItem('token');
  const user = token ? JSON.parse(localStorage.getItem('user')) : null;
  const isAdmin = user?.role === 'admin';
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Navigation logic remains the same
  };

  // Refined NavLink styling within the theme
  const navLinkClass = ({ isActive }) =>
    `relative block px-3 py-2 rounded-md transition-all duration-300 font-semibold text-base md:text-lg transform hover:-translate-y-0.5 ${ // Kept hover lift
      isActive
        ? 'text-emerald-400 after:content-[""] after:absolute after:left-2 after:right-2 after:bottom-0 after:h-[3px] after:bg-emerald-500 after:rounded-t' // Slightly adjusted underline
        : 'text-gray-300 hover:text-emerald-300'
    }`;

  // Mobile menu animation variants remain the same
  const mobileMenuVariants = {
    closed: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeInOut" } },
    open: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeInOut" } }
  };

  return (
    // Navbar styling consistent with the dark/emerald glassmorphism theme
    <nav className="bg-black/40 backdrop-blur-xl border-b border-emerald-700/50 shadow-lg sticky top-0 z-50 font-['Inter',_sans-serif]">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between p-4 h-20">
        {/* Logo with subtle hover effect */}
        <NavLink
          to="/"
          className="text-3xl font-extrabold text-emerald-400 drop-shadow-md transition-all duration-300 hover:brightness-110"
        >
          SkillSwap {/* Text remains "SkillSwap" */}
        </NavLink>

        {/* Hamburger menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="focus:outline-none text-gray-300 hover:text-emerald-300 transition-colors p-1" // Added padding for easier tap
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Links container - Desktop */}
        <div className="hidden md:flex flex-1 justify-end items-center">
          <div className="flex flex-row space-x-5 lg:space-x-8 items-center">
            {/* All NavLink options and 'to' props remain exactly the same */}
            <NavLink to="/" className={navLinkClass}>Home</NavLink>
            {token ? (
              <>
                <NavLink to="/profile" className={navLinkClass}>Profile</NavLink>
                <NavLink to="/skill-matching" className={navLinkClass}>Find Swaps</NavLink>
                <NavLink to="/chat" className={navLinkClass}>Chat</NavLink>
                {isAdmin && (
                  <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
                )}
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05, y: -2, boxShadow: "0 6px 20px rgba(16, 185, 129, 0.5)" }} // Slightly stronger shadow
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 px-5 py-2.5 rounded-lg font-semibold text-white text-base shadow-md"
                >
                  Logout {/* Text remains "Logout" */}
                </motion.button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass}>Login</NavLink>
                <NavLink to="/register" className={navLinkClass}>Sign Up</NavLink>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown with Animation */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            // Slightly increased blur and darker background for better readability
            className="md:hidden absolute top-full left-0 w-full bg-black/75 backdrop-blur-lg border-b border-emerald-700/50 shadow-xl pb-5 pt-3"
          >
            <div className="flex flex-col space-y-3 px-5 items-center"> {/* Adjusted padding/spacing */}
              {/* All mobile NavLink options remain the same */}
              <NavLink to="/" className={navLinkClass} onClick={() => setMenuOpen(false)}>Home</NavLink>
              {token ? (
                <>
                  <NavLink to="/profile" className={navLinkClass} onClick={() => setMenuOpen(false)}>Profile</NavLink>
                  <NavLink to="/search" className={navLinkClass} onClick={() => setMenuOpen(false)}>Find Swaps</NavLink>
                  <NavLink to="/chat" className={navLinkClass} onClick={() => setMenuOpen(false)}>Chat</NavLink>
                  {isAdmin && (
                    <NavLink to="/admin" className={navLinkClass} onClick={() => setMenuOpen(false)}>Admin</NavLink>
                  )}
                  <button
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="w-full mt-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 px-4 py-2.5 rounded-lg font-semibold text-white transition-all duration-300 text-base active:scale-95" // Added active scale
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={navLinkClass} onClick={() => setMenuOpen(false)}>Login</NavLink>
                  <NavLink to="/register" className={navLinkClass} onClick={() => setMenuOpen(false)}>Sign Up</NavLink>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;