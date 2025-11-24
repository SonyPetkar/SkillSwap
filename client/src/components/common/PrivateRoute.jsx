// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ element, children, requiredRole }) => {
    const token = localStorage.getItem('token');
    const location = useLocation();
    
    // Safety check: localStorage.getItem('user') might return null, so we handle the parse error.
    let user = null;
    const userString = localStorage.getItem('user');
    if (userString) {
        try {
            user = JSON.parse(userString);
        } catch (e) {
            console.error("Error parsing user data from localStorage:", e);
            // If parse fails, treat as unauthenticated to force login/refresh
            return <Navigate to="/login" replace />;
        }
    }

    // 1. Authentication Check
    if (!token) {
        // Redirect to login if token is missing
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Role Check
    // FIX: Use optional chaining (`?.`) to safely access `role`. 
    // This prevents crashes if `user` is null/undefined in localStorage.
    if (requiredRole && user?.role !== requiredRole) {
        console.warn(`Access denied. User role '${user?.role}' does not match required role '${requiredRole}'.`);
        // Redirect to a safe page (home or their own profile)
        return <Navigate to="/" replace />;
    }

    // 3. Render Content
    // Use the element prop for single routes, or children for nested routes
    return element || children;
};

export default PrivateRoute;