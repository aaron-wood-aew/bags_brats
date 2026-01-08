import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Shield, Trash2, UserCog, CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';
import API_URL from '../config';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    const handleSeed = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/admin/users/seed`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
        } catch (err) {
            alert("Seeding failed");
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm("CRITICAL: This will delete ALL players except you. Proceed?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/admin/users/bulk-delete`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
        } catch (err) {
            alert("Bulk delete failed");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleCheckIn = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/admin/users/${userId}/check-in`, { checked_in: !currentStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
        } catch (err) {
            console.error("Failed to update check-in status", err);
        }
    };

    const toggleRole = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'player' : 'admin';
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/admin/users/${userId}/role`, { role: newRole }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
        } catch (err) {
            console.error("Failed to update role", err);
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this player?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
        } catch (err) {
            console.error("Failed to delete user", err);
        }
    };

    const togglePowerPlayer = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/admin/users/${userId}`, { is_power_player: !currentStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
        } catch (err) {
            console.error("Failed to toggle power player", err);
        }
    };

    if (loading) return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Loading Roster...</div>;

    return (
        <div className="glass-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Users style={{ color: 'var(--brand-teal)' }} />
                    <h3 style={{ fontSize: '24px' }}>Global Roster</h3>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
                    <button onClick={handleSeed} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                        Seed 24 Players
                    </button>
                    <button onClick={handleBulkDelete} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444' }}>
                        Reset Roster
                    </button>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '12px' }}>Player</th>
                            <th style={{ padding: '12px' }}>Status</th>
                            <th style={{ padding: '12px' }}>Power</th>
                            <th style={{ padding: '12px' }}>Role</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '16px 12px' }}>
                                    <div style={{ fontWeight: '600' }}>{user.name}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email || 'No Email'}</div>
                                </td>
                                <td style={{ padding: '12px', cursor: 'pointer' }} onClick={() => toggleCheckIn(user._id, user.checked_in)}>
                                    {user.checked_in ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '13px' }}>
                                            <CheckCircle2 size={14} /> Present
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                            <Circle size={14} /> Absent
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '12px', cursor: 'pointer' }} onClick={() => togglePowerPlayer(user._id, user.is_power_player)}>
                                    {user.is_power_player ? (
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            padding: '4px 10px',
                                            background: 'rgba(251, 191, 36, 0.2)',
                                            border: '1px solid #fbbf24',
                                            borderRadius: '6px',
                                            color: '#fbbf24',
                                            fontSize: '13px',
                                            fontWeight: '700'
                                        }}>
                                            ⚡ Yes
                                        </div>
                                    ) : (
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            padding: '4px 10px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '6px',
                                            color: 'var(--text-muted)',
                                            fontSize: '13px'
                                        }}>
                                            No
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        textTransform: 'uppercase',
                                        background: user.role === 'admin' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                                        color: user.role === 'admin' ? 'var(--brand-teal)' : 'var(--text-muted)',
                                        border: `1px solid ${user.role === 'admin' ? 'var(--brand-teal)' : 'transparent'}`
                                    }}>
                                        {user.role}
                                    </span>
                                </td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                        <button
                                            onClick={() => toggleRole(user._id, user.role)}
                                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                            title="Toggle Admin"
                                        >
                                            <UserCog size={18} />
                                        </button>
                                        <button
                                            onClick={() => deleteUser(user._id)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                            title="Delete User"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUserManagement;
