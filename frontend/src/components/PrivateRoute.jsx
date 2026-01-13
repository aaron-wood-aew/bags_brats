import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * PrivateRoute - Protects routes that require authentication
 * Redirects to login if no token present
 * Can optionally require admin role
 */
const PrivateRoute = ({ children, requireAdmin = false }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default PrivateRoute;
