// src/redux/slices/notificationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = Array.isArray(action.payload) ? action.payload : [];
      state.unreadCount = state.notifications.filter(n => n && !n.isRead).length;
    },

    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },

    markAsRead: (state, action) => {
      const notif = state.notifications.find(n => n._id === action.payload);
      if (notif && !notif.isRead) {
        notif.isRead = true;
        state.unreadCount -= 1;
      }
    },
  },
});

export const { setNotifications, addNotification, markAsRead } =
  notificationSlice.actions;

export default notificationSlice.reducer;
