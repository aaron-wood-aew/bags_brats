import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Users, Clock, CheckCircle2, Trophy, ArrowRight, Play, Save, Shield, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SocketService from '../services/socket';
import API_URL from '../config';
import TournamentStandings from '../components/TournamentStandings';
import ThemeToggle from '../components/ThemeToggle';

const PlayerDashboard = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [tournament, setTournament] = useState(null);
    const [currentGame, setCurrentGame] = useState(null);
    const [checkedIn, setCheckedIn] = useState(user.checked_in);
    const [timer, setTimer] = useState(0);
    const [score1, setScore1] = useState('');
    const [score2, setScore2] = useState('');
    const [scoreError, setScoreError] = useState('');
    const [myStats, setMyStats] = useState({ wins: 0, points: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch fresh user data to sync check-in status
                const uRes = await axios.get(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(uRes.data);
                setCheckedIn(uRes.data.checked_in);

                const tRes = await axios.get(`${API_URL}/tournaments/active`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTournament(tRes.data);

                if (tRes.data) {
                    SocketService.connect(tRes.data._id);
                    SocketService.on('pairings_revealed', (pairings) => {
                        const userId = uRes.data.id || uRes.data._id;
                        const myPair = pairings.find(p =>
                            p.team1_player_ids.includes(userId) ||
                            p.team2_player_ids.includes(userId)
                        );
                        if (myPair) setCurrentGame(myPair);
                    });

                    SocketService.on('blackout_status', (data) => {
                        console.log('Blackout status:', data);
                    });
                }

                // Fetch current game (active or upcoming)
                const gRes = await axios.get(`${API_URL}/player/current-game`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (gRes.data) {
                    setCurrentGame(gRes.data);
                }

                // Fetch stats for personal view
                const sRes = await axios.get(`${API_URL}/tournaments/standings`);
                const userId = uRes.data.id || uRes.data._id;
                const me = sRes.data.find(s => s.user_id === userId);
                if (me) {
                    setMyStats({ wins: me.wins, points: me.total_points });
                }

                // Listen for updates to refresh data
                SocketService.on('standings_updated', fetchData);

            } catch (err) {
                console.error("Dashboard fetch error", err);
            }
        };
        fetchData();

        return () => {
            SocketService.off('standings_updated', fetchData);
            SocketService.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!currentGame || currentGame.status !== 'active' || !currentGame.end_time) {
            setTimer(0);
            return;
        }

        const interval = setInterval(() => {
            const end = new Date(currentGame.end_time).getTime();
            const now = new Date().getTime();
            const diff = Math.max(0, Math.floor((end - now) / 1000));
            setTimer(diff);
            if (diff <= 0) clearInterval(interval);
        }, 1000);

        return () => clearInterval(interval);
    }, [currentGame]);

    const handleCheckIn = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/player/check-in`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCheckedIn(true);
        } catch (err) {
            console.error("Check-in failed", err);
        }
    };

    const handleSubmitScore = async () => {
        if (!score1 || !score2) {
            setScoreError("Please enter both scores.");
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/games/${currentGame._id}/submit`, {
                score1: parseInt(score1),
                score2: parseInt(score2)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentGame(null);
            setScore1('');
            setScore2('');
            setScoreError('');
        } catch (err) {
            setScoreError("Submission failed. Try again.");
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            {/* Header section with User Info */}
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 className="vibrant-text" style={{ fontSize: '28px' }}>Hello, {user.name}</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Ready for some cornhole?</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <ThemeToggle />
                    {user.role === 'admin' && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="glass-card"
                            style={{
                                padding: '8px 16px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                border: '1px solid var(--brand-teal)',
                                background: 'var(--brand-teal-glow)'
                            }}
                        >
                            <Shield size={18} style={{ color: 'var(--brand-teal)' }} />
                            <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--brand-teal)' }}>Admin</span>
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/settings')}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        title="Settings"
                    >
                        <Settings size={20} />
                    </button>
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            navigate('/login');
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {!tournament ? (
                <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                    <Trophy size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5 }} />
                    <p style={{ color: 'var(--text-muted)' }}>No active tournament scheduled at the moment.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '24px' }}>

                    {/* Check-In Card */}
                    <AnimatePresence>
                        {!checkedIn && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="glass-card"
                                style={{ padding: '24px', border: '1px solid var(--brand-teal-glow)', background: 'rgba(99, 102, 241, 0.05)' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                    <Clock style={{ color: 'var(--brand-teal)', marginTop: '4px' }} />
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ marginBottom: '4px' }}>Presence Confirmation</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
                                            Confirm you are here to be included in today's pairings.
                                        </p>
                                        <button onClick={handleCheckIn} className="btn-primary" style={{ width: '100%' }}>
                                            I'm Here!
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {checkedIn && (
                        <div className="glass-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <CheckCircle2 size={24} style={{ color: '#10b981' }} />
                            <span style={{ fontWeight: '600' }}>Presence Confirmed</span>
                        </div>
                    )}

                    <div className="glass-card" style={{
                        padding: '24px',
                        border: currentGame?.status === 'active' && timer === 0 ? '1px solid #ef4444' : '1px solid var(--border)',
                        boxShadow: currentGame?.status === 'active' && timer === 0 ? '0 0 20px rgba(239, 68, 68, 0.1)' : 'none',
                        transition: 'all 0.5s ease'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Users size={24} style={{ color: 'var(--brand-teal)' }} />
                                <h3 style={{ fontSize: '20px' }}>Your Session</h3>
                            </div>
                            {currentGame?.status === 'active' && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: timer > 0 ? (timer < 120 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(99, 102, 241, 0.1)') : 'rgba(239, 68, 68, 0.1)',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    color: timer > 0 ? (timer < 120 ? '#fbbf24' : 'var(--brand-teal)') : '#ef4444',
                                    fontWeight: '800',
                                    border: `1px solid ${timer > 0 ? (timer < 120 ? '#fbbf2433' : 'var(--brand-teal-glow)') : '#ef444433'}`,
                                    transition: 'all 0.3s ease'
                                }}>
                                    <Clock size={16} />
                                    <span>{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</span>
                                </div>
                            )}
                        </div>

                        {currentGame ? (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Your Team</p>
                                        <div style={{ fontWeight: '800', fontSize: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {currentGame.team1_player_ids?.includes(user.id || user._id) ?
                                                currentGame.team1_player_names?.map(name => <span key={name} style={{ color: name === user.name ? 'var(--brand-teal)' : 'white' }}>{name}</span>) :
                                                currentGame.team2_player_names?.map(name => <span key={name} style={{ color: name === user.name ? 'var(--brand-teal)' : 'white' }}>{name}</span>)
                                            }
                                        </div>
                                        <input
                                            type="number"
                                            className="input-field"
                                            style={{ width: '80px', textAlign: 'center', fontSize: '24px', fontWeight: '800', marginTop: '16px', marginBottom: '0', opacity: currentGame.status === 'finalized' ? 0.5 : 1 }}
                                            placeholder="0"
                                            value={currentGame.status === 'finalized' ? currentGame.score1 : score1}
                                            onChange={(e) => setScore1(e.target.value)}
                                            disabled={currentGame.status === 'finalized'}
                                        />
                                    </div>

                                    <div style={{ fontSize: '20px', fontWeight: '800', opacity: 0.2, margin: '0 20px', marginTop: '40px' }}>VS</div>

                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Opponents</p>
                                        <div style={{ fontWeight: '800', fontSize: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {!currentGame.team1_player_ids?.includes(user.id || user._id) ?
                                                currentGame.team1_player_names?.map(name => <span key={name}>{name}</span>) :
                                                currentGame.team2_player_names?.map(name => <span key={name}>{name}</span>)
                                            }
                                        </div>
                                        <input
                                            type="number"
                                            className="input-field"
                                            style={{ width: '80px', textAlign: 'center', fontSize: '24px', fontWeight: '800', marginTop: '16px', marginBottom: '0', opacity: currentGame.status === 'finalized' ? 0.5 : 1 }}
                                            placeholder="0"
                                            value={currentGame.status === 'finalized' ? currentGame.score2 : score2}
                                            onChange={(e) => setScore2(e.target.value)}
                                            disabled={currentGame.status === 'finalized'}
                                        />
                                    </div>
                                </div>

                                {scoreError && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px' }}>{scoreError}</p>}

                                {currentGame.status === 'finalized' ? (
                                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid #10b98133', color: '#10b981', fontWeight: '700' }}>
                                        Match Result Finalized
                                    </div>
                                ) : (
                                    <button
                                        className="btn-primary"
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
                                        onClick={handleSubmitScore}
                                    >
                                        <Save size={20} />
                                        Submit Final Results
                                    </button>
                                )}
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '16px' }}>
                                    {currentGame.status === 'finalized' ? "Results have been recorded by the Director or a teammate." : "Only one player per game needs to submit. Results are final."}
                                </p>
                            </div>
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                                <p style={{ color: 'var(--text-muted)' }}>Pairings will be revealed by the Director soon.</p>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Hang tight and grab a brat!</p>
                            </div>
                        )}
                    </div>

                    {/* Current Tournament View (Leaderboard) */}
                    <TournamentStandings />

                    {/* All-Time stats summary */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', border: '1px solid var(--border)' }}>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Your Wins</p>
                            <h4 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--brand-teal)' }}>{myStats.wins}</h4>
                        </div>
                        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', border: '1px solid var(--border)' }}>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Total Points</p>
                            <h4 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--brand-teal)' }}>{myStats.points}</h4>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerDashboard;
