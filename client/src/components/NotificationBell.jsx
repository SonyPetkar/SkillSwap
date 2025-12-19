/* eslint-disable no-unused-vars */
// src/components/NotificationBell.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setNotifications, addNotification } from '../redux/slices/notificationSlice';
import { Bell, Loader, X } from 'lucide-react';
import io from 'socket.io-client';
import NotificationDropdown from './NotificationDropdown';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationBell = ({ className = "" }) => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const socket = io('http://localhost:5000/notifications');

    socket.on('new_notification', (notification) => {
      // ✅ FIX: dispatch plain object, not function
      dispatch(addNotification(notification));
    });

    return () => socket.disconnect();
  }, [dispatch]);

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => setIsDropdownOpen((open) => !open)}
        className="relative transition-all duration-200"
        whileTap={{ scale: 0.95 }}
        title={`Notifications (${unreadCount} unread)`}
        aria-expanded={isDropdownOpen}
        aria-controls="notification-dropdown"
      >
        <Bell size={24} className="w-6 h-6" />

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

      <AnimatePresence>
        {isDropdownOpen && <NotificationDropdown id="notification-dropdown" />}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
