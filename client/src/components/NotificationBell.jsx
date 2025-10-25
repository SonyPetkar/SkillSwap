/* eslint-disable no-unused-vars */
// src/components/NotificationBell.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setNotifications } from '../redux/slices/notificationSlice';
import { Bell, Loader, X } from 'lucide-react'; // Added X just in case
import io from 'socket.io-client';
import NotificationDropdown from './NotificationDropdown';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationBell = ({ className = "" }) => { // Accept className prop for external styling
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // You might want to remove this effect if initial notifications are fetched on ProfilePage load
  useEffect(() => {
    const socket = io('http://localhost:5000/notifications');
    socket.on('new_notification', (notification) => {
      // Assuming setNotifications is designed to ADD new notifications when passed an array
      dispatch(setNotifications((prev) => [...prev, notification])); // Safer dispatch logic
    });
    return () => socket.disconnect();
  }, [dispatch]);

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => setIsDropdownOpen((open) => !open)}
        className="relative transition-all duration-200" // Base class for animation/positioning
        whileTap={{ scale: 0.95 }}
        title={`Notifications (${unreadCount} unread)`}
        aria-expanded={isDropdownOpen}
        aria-controls="notification-dropdown"
      >
        <Bell size={24} className="w-6 h-6" /> {/* Themed Lucide Icon */}
        
        {/* Unread Count Badge (Themed) */}
        {unreadCount > 0 && (
          <motion.span 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-gray-900 shadow-md"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Notification Dropdown (Assume NotificationDropdown is styled separately) */}
      <AnimatePresence>
        {isDropdownOpen && <NotificationDropdown id="notification-dropdown" />}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;