import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Users, Clock, CheckCircle2, Trophy, Play, Save, Shield, LogOut, Settings, Hourglass, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SocketService from '../services/socket';
import API_URL from '../config';
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
    const [daySummary, setDaySummary] = useState({ state: 'waiting', games: [], rounds_total: 0, rounds_completed: 0 });
    const [showPowerPlayerToast, setShowPowerPlayerToast] = useState(false);
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
                }

                // Fetch current game (active or upcoming)
                const gRes = await axios.get(`${API_URL}/player/current-game`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (gRes.data) {
                    setCurrentGame(gRes.data);
                }

                // Fetch day summary for session state
                const dsRes = await axios.get(`${API_URL}/player/day-summary`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDaySummary(dsRes.data);

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

    // Show Power Player toast after 12 seconds for non-Power Players
    useEffect(() => {
        if (user && !user.is_power_player) {
            const toastTimer = setTimeout(() => {
                setShowPowerPlayerToast(true);
            }, 12000);
            return () => clearTimeout(toastTimer);
        }
    }, [user]);

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
            // Refresh day summary
            const dsRes = await axios.get(`${API_URL}/player/day-summary`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDaySummary(dsRes.data);
        } catch (err) {
            setScoreError("Submission failed. Try again.");
        }
    };

    // Render session content based on state
    const renderSessionContent = () => {
        // Active game takes priority
        if (currentGame) {
            const isPowerGame = currentGame.is_power_game;

            return (
                <div style={{ textAlign: 'center' }}>
                    {/* Power Game Banner */}
                    {isPowerGame && (
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.1))',
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}>
                            <Zap size={20} style={{ color: '#fbbf24' }} />
                            <span style={{ color: '#fbbf24', fontWeight: '800', fontSize: '14px' }}>POWER GAME</span>
                            <Zap size={20} style={{ color: '#fbbf24' }} />
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Your Team</p>
                            <div style={{ fontWeight: '800', fontSize: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {currentGame.team1_player_ids?.includes(user.id || user._id) ?
                                    currentGame.team1_player_names?.map(name => {
                                        const hasPowerIcon = name.includes('⚡');
                                        const cleanName = name.replace(' ⚡', '');
                                        return (
                                            <span key={name} style={{
                                                color: cleanName === user.name ? 'var(--brand-teal)' : (hasPowerIcon ? '#fbbf24' : 'white'),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}>
                                                {hasPowerIcon && <Zap size={16} style={{ color: '#fbbf24' }} />}
                                                {cleanName}
                                                {hasPowerIcon && <Zap size={16} style={{ color: '#fbbf24' }} />}
                                            </span>
                                        );
                                    }) :
                                    currentGame.team2_player_names?.map(name => {
                                        const hasPowerIcon = name.includes('⚡');
                                        const cleanName = name.replace(' ⚡', '');
                                        return (
                                            <span key={name} style={{
                                                color: cleanName === user.name ? 'var(--brand-teal)' : (hasPowerIcon ? '#fbbf24' : 'white'),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}>
                                                {hasPowerIcon && <Zap size={16} style={{ color: '#fbbf24' }} />}
                                                {cleanName}
                                                {hasPowerIcon && <Zap size={16} style={{ color: '#fbbf24' }} />}
                                            </span>
                                        );
                                    })
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
                                    currentGame.team1_player_names?.map(name => {
                                        const hasPowerIcon = name.includes('⚡');
                                        const cleanName = name.replace(' ⚡', '');
                                        return (
                                            <span key={name} style={{
                                                color: hasPowerIcon ? '#fbbf24' : 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}>
                                                {hasPowerIcon && <Zap size={16} style={{ color: '#fbbf24' }} />}
                                                {cleanName}
                                                {hasPowerIcon && <Zap size={16} style={{ color: '#fbbf24' }} />}
                                            </span>
                                        );
                                    }) :
                                    currentGame.team2_player_names?.map(name => {
                                        const hasPowerIcon = name.includes('⚡');
                                        const cleanName = name.replace(' ⚡', '');
                                        return (
                                            <span key={name} style={{
                                                color: hasPowerIcon ? '#fbbf24' : 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}>
                                                {hasPowerIcon && <Zap size={16} style={{ color: '#fbbf24' }} />}
                                                {cleanName}
                                                {hasPowerIcon && <Zap size={16} style={{ color: '#fbbf24' }} />}
                                            </span>
                                        );
                                    })
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
            );
        }

        // State-based content
        switch (daySummary.state) {
            case 'day_complete':
                return (
                    <div style={{ padding: '30px 20px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(99, 102, 241, 0.05))', borderRadius: '16px' }}>
                        <Trophy size={48} style={{ color: '#fbbf24', marginBottom: '12px' }} />
                        <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>All Games Complete!</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                            Await The Big Reveal to see today's Golden Bag winner! 🏆
                        </p>
                    </div>
                );

            case 'between_rounds':
                return (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                        {/* Show completed game results */}
                        {daySummary.games.map((game, idx) => (
                            <div key={idx} style={{
                                background: game.won ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                border: `1px solid ${game.won ? '#10b98133' : '#ef444433'}`,
                                borderRadius: '12px',
                                padding: '16px',
                                marginBottom: '12px'
                            }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                    Round {game.round}
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: '800', color: game.won ? '#10b981' : '#ef4444' }}>
                                    {game.my_score} - {game.opponent_score}
                                </div>
                                <div style={{ fontSize: '13px', color: game.won ? '#10b981' : '#ef4444', fontWeight: '700' }}>
                                    {game.won ? 'Victory!' : 'Defeat'}
                                </div>
                            </div>
                        ))}

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', marginTop: '16px' }}>
                            <Hourglass size={24} style={{ color: 'var(--brand-teal)', marginBottom: '8px' }} />
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                                Waiting for Round {daySummary.rounds_completed + 1} pairings...
                            </p>
                        </div>
                    </div>
                );

            case 'waiting':
            default:
                return (
                    <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                        <p style={{ color: 'var(--text-muted)' }}>Pairings will be revealed by the Director soon.</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Hang tight and grab a brat!</p>
                    </div>
                );
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
                                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '12px' }}>
                                            Confirm you are here to be included in today's pairings.
                                        </p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '16px', fontStyle: 'italic' }}>
                                            💵 Don't forget to find the Tournament Director to pay your entry fee!
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

                    {/* Your Session Card */}
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

                        {renderSessionContent()}
                    </div>

                    {/* Personal Stats (only shows player's own stats, no leaderboard) */}
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

            {/* Power Player Toast Notification */}
            <AnimatePresence>
                {showPowerPlayerToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        style={{
                            position: 'fixed',
                            bottom: '24px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1))',
                            border: '1px solid rgba(251, 191, 36, 0.4)',
                            borderRadius: '16px',
                            padding: '16px 24px',
                            maxWidth: '360px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                            backdropFilter: 'blur(10px)',
                            zIndex: 1000
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <Zap size={24} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <p style={{ color: '#fbbf24', fontWeight: '700', marginBottom: '6px', fontSize: '14px' }}>
                                    Interested in being a Power Player?
                                </p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' }}>
                                    Take control of solo games and get the golden treatment!
                                </p>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => {
                                            setShowPowerPlayerToast(false);
                                            navigate('/settings');
                                        }}
                                        style={{
                                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                            color: '#1f2937',
                                            border: 'none',
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            fontWeight: '700',
                                            fontSize: '12px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Learn More
                                    </button>
                                    <button
                                        onClick={() => setShowPowerPlayerToast(false)}
                                        style={{
                                            background: 'transparent',
                                            color: 'var(--text-muted)',
                                            border: '1px solid var(--border)',
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Maybe Later
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PlayerDashboard;
