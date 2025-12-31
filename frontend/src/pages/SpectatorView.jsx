import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Users, Clock, ShieldAlert, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SocketService from '../services/socket';
import API_URL from '../config';

const CourtCard = ({ game }) => {
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        if (game.status !== 'active' || !game.end_time) {
            setTimer(0);
            return;
        }

        const interval = setInterval(() => {
            const end = new Date(game.end_time).getTime();
            const now = new Date().getTime();
            const diff = Math.max(0, Math.floor((end - now) / 1000));
            setTimer(diff);
            if (diff <= 0) clearInterval(interval);
        }, 1000);

        return () => clearInterval(interval);
    }, [game]);

    const getStatusColor = () => {
        if (game.status === 'active') return 'var(--brand-teal)';
        if (game.status === 'finalized') return '#10b981';
        return 'var(--text-muted)';
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{
                padding: '32px',
                border: game.status === 'active' ? (timer > 0 ? (timer < 120 ? '2px solid #fbbf24' : '2px solid var(--brand-teal)') : '2px solid #ef4444') : '1px solid var(--border)',
                background: game.status === 'active' ? (timer > 0 ? (timer < 120 ? 'rgba(251, 191, 36, 0.05)' : 'rgba(99, 102, 241, 0.05)') : 'rgba(239, 68, 68, 0.05)') : 'rgba(255,255,255,0.02)',
                boxShadow: game.status === 'active' ? (timer > 0 ? (timer < 120 ? '0 0 40px rgba(251, 191, 36, 0.2)' : '0 0 40px var(--brand-teal-glow)') : '0 0 40px rgba(239, 68, 68, 0.3)') : 'none',
                transition: 'all 0.5s ease'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                    Court {game.court}
                </span>

                {game.status === 'active' && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: timer > 0 ? (timer < 120 ? '#fbbf24' : 'var(--brand-teal)') : '#ef4444',
                        fontWeight: '900',
                        fontSize: '32px',
                        textShadow: timer > 0 && timer < 120 ? '0 0 15px rgba(251, 191, 36, 0.5)' : 'none'
                    }}>
                        <Clock size={32} />
                        <span>{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</span>
                    </div>
                )}

                {game.status === 'finalized' && (
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', padding: '4px 12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
                        Final
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {game.team1_player_names?.join(' & ') || '---'}
                    </div>
                    <div style={{ fontSize: '48px', fontWeight: '900', color: game.score1 > game.score2 && game.status === 'finalized' ? 'var(--brand-teal)' : 'white' }}>
                        {game.score1}
                    </div>
                </div>

                <div style={{ fontSize: '20px', fontWeight: '900', opacity: 0.2 }}>VS</div>

                <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {game.team2_player_names?.join(' & ') || '---'}
                    </div>
                    <div style={{ fontSize: '48px', fontWeight: '900', color: game.score2 > game.score1 && game.status === 'finalized' ? 'var(--brand-teal)' : 'white' }}>
                        {game.score2}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const SpectatorView = () => {
    const [tournament, setTournament] = useState(null);
    const [games, setGames] = useState([]);
    const [blackout, setBlackout] = useState(false);

    const fetchData = async () => {
        try {
            const tRes = await axios.get(`${API_URL}/tournaments/active`);
            setTournament(tRes.data);
            if (tRes.data) {
                setBlackout(tRes.data.status === 'blackout');
                SocketService.connect(tRes.data._id);

                // Fetch games using the same admin enrichment logic (but public route if available, 
                // for now fallback to custom fetch if needed or reuse existing)
                // Actually, let's add a public games route for spectator
                const gRes = await axios.get(`${API_URL}/tournaments/active/games`);
                setGames(gRes.data);
            }
        } catch (err) {
            console.error("Spectator fetch error", err);
        }
    };

    useEffect(() => {
        fetchData();

        SocketService.on('standings_updated', fetchData);
        SocketService.on('pairings_revealed', fetchData);
        SocketService.on('blackout_status', (data) => setBlackout(data.is_blackout));

        return () => {
            SocketService.off('standings_updated', fetchData);
            SocketService.off('pairings_revealed', fetchData);
        };
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '60px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '80px' }}>
                <div>
                    <h1 className="vibrant-text" style={{ fontSize: '64px', fontWeight: '900', marginBottom: '8px', lineHeight: 1 }}>
                        {tournament?.name || "Bags & Brats"}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '20px', letterSpacing: '0.05em' }}>LIVE COURT TRACKER</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--brand-teal)', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end' }}>
                        <Monitor size={32} />
                        <span>BIG SCREEN VIEW</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '8px' }}>Auto-refreshing live data</p>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {blackout ? (
                    <motion.div
                        key="blackout"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '10vh' }}
                    >
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                position: 'absolute',
                                inset: '-40px',
                                background: 'radial-gradient(circle, var(--brand-teal-glow) 0%, transparent 70%)',
                                zIndex: 0
                            }} />
                            <ShieldAlert size={180} style={{ color: 'var(--brand-teal)', position: 'relative', zIndex: 1, opacity: 0.9 }} />
                        </div>
                        <h2 style={{ fontSize: '64px', fontWeight: '900', marginTop: '40px', textAlign: 'center' }}>THE BIG REVEAL</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '24px', textAlign: 'center' }}>Scores are hidden for the final rounds. Get ready for the leaderboard!</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="courts"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '32px' }}
                    >
                        {games.length > 0 ? (
                            games.filter(g => g.status !== 'upcoming').map((game) => (
                                <CourtCard key={game._id} game={game} />
                            ))
                        ) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', opacity: 0.3 }}>
                                <Trophy size={80} style={{ marginBottom: '24px' }} />
                                <h2 style={{ fontSize: '32px' }}>Waiting for the first pitch...</h2>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SpectatorView;
