import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Lock, Phone, Mail, Save, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import API_URL from '../config';

const UserSettings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Profile form
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [profileError, setProfileError] = useState('');

    // Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await axios.get(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
            setName(res.data.name || '');
            setPhone(res.data.phone || '');
        } catch (err) {
            console.error('Failed to fetch user:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileSaving(true);
        setProfileError('');
        setProfileSuccess(false);

        try {
            const res = await axios.put(`${API_URL}/user/profile`,
                { name, phone },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update localStorage with new user data
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...currentUser, name }));

            setProfileSuccess(true);
            setTimeout(() => setProfileSuccess(false), 3000);
        } catch (err) {
            setProfileError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordSaving(true);
        setPasswordError('');
        setPasswordSuccess(false);

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match');
            setPasswordSaving(false);
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            setPasswordSaving(false);
            return;
        }

        try {
            await axios.put(`${API_URL}/user/password`,
                { current_password: currentPassword, new_password: newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setPasswordSuccess(true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setPasswordSuccess(false), 3000);
        } catch (err) {
            setPasswordError(err.response?.data?.error || 'Failed to change password');
        } finally {
            setPasswordSaving(false);
        }
    };

    const isGoogleUser = user?.google_id && !user?.password_hash;

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <div className="loading-spinner" />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="btn-secondary"
                    style={{ padding: '8px 12px' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="vibrant-text" style={{ fontSize: '28px', margin: 0 }}>Settings</h1>
            </div>

            {/* Profile Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: '24px', marginBottom: '24px' }}
            >
                <h2 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <User size={22} />
                    Profile Information
                </h2>

                <form onSubmit={handleProfileSubmit}>
                    {/* Email (read-only) */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-muted)', fontSize: '14px' }}>
                            <Mail size={14} style={{ marginRight: '6px' }} />
                            Email
                        </label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="input-field"
                            style={{ opacity: 0.7, cursor: 'not-allowed' }}
                        />
                    </div>

                    {/* Name */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-muted)', fontSize: '14px' }}>
                            <User size={14} style={{ marginRight: '6px' }} />
                            Display Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-field"
                            placeholder="Your name"
                            required
                        />
                    </div>

                    {/* Phone */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-muted)', fontSize: '14px' }}>
                            <Phone size={14} style={{ marginRight: '6px' }} />
                            Phone (optional)
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="input-field"
                            placeholder="Your phone number"
                        />
                    </div>

                    {profileError && (
                        <p style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>{profileError}</p>
                    )}

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={profileSaving}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {profileSuccess ? <Check size={18} /> : <Save size={18} />}
                        {profileSaving ? 'Saving...' : profileSuccess ? 'Saved!' : 'Save Changes'}
                    </button>
                </form>
            </motion.div>

            {/* Password Section */}
            {!isGoogleUser && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card"
                    style={{ padding: '24px' }}
                >
                    <h2 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Lock size={22} />
                        Change Password
                    </h2>

                    <form onSubmit={handlePasswordSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                Current Password
                            </label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                New Password
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="input-field"
                                minLength={6}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>

                        {passwordError && (
                            <p style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>{passwordError}</p>
                        )}

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={passwordSaving}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            {passwordSuccess ? <Check size={18} /> : <Lock size={18} />}
                            {passwordSaving ? 'Changing...' : passwordSuccess ? 'Password Changed!' : 'Change Password'}
                        </button>
                    </form>
                </motion.div>
            )}

            {/* Google User Notice */}
            {isGoogleUser && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card"
                    style={{ padding: '24px', textAlign: 'center' }}
                >
                    <p style={{ color: 'var(--text-muted)' }}>
                        You signed in with Google. Password management is handled through your Google account.
                    </p>
                </motion.div>
            )}
        </div>
    );
};

export default UserSettings;
