import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Clock, ShieldAlert, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SocketService from '../services/socket';
import API_URL from '../config';

const CourtCard = ({ game }) => {
    const isTeam1Winning = game.score1 > game.score2;
    const isTeam2Winning = game.score2 > game.score1;
    const isFinal = game.status === 'finalized';

    const getBorderColor = () => {
        if (game.status === 'active') return 'var(--brand-teal)';
        if (game.status === 'finalized') return 'rgba(16, 185, 129, 0.3)';
        return 'var(--border)';
    };

    const getBgColor = () => {
        if (game.status === 'active') return 'rgba(99, 102, 241, 0.03)';
        if (game.status === 'finalized') return 'rgba(16, 185, 129, 0.01)';
        return 'rgba(255,255,255,0.01)';
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{
                padding: '24px 32px',
                border: `1px solid ${getBorderColor()}`,
                background: getBgColor(),
                boxShadow: game.status === 'active' ? '0 0 20px var(--brand-teal-glow)' : 'none',
                transition: 'all 0.4s ease'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                    Station {game.court || game.game_number}
                </span>

                <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    background: game.status === 'active' ? 'rgba(96, 165, 250, 0.1)' : 
                                game.status === 'finalized' ? 'rgba(16, 185, 129, 0.1)' : 
                                'rgba(255,255,255,0.05)',
                    color: game.status === 'active' ? '#60a5fa' : 
                           game.status === 'finalized' ? '#10b981' : 
                           'var(--text-muted)',
                    border: `1px solid ${
                        game.status === 'active' ? '#60a5fa' : 
                        game.status === 'finalized' ? '#10b981' : 
                        'var(--border)'
                    }`
                }}>
                    {game.status === 'active' ? 'Active' : 
                     game.status === 'finalized' ? 'Final' : 
                     'Ready'}
                </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'space-between' }}>
                {/* Team 1 */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        {game.team1_player_names?.join(' & ') || '---'}
                    </div>
                    <div style={{
                        fontSize: '56px',
                        fontWeight: '900',
                        color: isFinal && isTeam1Winning ? 'var(--brand-teal)' : 
                               isFinal ? 'var(--text-muted)' : 
                               isTeam1Winning ? 'var(--brand-teal)' : 'white',
                        transition: 'color 0.3s ease'
                    }}>
                        {game.score1}
                    </div>
                </div>

                <div style={{ fontSize: '20px', fontWeight: '900', opacity: 0.1, userSelect: 'none' }}>VS</div>

                {/* Team 2 */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        {game.team2_player_names?.join(' & ') || '---'}
                    </div>
                    <div style={{
                        fontSize: '56px',
                        fontWeight: '900',
                        color: isFinal && isTeam2Winning ? 'var(--brand-teal)' : 
                               isFinal ? 'var(--text-muted)' : 
                               isTeam2Winning ? 'var(--brand-teal)' : 'white',
                        transition: 'color 0.3s ease'
                    }}>
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
    
    const [roundTimer, setRoundTimer] = useState(0);
    const [roundTimerStatus, setRoundTimerStatus] = useState('pending'); // 'pending', 'ready', 'active', 'complete'
    const [timerEndTime, setTimerEndTime] = useState(null);

    const fetchData = async () => {
        try {
            const tRes = await axios.get(`${API_URL}/tournaments/active`);
            setTournament(tRes.data);
            if (tRes.data) {
                setBlackout(tRes.data.status === 'blackout');
                SocketService.connect(tRes.data._id);

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

    useEffect(() => {
        if (games.length === 0) {
            setRoundTimerStatus('pending');
            setRoundTimer(0);
            setTimerEndTime(null);
            return;
        }

        const hasActive = games.some(g => g.status === 'active');
        const allFinalized = games.every(g => g.status === 'finalized');

        if (hasActive) {
            setRoundTimerStatus('active');
            const activeGames = games.filter(g => g.status === 'active' && g.end_time);
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
    }, [games]);

    useEffect(() => {
        if (roundTimerStatus !== 'active' || !timerEndTime) {
            setRoundTimer(0);
            return;
        }

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const diff = Math.max(0, Math.floor((timerEndTime - now) / 1000));
            setRoundTimer(diff);
            if (diff <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [roundTimerStatus, timerEndTime]);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 60px' }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '60px',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '30px 40px',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                backdropFilter: 'blur(10px)'
            }}>
                <div>
                    <h1 className="vibrant-text" style={{ fontSize: '48px', fontWeight: '900', marginBottom: '8px', lineHeight: 1 }}>
                        {tournament?.name || "Bags & Brats"}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
                        <span style={{
                            fontSize: '18px',
                            fontWeight: '800',
                            color: 'var(--brand-teal)',
                            background: 'var(--brand-teal-glow)',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: '1px solid var(--brand-teal)'
                        }}>
                            {tournament ? `Day ${tournament.current_day_index + 1}` : 'Day -'}
                        </span>
                        <span style={{
                            fontSize: '18px',
                            fontWeight: '800',
                            color: 'white',
                            background: 'rgba(255,255,255,0.05)',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: '1px solid var(--border)'
                        }}>
                            {tournament && tournament.current_round > 0 ? `Round ${tournament.current_round}` : 'Rounds Pending'}
                        </span>
                        {games.length > 0 && (
                            <span style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: '600' }}>
                                {games.filter(g => g.status === 'finalized').length} of {games.length} Matches Complete
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div style={{
                        fontFamily: 'monospace',
                        fontSize: '80px',
                        fontWeight: '900',
                        lineHeight: 1,
                        color: roundTimerStatus === 'active' ? (roundTimer < 120 ? '#fbbf24' : 'var(--brand-teal)') : 
                               roundTimerStatus === 'complete' ? '#10b981' : 
                               roundTimerStatus === 'ready' ? '#60a5fa' : 'var(--text-muted)',
                        textShadow: roundTimerStatus === 'active' && roundTimer < 120 ? '0 0 30px rgba(251, 191, 36, 0.4)' : 
                                    roundTimerStatus === 'active' ? '0 0 30px var(--brand-teal-glow)' : 'none',
                        letterSpacing: '-0.05em'
                    }}>
                        {roundTimerStatus === 'active' ? (
                            `${Math.floor(roundTimer / 60)}:${String(roundTimer % 60).padStart(2, '0')}`
                        ) : roundTimerStatus === 'complete' ? (
                            "COMPLETE"
                        ) : roundTimerStatus === 'ready' ? (
                            "READY"
                        ) : (
                            "00:00"
                        )}
                    </div>
                    <span style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: 'var(--text-muted)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginTop: '4px'
                    }}>
                        {roundTimerStatus === 'active' ? 'Round Timer' : 
                         roundTimerStatus === 'complete' ? 'All games complete' : 
                         roundTimerStatus === 'ready' ? 'Pairings generated' : 'Waiting to start'}
                    </span>
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
                            games.map((game) => (
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
