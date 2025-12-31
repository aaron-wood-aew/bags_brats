import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User as UserIcon, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import API_URL from '../config';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/auth/register`, formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', padding: '20px' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card"
                style={{ padding: '40px', width: '100%', maxWidth: '450px' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 className="vibrant-text" style={{ fontSize: '32px', marginBottom: '8px' }}>Join the Guild</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Create your account for Bags & Brats</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                        <div style={{ position: 'relative' }}>
                            <UserIcon size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
                            <input
                                name="name"
                                type="text"
                                placeholder="Full Name"
                                className="input-field"
                                style={{ paddingLeft: '44px', marginBottom: '0' }}
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
                            <input
                                name="email"
                                type="email"
                                placeholder="Email Address"
                                className="input-field"
                                style={{ paddingLeft: '44px', marginBottom: '0' }}
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <Phone size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
                            <input
                                name="phone"
                                type="tel"
                                placeholder="Phone Number"
                                className="input-field"
                                style={{ paddingLeft: '44px', marginBottom: '0' }}
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
                            <input
                                name="password"
                                type="password"
                                placeholder="Secure Password"
                                className="input-field"
                                style={{ paddingLeft: '44px', marginBottom: '0' }}
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {error && <p style={{ color: '#ef4444', marginTop: '16px', fontSize: '14px', textAlign: 'center' }}>{error}</p>}

                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <UserPlus size={20} />
                        Create Account
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                    Already a member? <Link to="/login" style={{ color: 'var(--brand-teal)', textDecoration: 'none', fontWeight: '600' }}>Sign In</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
