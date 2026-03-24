import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const token = localStorage.getItem('token');
  // Parse user and provide a fallback to avoid "cannot read property of null"
  const user = token ? JSON.parse(localStorage.getItem('user')) : null;
  const isAdmin = user?.role === 'admin';
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const navLinkClass = ({ isActive }) =>
    `relative block px-3 py-2 rounded-md transition-all duration-300 font-semibold text-base md:text-lg transform hover:-translate-y-0.5 ${
      isActive
        ? 'text-emerald-400 after:content-[""] after:absolute after:left-2 after:right-2 after:bottom-0 after:h-[3px] after:bg-emerald-500 after:rounded-t'
        : 'text-gray-300 hover:text-emerald-300'
    }`;

  const mobileMenuVariants = {
    closed: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeInOut" } },
    open: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeInOut" } }
  };

  const UserAvatar = ({ className = "w-8 h-8" }) => {
    // Look for the profilePicture property specifically
    if (user && user.profilePicture) {
      const imageUrl = user.profilePicture.startsWith('http') 
        ? user.profilePicture 
        : `http://localhost:5000/uploads/profile-pictures/${user.profilePicture}`;
      
      return (
        <img 
          src={imageUrl} 
          alt="Profile" 
          className={`${className} rounded-full object-cover border border-emerald-500/50 shadow-sm`}
          onError={(e) => {
            // Fallback if image path is broken
            e.target.onerror = null; 
            e.target.style.display = 'none';
          }}
        />
      );
    }
    return <UserIcon className="text-emerald-400" size={20} />;
  };

  return (
    <nav className="bg-black/40 backdrop-blur-xl border-b border-emerald-700/50 shadow-lg sticky top-0 z-50 font-['Inter',_sans-serif]">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between p-4 h-20">
        <NavLink
          to="/"
          className="text-3xl font-extrabold text-emerald-400 drop-shadow-md transition-all duration-300 hover:brightness-110"
        >
          SkillSwap
        </NavLink>

        <div className="md:hidden flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-2 text-emerald-400 font-medium text-sm border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 rounded-md">
              <UserAvatar className="w-6 h-6" />
              <span className="truncate max-w-[80px]">{user.name}</span>
            </div>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="focus:outline-none text-gray-300 hover:text-emerald-300 transition-colors p-1"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        <div className="hidden md:flex flex-1 justify-end items-center">
          <div className="flex flex-row space-x-5 lg:space-x-8 items-center">
            <NavLink to="/" className={navLinkClass}>Home</NavLink>
            {token ? (
              <>
                <NavLink to="/profile" className={navLinkClass}>Profile</NavLink>
                <NavLink to="/skill-matching" className={navLinkClass}>Find Swaps</NavLink>
                <NavLink to="/chat" className={navLinkClass}>Chat</NavLink>
                {isAdmin && (
                  <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
                )}
                
                <div className="flex items-center space-x-3 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  <UserAvatar className="w-8 h-8" />
                  <span className="font-medium text-sm lg:text-base">{user?.name}</span>
                </div>

                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05, y: -2, boxShadow: "0 6px 20px rgba(16, 185, 129, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 px-5 py-2.5 rounded-lg font-semibold text-white text-base shadow-md"
                >
                  Logout
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

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            className="md:hidden absolute top-full left-0 w-full bg-black/75 backdrop-blur-lg border-b border-emerald-700/50 shadow-xl pb-5 pt-3"
          >
            <div className="flex flex-col space-y-3 px-5 items-center">
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
                    className="w-full mt-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 px-4 py-2.5 rounded-lg font-semibold text-white transition-all duration-300 text-base active:scale-95"
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