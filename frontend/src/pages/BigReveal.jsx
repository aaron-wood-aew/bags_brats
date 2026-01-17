import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../config';

const BigReveal = () => {
    const navigate = useNavigate();
    const [topTeams, setTopTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [revealed, setRevealed] = useState({ third: false, second: false, first: false });
    const [confetti, setConfetti] = useState(false);

    useEffect(() => {
        fetchTopTeams();
    }, []);

    const fetchTopTeams = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/admin/tournament/top-teams`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTopTeams(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch top teams:', err);
            setLoading(false);
        }
    };

    const handleReveal = (place) => {
        if (place === 'third') {
            setRevealed({ ...revealed, third: true });
        } else if (place === 'second' && revealed.third) {
            setRevealed({ ...revealed, second: true });
        } else if (place === 'first' && revealed.second) {
            setRevealed({ ...revealed, first: true });
            setConfetti(true);
        }
    };

    const getTeam = (rank) => topTeams.find(t => t.rank === rank);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <div className="loading-spinner" />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', minHeight: '100vh' }}>
            {/* Confetti overlay */}
            <AnimatePresence>
                {confetti && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            pointerEvents: 'none',
                            background: 'radial-gradient(ellipse at center, rgba(251, 191, 36, 0.1) 0%, transparent 70%)',
                            zIndex: 100
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
                <button
                    onClick={() => navigate('/admin')}
                    className="btn-secondary"
                    style={{ padding: '8px 12px' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="vibrant-text" style={{ fontSize: '36px', margin: 0 }}>The Big Reveal</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Click each podium to reveal today's winners</p>
                </div>
            </div>

            {/* Podium */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '20px', marginTop: '60px' }}>

                {/* 2nd Place */}
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => handleReveal('second')}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: revealed.third && !revealed.second ? 'pointer' : 'default',
                        opacity: revealed.third ? 1 : 0.3
                    }}
                >
                    <AnimatePresence>
                        {revealed.second && getTeam(2) && (
                            <motion.div
                                initial={{ scale: 0, y: 50 }}
                                animate={{ scale: 1, y: 0 }}
                                style={{ textAlign: 'center', marginBottom: '20px' }}
                            >
                                <div style={{ fontSize: '14px', color: '#c0c0c0', fontWeight: '700', marginBottom: '8px' }}>
                                    {getTeam(2).total_points} pts
                                </div>
                                {getTeam(2).player_names.map((name, i) => (
                                    <div key={i} style={{ fontSize: '18px', fontWeight: '800' }}>{name}</div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div style={{
                        width: '160px',
                        height: '120px',
                        background: revealed.second ? 'linear-gradient(135deg, #c0c0c0, #9ca3af)' : 'rgba(255,255,255,0.05)',
                        borderRadius: '12px 12px 0 0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #c0c0c0',
                        transition: 'all 0.3s ease'
                    }}>
                        <Medal size={32} style={{ color: revealed.second ? '#1f2937' : '#c0c0c0' }} />
                        <span style={{ fontSize: '24px', fontWeight: '800', color: revealed.second ? '#1f2937' : '#c0c0c0', marginTop: '4px' }}>2nd</span>
                    </div>
                </motion.div>

                {/* 1st Place (Golden Bag) */}
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => handleReveal('first')}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: revealed.second && !revealed.first ? 'pointer' : 'default',
                        opacity: revealed.second ? 1 : 0.3
                    }}
                >
                    <AnimatePresence>
                        {revealed.first && getTeam(1) && (
                            <motion.div
                                initial={{ scale: 0, y: 50 }}
                                animate={{ scale: 1.1, y: 0 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                                style={{ textAlign: 'center', marginBottom: '20px' }}
                            >
                                <motion.div
                                    animate={{ rotate: [0, -5, 5, -5, 5, 0], scale: [1, 1.1, 1] }}
                                    transition={{ duration: 0.5, repeat: 2 }}
                                >
                                    <Trophy size={48} style={{ color: '#fbbf24', marginBottom: '8px' }} />
                                </motion.div>
                                <div style={{ fontSize: '14px', color: '#fbbf24', fontWeight: '700', marginBottom: '8px' }}>
                                    🏆 {getTeam(1).total_points} pts
                                </div>
                                {getTeam(1).player_names.map((name, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.2 }}
                                        style={{ fontSize: '22px', fontWeight: '800', color: '#fbbf24' }}
                                    >
                                        {name}
                                    </motion.div>
                                ))}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    style={{
                                        marginTop: '12px',
                                        fontSize: '16px',
                                        fontWeight: '800',
                                        background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em'
                                    }}
                                >
                                    Golden Bag Winner!
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div style={{
                        width: '180px',
                        height: '160px',
                        background: revealed.first ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'rgba(255,255,255,0.05)',
                        borderRadius: '12px 12px 0 0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #fbbf24',
                        transition: 'all 0.3s ease',
                        boxShadow: revealed.first ? '0 0 40px rgba(251, 191, 36, 0.4)' : 'none'
                    }}>
                        <Trophy size={40} style={{ color: revealed.first ? '#1f2937' : '#fbbf24' }} />
                        <span style={{ fontSize: '28px', fontWeight: '800', color: revealed.first ? '#1f2937' : '#fbbf24', marginTop: '4px' }}>1st</span>
                    </div>
                </motion.div>

                {/* 3rd Place */}
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => handleReveal('third')}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: !revealed.third ? 'pointer' : 'default'
                    }}
                >
                    <AnimatePresence>
                        {revealed.third && getTeam(3) && (
                            <motion.div
                                initial={{ scale: 0, y: 50 }}
                                animate={{ scale: 1, y: 0 }}
                                style={{ textAlign: 'center', marginBottom: '20px' }}
                            >
                                <div style={{ fontSize: '14px', color: '#cd7f32', fontWeight: '700', marginBottom: '8px' }}>
                                    {getTeam(3).total_points} pts
                                </div>
                                {getTeam(3).player_names.map((name, i) => (
                                    <div key={i} style={{ fontSize: '16px', fontWeight: '800' }}>{name}</div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div style={{
                        width: '140px',
                        height: '80px',
                        background: revealed.third ? 'linear-gradient(135deg, #cd7f32, #a0522d)' : 'rgba(255,255,255,0.05)',
                        borderRadius: '12px 12px 0 0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #cd7f32',
                        transition: 'all 0.3s ease'
                    }}>
                        <Award size={28} style={{ color: revealed.third ? '#1f2937' : '#cd7f32' }} />
                        <span style={{ fontSize: '20px', fontWeight: '800', color: revealed.third ? '#1f2937' : '#cd7f32', marginTop: '4px' }}>3rd</span>
                    </div>
                </motion.div>
            </div>

            {/* Instructions */}
            <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--text-muted)' }}>
                {!revealed.third && <p>👆 Click 3rd place to begin the reveal</p>}
                {revealed.third && !revealed.second && <p>👆 Now reveal 2nd place</p>}
                {revealed.second && !revealed.first && <p>👆 The moment you've been waiting for... reveal the Golden Bag winner!</p>}
                {revealed.first && <p style={{ color: '#fbbf24', fontWeight: '700' }}>🎉 Congratulations to all winners! 🎉</p>}
            </div>
        </div>
    );
};

export default BigReveal;
