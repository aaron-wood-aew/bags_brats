import React, { useState } from 'react';
import axios from 'axios';
import { UserPlus, User as UserIcon, Phone, Mail, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import API_URL from '../config';

const AdminProxyRegister = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        setError('');
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/admin/proxy-register`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMsg('Proxy player registered successfully!');
            setFormData({ name: '', email: '', phone: '' });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to register proxy player');
        }
    };

    return (
        <div className="glass-card" style={{ padding: '32px', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <ShieldCheck style={{ color: 'var(--brand-teal)' }} />
                <h3 style={{ fontSize: '24px' }}>Admin Proxy Registration</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                Manually add players who do not have a mobile device or email account.
                They will be included in the pairing engine.
            </p>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ gridColumn: 'span 2', position: 'relative' }}>
                        <UserIcon size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
                        <input
                            name="name"
                            type="text"
                            placeholder="Player's Full Name"
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
                            placeholder="Email (Optional)"
                            className="input-field"
                            style={{ paddingLeft: '44px', marginBottom: '0' }}
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Phone size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
                        <input
                            name="phone"
                            type="tel"
                            placeholder="Phone (Optional)"
                            className="input-field"
                            style={{ paddingLeft: '44px', marginBottom: '0' }}
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {msg && <p style={{ color: '#10b981', marginBottom: '16px', fontWeight: '500' }}>{msg}</p>}
                {error && <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>}

                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserPlus size={18} />
                    Register Proxy Player
                </button>
            </form>
        </div>
    );
};

export default AdminProxyRegister;
