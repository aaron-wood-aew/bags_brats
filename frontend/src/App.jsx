import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './pages/Login';
import Register from './pages/Register';
import PlayerDashboard from './pages/PlayerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SpectatorView from './pages/SpectatorView';
import OAuthCallback from './pages/OAuthCallback';
import UserSettings from './pages/UserSettings';
import BigReveal from './pages/BigReveal';
import PrivateRoute from './components/PrivateRoute';

// Set up global Axios interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isLoginRequest = error.config?.url?.endsWith('/auth/login') || error.config?.url?.endsWith('/login');
      if (!isLoginRequest) {
        // Clear stale local storage session
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Gracefully notify and redirect
        alert("Your session has expired. Please log in again.");
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const App = () => {
  return (
    <Router>
      <div style={{ minHeight: '100vh', padding: '20px' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <UserSettings />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <PlayerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute requireAdmin>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/reveal"
            element={
              <PrivateRoute requireAdmin>
                <BigReveal />
              </PrivateRoute>
            }
          />
          <Route path="/spectator" element={<SpectatorView />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

