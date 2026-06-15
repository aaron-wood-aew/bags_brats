import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Users, Shield, Trash2, UserCog, CheckCircle2, Circle, Key, ArrowUpDown, DollarSign, Link2Off } from 'lucide-react';
import { motion } from 'framer-motion';
import API_URL from '../config';
import { useToast } from '../context/ToastContext';

const AdminUserManagement = () => {
    const { showToast, confirm, prompt: customPrompt } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [activeTournament, setActiveTournament] = useState(null);

    const fetchActiveTournament = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/tournaments/active`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActiveTournament(res.data);
        } catch (err) {
            console.error("Failed to fetch active tournament", err);
        }
    };

    const formatDateTooltip = (dateStr, isPast, isCurrent, user) => {
        const date = new Date(dateStr + 'T00:00:00');
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        if (isPast) {
            const attended = user.attendance_history?.[dateStr];
            return `${formattedDate} (Past) — ${attended ? 'Attended' : 'Absent'}`;
        }
        if (isCurrent) {
            return `${formattedDate} (Today) — ${user.checked_in ? 'Checked In' : 'Absent'}`;
        }
        
        const planned = user.attendance_schedule?.[dateStr];
        let planText = 'Undecided';
        if (planned === true) planText = 'Plan to Attend';
        if (planned === false) planText = 'Plan to Skip';
        return `${formattedDate} (Future) — ${planText}`;
    };

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
            showToast("Database seeded successfully with demo players! 👥", "success");
        } catch (err) {
            showToast("Seeding failed", "error");
        }
    };

    const handleBulkDelete = async () => {
        if (!(await confirm({
            title: 'Bulk Delete Players?',
            message: 'CRITICAL: This will permanently delete ALL players and match schedules from the database, except for your admin account. Proceed?',
            confirmText: 'Delete All',
            type: 'danger'
        }))) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/admin/users/bulk-delete`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
            showToast("All players successfully deleted.", "success");
        } catch (err) {
            showToast("Bulk delete failed", "error");
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchActiveTournament();
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

    const toggleRole = async (userId, currentRole, userName) => {
        const newRole = currentRole === 'admin' ? 'player' : 'admin';

        // Prevent self-demotion
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser._id === userId && newRole === 'player') {
            showToast("You can't remove admin from your own account", 'error');
            return;
        }

        const isPromoting = newRole === 'admin';
        const proceed = await confirm({
            title: isPromoting ? `Promote ${userName} to Admin?` : `Remove Admin from ${userName}?`,
            message: isPromoting
                ? `${userName} will gain full admin privileges including tournament management, player controls, and data access.`
                : `${userName} will lose all admin privileges and become a regular player.`,
            confirmText: isPromoting ? 'Yes — Make Admin' : 'Yes — Remove Admin',
            cancelText: 'No',
            type: isPromoting ? 'purple' : 'danger'
        });
        if (!proceed) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/admin/users/${userId}/role`, { role: newRole }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
            showToast(`${userName} is now ${newRole === 'admin' ? 'an Admin' : 'a Player'}`, 'success');
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to update role', 'error');
        }
    };

    const deleteUser = async (userId) => {
        if (!(await confirm({
            title: 'Delete Player?',
            message: 'Are you sure you want to permanently delete this player? They will be removed from all active rosters and standings.',
            confirmText: 'Delete',
            type: 'danger'
        }))) return;
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

    const togglePaid = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/admin/users/${userId}/toggle-paid`, { has_paid: !currentStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
        } catch (err) {
            console.error("Failed to toggle paid status", err);
        }
    };

    const resetPassword = async (userId, userName) => {
        const newPassword = await customPrompt({
            title: 'Reset Password',
            message: `Enter new password for ${userName}:`,
            placeholder: 'Minimum 6 characters',
            inputType: 'password',
            confirmText: 'Reset Password'
        });
        if (!newPassword) return;
        if (newPassword.length < 6) {
            showToast('Password must be at least 6 characters', 'warning');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/admin/users/${userId}/reset-password`, { new_password: newPassword }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast(`Password successfully reset for ${userName}! 🔑`, 'success');
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to reset password', 'error');
        }
    };

    const unlinkOAuth = async (user) => {
        const providerText = (user.google_id && user.apple_id) ? 'Google and Apple' : user.google_id ? 'Google' : 'Apple';
        const hasExistingPassword = !!user.password_hash;
        
        let confirmMsg = `Are you sure you want to remove ${providerText} login for ${user.name}? They will no longer be able to log in using their social account.`;
        if (!hasExistingPassword) {
            confirmMsg += `\n\nNote: This user has no password set. Converting their account will require you to enter a temporary password.`;
        } else {
            confirmMsg += `\n\nThey will revert to logging in using their email and existing password.`;
        }

        if (!(await confirm({
            title: `Remove Social Login?`,
            message: confirmMsg,
            confirmText: 'Convert Account',
            type: 'warning'
        }))) return;

        let tempPassword = '';
        if (!hasExistingPassword) {
            tempPassword = await customPrompt({
                title: 'Set Temporary Password',
                message: `Enter temporary password for ${user.name}:`,
                placeholder: 'Minimum 6 characters',
                inputType: 'password',
                confirmText: 'Set Password'
            });
            if (!tempPassword) return;
            if (tempPassword.length < 6) {
                showToast('Password must be at least 6 characters', 'warning');
                return;
            }
        }

        try {
            const token = localStorage.getItem('token');
            const payload = tempPassword ? { new_password: tempPassword } : {};
            await axios.post(`${API_URL}/admin/users/${user._id}/unlink-oauth`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
            showToast(`Social login unlinked successfully for ${user.name}! 🔌`, 'success');
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to unlink social login', 'error');
        }
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedUsers = useMemo(() => {
        return [...users].sort((a, b) => {
            let aVal, bVal;

            switch (sortField) {
                case 'name':
                    aVal = (a.name || '').toLowerCase();
                    bVal = (b.name || '').toLowerCase();
                    break;
                case 'status':
                    aVal = a.checked_in ? 1 : 0;
                    bVal = b.checked_in ? 1 : 0;
                    break;
                case 'role':
                    aVal = a.role === 'admin' ? 1 : 0;
                    bVal = b.role === 'admin' ? 1 : 0;
                    break;
                default:
                    return 0;
            }

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [users, sortField, sortDirection]);

    if (loading) return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Loading Roster...</div>;

    return (
        <div className="glass-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Users style={{ color: 'var(--brand-teal)' }} />
                    <h3 style={{ fontSize: '24px' }}>Global Roster</h3>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
                    <button onClick={handleBulkDelete} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444' }}>
                        Reset Roster
                    </button>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                            <th
                                style={{ padding: '12px', cursor: 'pointer', userSelect: 'none' }}
                                onClick={() => handleSort('name')}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    Player
                                    <ArrowUpDown size={14} style={{ opacity: sortField === 'name' ? 1 : 0.3 }} />
                                </div>
                            </th>
                            <th
                                style={{ padding: '12px', cursor: 'pointer', userSelect: 'none' }}
                                onClick={() => handleSort('status')}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    Status
                                    <ArrowUpDown size={14} style={{ opacity: sortField === 'status' ? 1 : 0.3 }} />
                                </div>
                            </th>
                            <th style={{ padding: '12px' }}>Power</th>
                            <th
                                style={{ padding: '12px', cursor: 'pointer', userSelect: 'none' }}
                                onClick={() => handleSort('role')}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    Role
                                    <ArrowUpDown size={14} style={{ opacity: sortField === 'role' ? 1 : 0.3 }} />
                                </div>
                            </th>
                            {activeTournament && activeTournament.dates && (
                                <th style={{ padding: '12px' }}>Schedule & History</th>
                            )}
                            <th style={{ padding: '12px' }}>Paid</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedUsers.map((user) => (
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
                                {activeTournament && activeTournament.dates && (
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                            {activeTournament.dates.map((dateStr, idx) => {
                                                const isPast = idx < activeTournament.current_day_index;
                                                const isCurrent = idx === activeTournament.current_day_index;
                                                const isFuture = idx > activeTournament.current_day_index;
                                                
                                                let bgColor = 'transparent';
                                                let border = '2px solid rgba(255,255,255,0.1)';
                                                
                                                if (isPast) {
                                                    const attended = user.attendance_history?.[dateStr];
                                                    bgColor = attended ? '#10b981' : '#ef4444';
                                                    border = `2px solid ${attended ? '#10b981' : '#ef4444'}`;
                                                } else if (isCurrent) {
                                                    border = `2px solid ${user.checked_in ? '#10b981' : 'var(--text-muted)'}`;
                                                } else if (isFuture) {
                                                    const planned = user.attendance_schedule?.[dateStr];
                                                    if (planned === true) {
                                                        border = '2px solid #10b981';
                                                    } else if (planned === false) {
                                                        border = '2px solid #ef4444';
                                                    } else {
                                                        border = '2px solid rgba(255,255,255,0.15)';
                                                    }
                                                }
                                                
                                                return (
                                                    <div
                                                        key={dateStr}
                                                        style={{
                                                            width: '14px',
                                                            height: '14px',
                                                            borderRadius: '4px',
                                                            backgroundColor: bgColor,
                                                            border: border,
                                                            cursor: 'help'
                                                        }}
                                                        title={formatDateTooltip(dateStr, isPast, isCurrent, user)}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </td>
                                )}
                                <td style={{ padding: '12px', cursor: 'pointer' }} onClick={() => togglePaid(user._id, user.has_paid)}>
                                    {user.has_paid ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '13px' }}>
                                            <DollarSign size={14} /> Paid
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                            <Circle size={14} /> Unpaid
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                        {(user.google_id || user.apple_id) && (
                                            <button
                                                onClick={() => unlinkOAuth(user)}
                                                style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer' }}
                                                title="Remove Social Login"
                                            >
                                                <Link2Off size={18} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => resetPassword(user._id, user.name)}
                                            style={{ background: 'none', border: 'none', color: '#fbbf24', cursor: 'pointer' }}
                                            title="Reset Password"
                                        >
                                            <Key size={18} />
                                        </button>
                                        <button
                                            onClick={() => toggleRole(user._id, user.role, user.name)}
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
