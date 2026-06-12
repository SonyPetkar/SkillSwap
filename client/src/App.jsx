// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // <-- Added Navigate
import HomePage from './pages/HomePage';
import LoginPage  from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import SkillMatchingPage from './pages/SkillMatchingPage';
import ChatPage from './pages/ChatPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage'; 
import UserManagement from './components/admin/UserManagement';
import ReportManagement from './components/admin/ReportManagement';
import AnalyticsOverview from './components/admin/AnalyticsOverview';
import AdminProfile from './pages/AdminProfilePage'; 
import EngagementAnalytics from './components/admin/EngagementAnalytics';
import AboutUsPage from "./pages/AboutUSPage";
import ScrollToTop from "./components/ScrollToTop";
import PrivateRoute from './components/common/PrivateRoute';
import UserProfilePage from './pages/ProfilePage'; 
import NotFoundPage from './pages/NotFoundPage';  

import "./App.css";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        
        <Route path="/user/:userId" element={<UserProfilePage />} /> 

        {/* Protected User Routes */}
        <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />
        <Route path="/skill-matching" element={<PrivateRoute element={<SkillMatchingPage />} />} />
        <Route path="/chat" element={<PrivateRoute element={<ChatPage />} />} />
        <Route path="/chat/:sessionId" element={<PrivateRoute element={<ChatPage />} />} />
        <Route path="/profile-settings" element={<PrivateRoute element={<ProfileSettingsPage />} />} />

        {/* Admin Dashboard with Nested Routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute
              element={<AdminDashboardPage />}
              requiredRole="admin" // <-- Protects the entire /admin tree
            />
          }
        >
          {/* 🆕 ADDED: Automatically redirect /admin to /admin/users */}
          <Route index element={<Navigate to="users" replace />} />
          
          <Route path="users" element={<UserManagement />} />
          <Route path="reports" element={<ReportManagement />} />
          <Route path="analytics" element={<AnalyticsOverview />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="engagement-analytics" element={<EngagementAnalytics />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;