import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * OAuthCallback - Handles redirect from Google OAuth
 * Receives token in URL params and stores in localStorage
 */
const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = searchParams.get('token');
        const userId = searchParams.get('user_id');
        const name = searchParams.get('name');
        const role = searchParams.get('role');
        const errorParam = searchParams.get('error');

        if (errorParam) {
            setError(errorParam);
            setTimeout(() => navigate('/login'), 3000);
            return;
        }

        if (token && userId) {
            // Store auth data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({
                _id: userId,
                name: name,
                role: role
            }));

            // Redirect to dashboard
            navigate('/dashboard');
        } else {
            setError('Authentication failed');
            setTimeout(() => navigate('/login'), 3000);
        }
    }, [searchParams, navigate]);

    if (error) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                color: 'var(--text-color)'
            }}>
                <h2>Authentication Failed</h2>
                <p>{error}</p>
                <p>Redirecting to login...</p>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            color: 'var(--text-color)'
        }}>
            <h2>Signing you in...</h2>
            <div className="loading-spinner" />
        </div>
    );
};

export default OAuthCallback;
