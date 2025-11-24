// skill-swap/client/src/pages/NotFoundPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar'; 
import Footer from '../components/footer/Footer'; // <--- Ensure you import Footer

const NotFoundPage = () => {
  return (
    // Use min-h-screen to ensure the page takes full height
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-200 font-['Inter',_sans-serif]">
      
      {/* 1. Navbar */}
      <Navbar />
      
      {/* 2. Main Content Area (flex-1 makes it take up remaining vertical space) */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        
        {/* The content itself should not have the MT adjustment anymore */}
        <div className="text-center z-10"> 
          <h1 className="text-9xl font-extrabold text-emerald-500 mb-4 animate-pulse">404</h1>
          <h2 className="text-4xl font-bold text-white mb-4">Page Not Found</h2>
          <p className="text-lg text-gray-400 mb-8">
            Oops! The skill swap you were looking for doesn't seem to exist here.
          </p>
          <div className="space-x-4">
            <Link 
              to="/" 
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition shadow-lg"
            >
              Go to Home
            </Link>
            <Link 
              to="/profile" 
              className="px-6 py-3 bg-gray-700 text-gray-200 rounded-lg font-semibold hover:bg-gray-600 transition shadow-lg"
            >
              Go to Profile
            </Link>
          </div>
        </div>
      </main>

      {/* 3. Footer */}
      <Footer /> 
    </div>
  );
};

export default NotFoundPage;