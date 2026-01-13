import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import API_URL from '../config';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });
            localStorage.setItem('token', res.data.access_token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: '40px', width: '100%', maxWidth: '400px' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 className="vibrant-text" style={{ fontSize: '32px', marginBottom: '8px' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Sign in to join the tournament</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="input-field"
                                style={{ paddingLeft: '44px' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                placeholder="Password"
                                className="input-field"
                                style={{ paddingLeft: '44px' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && <p style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{error}</p>}

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'wait' : 'pointer'
                        }}
                    >
                        <LogIn size={20} />
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--brand-teal)', textDecoration: 'none', fontWeight: '600' }}>Register now</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
