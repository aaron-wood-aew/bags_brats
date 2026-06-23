import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Clock, Tv, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SocketService from '../services/socket';
import API_URL from '../config';

const CourtCard = ({ game }) => {
    const isTeam1Winning = game.score1 > game.score2;
    const isTeam2Winning = game.score2 > game.score1;
    const isFinal = game.status === 'finalized';
    const isActive = game.status === 'active';

    const getBorderColor = () => {
        if (isActive) return 'var(--brand-teal)';
        if (isFinal) return 'rgba(16, 185, 129, 0.3)';
        return 'rgba(255, 255, 255, 0.1)';
    };

    const getBgColor = () => {
        if (isActive) return 'rgba(93, 198, 207, 0.03)';
        if (isFinal) return 'rgba(16, 185, 129, 0.01)';
        return 'rgba(255,255,255,0.01)';
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="glass-card"
            style={{
                padding: '24px 32px',
                border: `2px solid ${getBorderColor()}`,
                background: getBgColor(),
                boxShadow: isActive ? '0 0 30px var(--brand-teal-glow)' : 'none',
                opacity: isFinal ? 0.65 : 1,
                transition: 'all 0.4s ease'
            }}
        >
            {/* Station Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                <span style={{ 
                    fontSize: '22px', 
                    fontWeight: '800', 
                    textTransform: 'uppercase', 
                    color: isActive ? 'var(--brand-teal)' : '#f8fafc',
                    letterSpacing: '0.1em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <Gamepad2 size={24} style={{ color: isActive ? 'var(--brand-teal)' : 'var(--text-muted)' }} />
                    Station {game.court || game.game_number}
                </span>

                <span style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    background: isActive ? 'rgba(93, 198, 207, 0.15)' : 
                                isFinal ? 'rgba(16, 185, 129, 0.15)' : 
                                'rgba(255,255,255,0.05)',
                    color: isActive ? 'var(--brand-teal)' : 
                           isFinal ? '#10b981' : 
                           'var(--text-muted)',
                    border: `1.5px solid ${
                        isActive ? 'var(--brand-teal)' : 
                        isFinal ? '#10b981' : 
                        'rgba(255, 255, 255, 0.2)'
                    }`
                }}>
                    {isActive ? 'Live Match' : 
                     isFinal ? 'Final' : 
                     'Ready'}
                </span>
            </div>

            {/* Scoreboard Block */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'space-between' }}>
                {/* Team 1 */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ 
                        fontSize: '20px', 
                        fontWeight: '800', 
                        marginBottom: '16px', 
                        minHeight: '60px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: isFinal && !isTeam1Winning ? 'var(--text-muted)' : 'white',
                        lineHeight: 1.2
                    }}>
                        {game.team1_player_names?.join(' & ') || '---'}
                    </div>
                    <div style={{
                        fontSize: '72px',
                        fontWeight: '900',
                        fontFamily: 'monospace',
                        color: isFinal && isTeam1Winning ? 'var(--brand-teal)' : 
                               isFinal ? 'var(--text-muted)' : 
                               isActive && isTeam1Winning ? 'var(--brand-teal)' : 'white',
                        transition: 'color 0.3s ease',
                        textShadow: isActive && isTeam1Winning ? '0 0 15px var(--brand-teal-glow)' : 'none'
                    }}>
                        {game.score1}
                    </div>
                </div>

                <div style={{ 
                    fontSize: '24px', 
                    fontWeight: '900', 
                    opacity: 0.15, 
                    userSelect: 'none',
                    color: 'white',
                    alignSelf: 'flex-end',
                    marginBottom: '18px'
                }}>
                    VS
                </div>

                {/* Team 2 */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ 
                        fontSize: '20px', 
                        fontWeight: '800', 
                        marginBottom: '16px', 
                        minHeight: '60px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: isFinal && !isTeam2Winning ? 'var(--text-muted)' : 'white',
                        lineHeight: 1.2
                    }}>
                        {game.team2_player_names?.join(' & ') || '---'}
                    </div>
                    <div style={{
                        fontSize: '72px',
                        fontWeight: '900',
                        fontFamily: 'monospace',
                        color: isFinal && isTeam2Winning ? 'var(--brand-teal)' : 
                               isFinal ? 'var(--text-muted)' : 
                               isActive && isTeam2Winning ? 'var(--brand-teal)' : 'white',
                        transition: 'color 0.3s ease',
                        textShadow: isActive && isTeam2Winning ? '0 0 15px var(--brand-teal-glow)' : 'none'
                    }}>
                        {game.score2}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const DisplayView = () => {
    const [tournament, setTournament] = useState(null);
    const [games, setGames] = useState([]);
    const [roundTimer, setRoundTimer] = useState(0);
    const [roundTimerStatus, setRoundTimerStatus] = useState('pending'); // 'pending', 'ready', 'active', 'complete'
    const [timerEndTime, setTimerEndTime] = useState(null);
    const [loading, setLoading] = useState(true);

    const themeStyles = {
        '--bg': '#0a141a',
        '--card-bg': 'rgba(19, 32, 41, 0.85)',
        '--text': '#f8fafc',
        '--text-muted': '#94a3b8',
        '--border': 'rgba(255, 255, 255, 0.08)',
        '--glass': 'rgba(255, 255, 255, 0.03)'
    };

    const fetchData = async () => {
        try {
            const tRes = await axios.get(`${API_URL}/tournaments/active`);
            setTournament(tRes.data);
            if (tRes.data) {
                SocketService.connect(tRes.data._id);
                const gRes = await axios.get(`${API_URL}/tournaments/active/games`);
                setGames(gRes.data);
            }
            setLoading(false);
        } catch (err) {
            console.error("DisplayView fetch error", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        SocketService.on('standings_updated', fetchData);
        SocketService.on('pairings_revealed', fetchData);

        return () => {
            SocketService.off('standings_updated', fetchData);
            SocketService.off('pairings_revealed', fetchData);
        };
    }, []);

    // Filter games of the current day & current round
    const currentRoundGames = games.filter(
        (g) =>
            tournament &&
            g.day_index === tournament.current_day_index &&
            g.round_number === tournament.current_round
    );

    useEffect(() => {
        if (currentRoundGames.length === 0) {
            setRoundTimerStatus('pending');
            setRoundTimer(0);
            setTimerEndTime(null);
            return;
        }

        const hasActive = currentRoundGames.some(g => g.status === 'active');
        const allFinalized = currentRoundGames.every(g => g.status === 'finalized');

        if (hasActive) {
            setRoundTimerStatus('active');
            const activeGames = currentRoundGames.filter(g => g.status === 'active' && g.end_time);
            if (activeGames.length > 0) {
                const maxEnd = Math.max(...activeGames.map(g => new Date(g.end_time).getTime()));
                setTimerEndTime(maxEnd);
            }
        } else if (allFinalized) {
            setRoundTimerStatus('complete');
            setRoundTimer(0);
            setTimerEndTime(null);
        } else {
            setRoundTimerStatus('ready');
            setRoundTimer(0);
            setTimerEndTime(null);
        }
    }, [games, tournament]);

    useEffect(() => {
        if (roundTimerStatus !== 'active' || !timerEndTime) {
            setRoundTimer(0);
            return;
        }

        const tick = () => {
            const now = new Date().getTime();
            const diff = Math.max(0, Math.floor((timerEndTime - now) / 1000));
            setRoundTimer(diff);
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [roundTimerStatus, timerEndTime]);

    // Timer layout configuration based on status & remaining seconds
    const getTimerConfig = () => {
        if (roundTimerStatus === 'active') {
            if (roundTimer < 30) {
                return {
                    color: '#ef4444',
                    text: `${Math.floor(roundTimer / 60)}:${String(roundTimer % 60).padStart(2, '0')}`,
                    subText: 'CRITICAL TIME REMAINING',
                    shadow: '0 0 40px rgba(239, 68, 68, 0.4)',
                    pulse: true
                };
            }
            if (roundTimer < 120) {
                return {
                    color: '#fbbf24',
                    text: `${Math.floor(roundTimer / 60)}:${String(roundTimer % 60).padStart(2, '0')}`,
                    subText: 'TWO MINUTES REMAINING',
                    shadow: '0 0 40px rgba(251, 191, 36, 0.3)',
                    pulse: true
                };
            }
            return {
                color: 'var(--brand-teal)',
                text: `${Math.floor(roundTimer / 60)}:${String(roundTimer % 60).padStart(2, '0')}`,
                subText: 'ROUND TIMER ACTIVE',
                shadow: '0 0 40px var(--brand-teal-glow)',
                pulse: false
            };
        }
        if (roundTimerStatus === 'complete') {
            return {
                color: '#10b981',
                text: 'COMPLETE',
                subText: 'ALL GAMES RECORDED',
                shadow: '0 0 30px rgba(16, 185, 129, 0.3)',
                pulse: false
            };
        }
        if (roundTimerStatus === 'ready') {
            return {
                color: '#60a5fa',
                text: 'READY',
                subText: 'WAITING FOR ADMIN TO START',
                shadow: '0 0 30px rgba(96, 165, 250, 0.3)',
                pulse: false
            };
        }
        return {
            color: 'var(--text-muted)',
            text: '00:00',
            subText: 'WAITING FOR PAIRINGS',
            shadow: 'none',
            pulse: false
        };
    };

    const timerConfig = getTimerConfig();

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'radial-gradient(circle at top right, #132029, #0a141a)',
                color: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                fontFamily: 'var(--font-main)',
                ...themeStyles
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '5px solid rgba(255, 255, 255, 0.1)',
                    borderTop: '5px solid var(--brand-teal)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <p style={{ marginTop: '20px', fontWeight: '600', letterSpacing: '0.05em' }}>CONNECTING TO ARENA SCREEN...</p>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at top right, #132029, #0a141a)',
            color: '#f8fafc',
            padding: '30px 45px',
            fontFamily: 'var(--font-main)',
            display: 'flex',
            flexDirection: 'column',
            gap: '30px',
            ...themeStyles
        }}>
            {/* Top Navigation / Status Area */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '20px 35px',
                borderRadius: '24px',
                border: '1.5px solid var(--border)',
                backdropFilter: 'blur(12px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Tv size={36} style={{ color: 'var(--brand-teal)' }} />
                    <div>
                        <h1 className="vibrant-text" style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                            {tournament?.name || "Bags & Brats Scoreboard"}
                        </h1>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Arena Projector View
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{
                        fontSize: '16px',
                        fontWeight: '800',
                        color: 'var(--brand-teal)',
                        background: 'var(--brand-teal-glow)',
                        padding: '8px 16px',
                        borderRadius: '16px',
                        border: '1.5px solid var(--brand-teal)',
                        textTransform: 'uppercase'
                    }}>
                        {tournament ? `Day ${tournament.current_day_index + 1}` : 'Day -'}
                    </span>
                    <span style={{
                        fontSize: '16px',
                        fontWeight: '800',
                        color: 'white',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '8px 16px',
                        borderRadius: '16px',
                        border: '1.5px solid var(--border)',
                        textTransform: 'uppercase'
                    }}>
                        {tournament && tournament.current_round > 0 ? `Round ${tournament.current_round}` : 'Pending'}
                    </span>
                </div>
            </header>

            {/* Giant Centered Timer Card */}
            <section style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1.5px solid var(--border)',
                borderRadius: '28px',
                padding: '40px 20px',
                textAlign: 'center',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '300px',
                    height: '300px',
                    background: `radial-gradient(circle, ${timerConfig.color}15 0%, transparent 70%)`,
                    zIndex: 0,
                    pointerEvents: 'none'
                }} />

                <motion.div
                    animate={timerConfig.pulse ? { scale: [1, 1.03, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                    style={{
                        fontFamily: 'monospace',
                        fontSize: '150px',
                        fontWeight: '900',
                        lineHeight: 1,
                        color: timerConfig.color,
                        textShadow: timerConfig.shadow,
                        letterSpacing: '-0.03em',
                        zIndex: 1,
                        position: 'relative',
                        marginBottom: '8px'
                    }}
                >
                    {timerConfig.text}
                </motion.div>

                <div style={{
                    fontSize: '15px',
                    fontWeight: '800',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    zIndex: 1,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <Clock size={16} />
                    {timerConfig.subText}
                </div>
            </section>

            {/* Live Matches Grid Section */}
            <main style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Trophy size={24} style={{ color: 'var(--brand-teal)' }} />
                        Round Matchups & Live Scores
                    </h2>
                    {currentRoundGames.length > 0 && (
                        <span style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: '600' }}>
                            {currentRoundGames.filter(g => g.status === 'finalized').length} of {currentRoundGames.length} Completed
                        </span>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        layout
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
                            gap: '24px'
                        }}
                    >
                        {currentRoundGames.length > 0 ? (
                            currentRoundGames.map((game) => (
                                <CourtCard key={game._id} game={game} />
                            ))
                        ) : (
                            <div style={{
                                gridColumn: '1/-1',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '120px 20px',
                                background: 'rgba(255,255,255,0.01)',
                                border: '1.5px dashed var(--border)',
                                borderRadius: '24px',
                                opacity: 0.4
                            }}>
                                <Trophy size={64} style={{ marginBottom: '16px', color: 'var(--text-muted)' }} />
                                <h3 style={{ fontSize: '22px', fontWeight: '700' }}>No Active Matchups Available</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '6px' }}>
                                    Pairings have not been generated for the current round yet.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default DisplayView;
