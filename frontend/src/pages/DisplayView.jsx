import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Trophy, Clock, Tv, Volume2, VolumeX } from 'lucide-react';
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
        return 'rgba(255, 255, 255, 0.08)';
    };

    const getBgColor = () => {
        if (isActive) return 'rgba(93, 198, 207, 0.05)';
        if (isFinal) return 'rgba(16, 185, 129, 0.02)';
        return 'rgba(255,255,255,0.01)';
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="glass-card"
            style={{
                padding: '1.5vh 2vw',
                border: `2px solid ${getBorderColor()}`,
                background: getBgColor(),
                boxShadow: isActive ? '0 0 15px var(--brand-teal-glow)' : 'none',
                opacity: isFinal ? 0.55 : 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                boxSizing: 'border-box',
                borderRadius: '16px',
                transition: 'all 0.3s ease'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5vh' }}>
                <span style={{ 
                    fontSize: '2vh', 
                    fontWeight: '800', 
                    textTransform: 'uppercase', 
                    color: isActive ? 'var(--brand-teal)' : '#f8fafc',
                    letterSpacing: '0.05em'
                }}>
                    Station {game.court || game.game_number}
                </span>

                <span style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '1.1vh',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    background: isActive ? 'rgba(93, 198, 207, 0.15)' : 
                                isFinal ? 'rgba(16, 185, 129, 0.15)' : 
                                'rgba(255,255,255,0.05)',
                    color: isActive ? 'var(--brand-teal)' : 
                           isFinal ? '#10b981' : 
                           'var(--text-muted)',
                    border: `1px solid ${
                        isActive ? 'var(--brand-teal)' : 
                        isFinal ? '#10b981' : 
                        'rgba(255, 255, 255, 0.1)'
                    }`
                }}>
                    {isActive ? 'Live' : isFinal ? 'Final' : 'Ready'}
                </span>
            </div>

            {/* Giant Centered Scores */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '2vw',
                flexGrow: 1
            }}>
                <span style={{
                    fontSize: '6vh',
                    fontWeight: '900',
                    fontFamily: 'monospace',
                    color: isFinal && isTeam1Winning ? 'var(--brand-teal)' : 
                           isFinal ? 'var(--text-muted)' : 
                           isActive && isTeam1Winning ? 'var(--brand-teal)' : 'white',
                    textShadow: isActive && isTeam1Winning ? '0 0 10px var(--brand-teal-glow)' : 'none',
                    lineHeight: 1
                }}>
                    {game.score1}
                </span>

                <span style={{ 
                    fontSize: '3.5vh', 
                    fontWeight: '800', 
                    opacity: 0.15,
                    color: 'white',
                    lineHeight: 1
                }}>
                    —
                </span>

                <span style={{
                    fontSize: '6vh',
                    fontWeight: '900',
                    fontFamily: 'monospace',
                    color: isFinal && isTeam2Winning ? 'var(--brand-teal)' : 
                           isFinal ? 'var(--text-muted)' : 
                           isActive && isTeam2Winning ? 'var(--brand-teal)' : 'white',
                    textShadow: isActive && isTeam2Winning ? '0 0 10px var(--brand-teal-glow)' : 'none',
                    lineHeight: 1
                }}>
                    {game.score2}
                </span>
            </div>
        </motion.div>
    );
};

const DisplayView = () => {
    const [tournament, setTournament] = useState(null);
    const [games, setGames] = useState([]);
    const [roundTimer, setRoundTimer] = useState(0);
    const [roundTimerStatus, setRoundTimerStatus] = useState('pending');
    const [timerEndTime, setTimerEndTime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);

    const audioFlagsRef = useRef({
        played2M: false,
        played1M: false,
        playedBuzzer: false,
        lastTickTime: null
    });

    const playDoubleBeep = () => {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;
            const ctx = new AudioContextClass();
            
            // Beep 1
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(880, ctx.currentTime);
            gain1.gain.setValueAtTime(0.3, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start();
            osc1.stop(ctx.currentTime + 0.15);
            
            // Beep 2
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
            gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.2);
            gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(ctx.currentTime + 0.2);
            osc2.stop(ctx.currentTime + 0.35);
        } catch (e) {
            console.error("Failed playing warning beep:", e);
        }
    };

    const playTick = () => {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.08);
        } catch (e) {
            console.error("Failed playing countdown tick:", e);
        }
    };

    const playBuzzer = () => {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;
            const ctx = new AudioContextClass();
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(100, ctx.currentTime);
            
            osc2.type = 'square';
            osc2.frequency.setValueAtTime(102, ctx.currentTime); // slightly detuned for chorus effect
            
            gain.gain.setValueAtTime(0.8, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 1.2);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);
            
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);
            
            osc1.start();
            osc2.start();
            osc1.stop(ctx.currentTime + 1.8);
            osc2.stop(ctx.currentTime + 1.8);
        } catch (e) {
            console.error("Failed playing final buzzer:", e);
        }
    };

    const enableAudio = () => {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                const ctx = new AudioContextClass();
                if (ctx.state === 'suspended') {
                    ctx.resume();
                }
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.frequency.value = 1000;
                gain.gain.value = 0.0001;
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.05);
            }
            setIsAudioEnabled(true);
        } catch (e) {
            console.error("Failed to enable audio context", e);
        }
    };

    const toggleAudio = () => {
        if (!isAudioEnabled) {
            enableAudio();
        } else {
            setIsAudioEnabled(false);
        }
    };

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

        const pollInterval = setInterval(fetchData, 5000); // 5-second polling fallback

        SocketService.on('standings_updated', fetchData);
        SocketService.on('pairings_revealed', fetchData);
        
        SocketService.on('live_score_updated', (data) => {
            setGames(prevGames => 
                prevGames.map(g => 
                    g._id === data.game_id 
                        ? { ...g, score1: data.score1, score2: data.score2 } 
                        : g
                )
            );
        });

        return () => {
            clearInterval(pollInterval);
            SocketService.off('standings_updated', fetchData);
            SocketService.off('pairings_revealed', fetchData);
            SocketService.off('live_score_updated');
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

        const activeGames = currentRoundGames.filter(g => g.status === 'active');
        const hasActive = activeGames.length > 0;
        const allFinalized = currentRoundGames.every(g => g.status === 'finalized');

        if (hasActive) {
            // Check if active games are in pre-round countdown
            const firstActive = activeGames[0];
            const startMs = firstActive?.start_time ? new Date(firstActive.start_time).getTime() : 0;
            const nowMs = Date.now();
            
            if (startMs > nowMs) {
                setRoundTimerStatus('starting');
                setTimerEndTime(startMs);
            } else {
                setRoundTimerStatus('active');
                const maxEnd = Math.max(...activeGames.map(g => g.end_time ? new Date(g.end_time).getTime() : 0));
                setTimerEndTime(maxEnd);
            }
        } else if (allFinalized) {
            setRoundTimerStatus('complete');
            setRoundTimer(0);
            setTimerEndTime(null);
            audioFlagsRef.current = { played2M: false, played1M: false, playedBuzzer: false, lastTickTime: null };
        } else {
            setRoundTimerStatus('ready');
            setRoundTimer(0);
            setTimerEndTime(null);
            audioFlagsRef.current = { played2M: false, played1M: false, playedBuzzer: false, lastTickTime: null };
        }
    }, [games, tournament]);

    useEffect(() => {
        if ((roundTimerStatus !== 'active' && roundTimerStatus !== 'starting') || !timerEndTime) {
            setRoundTimer(0);
            return;
        }

        const tick = () => {
            const now = new Date().getTime();
            const diff = Math.max(0, Math.floor((timerEndTime - now) / 1000));
            setRoundTimer(diff);

            // If starting countdown finishes, transition automatically to active
            if (roundTimerStatus === 'starting' && diff <= 0) {
                const activeGames = currentRoundGames.filter(g => g.status === 'active');
                if (activeGames.length > 0) {
                    setRoundTimerStatus('active');
                    const maxEnd = Math.max(...activeGames.map(g => g.end_time ? new Date(g.end_time).getTime() : 0));
                    setTimerEndTime(maxEnd);
                }
            }
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [roundTimerStatus, timerEndTime, currentRoundGames]);

    useEffect(() => {
        if ((roundTimerStatus !== 'active' && roundTimerStatus !== 'starting') || !isAudioEnabled) {
            if (roundTimerStatus !== 'active' && roundTimerStatus !== 'starting') {
                audioFlagsRef.current = { played2M: false, played1M: false, playedBuzzer: false, lastTickTime: null };
            }
            return;
        }
        
        if (roundTimerStatus === 'starting') {
            if (roundTimer > 0) {
                if (audioFlagsRef.current.lastTickTime !== roundTimer) {
                    audioFlagsRef.current.lastTickTime = roundTimer;
                    playTick();
                }
            }
            return;
        }
        
        if (roundTimer > 120) {
            audioFlagsRef.current.played2M = false;
        }
        if (roundTimer > 60) {
            audioFlagsRef.current.played1M = false;
        }
        if (roundTimer > 0) {
            audioFlagsRef.current.playedBuzzer = false;
        }

        if (roundTimer <= 120 && roundTimer > 115 && !audioFlagsRef.current.played2M) {
            audioFlagsRef.current.played2M = true;
            playDoubleBeep();
        }
        
        if (roundTimer <= 60 && roundTimer > 55 && !audioFlagsRef.current.played1M) {
            audioFlagsRef.current.played1M = true;
            playDoubleBeep();
        }
        
        if (roundTimer <= 10 && roundTimer >= 1) {
            if (audioFlagsRef.current.lastTickTime !== roundTimer) {
                audioFlagsRef.current.lastTickTime = roundTimer;
                playTick();
            }
        }
        
        if (roundTimer === 0 && !audioFlagsRef.current.playedBuzzer) {
            audioFlagsRef.current.playedBuzzer = true;
            playBuzzer();
        }
    }, [roundTimer, roundTimerStatus, isAudioEnabled]);

    const getTimerConfig = () => {
        if (roundTimerStatus === 'starting') {
            return {
                color: '#60a5fa',
                text: String(roundTimer),
                subText: 'ROUND STARTING IN...',
                shadow: '0 0 30px rgba(96, 165, 250, 0.4)',
                pulse: true
            };
        }
        if (roundTimerStatus === 'active') {
            if (roundTimer < 30) {
                return {
                    color: '#ef4444',
                    text: `${Math.floor(roundTimer / 60)}:${String(roundTimer % 60).padStart(2, '0')}`,
                    subText: 'CRITICAL TIME REMAINING',
                    shadow: '0 0 30px rgba(239, 68, 68, 0.4)',
                    pulse: true
                };
            }
            if (roundTimer < 120) {
                return {
                    color: '#fbbf24',
                    text: `${Math.floor(roundTimer / 60)}:${String(roundTimer % 60).padStart(2, '0')}`,
                    subText: 'TWO MINUTES REMAINING',
                    shadow: '0 0 30px rgba(251, 191, 36, 0.3)',
                    pulse: true
                };
            }
            return {
                color: 'var(--brand-teal)',
                text: `${Math.floor(roundTimer / 60)}:${String(roundTimer % 60).padStart(2, '0')}`,
                subText: 'ROUND TIMER ACTIVE',
                shadow: '0 0 30px var(--brand-teal-glow)',
                pulse: false
            };
        }
        if (roundTimerStatus === 'complete') {
            return {
                color: '#10b981',
                text: 'COMPLETE',
                subText: 'ALL GAMES RECORDED',
                shadow: '0 0 20px rgba(16, 185, 129, 0.3)',
                pulse: false
            };
        }
        if (roundTimerStatus === 'ready') {
            return {
                color: '#60a5fa',
                text: 'READY',
                subText: 'WAITING FOR ADMIN TO START',
                shadow: '0 0 20px rgba(96, 165, 250, 0.3)',
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

    // Dynamically calculate grid columns based on count
    const getGridColumns = () => {
        const count = currentRoundGames.length;
        if (count <= 4) return `repeat(${count || 1}, 1fr)`;
        if (count <= 9) return 'repeat(3, 1fr)';
        return 'repeat(4, 1fr)';
    };

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
                    width: '40px',
                    height: '40px',
                    border: '4px solid rgba(255, 255, 255, 0.1)',
                    borderTop: '4px solid var(--brand-teal)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <p style={{ marginTop: '16px', fontWeight: '600', letterSpacing: '0.05em', fontSize: '14px' }}>CONNECTING TO ARENA SCREEN...</p>
            </div>
        );
    }

    return (
        <div style={{
            height: '100vh',
            maxHeight: '100vh',
            background: 'radial-gradient(circle at top right, #132029, #0a141a)',
            color: '#f8fafc',
            padding: '2.5vh 3vw',
            fontFamily: 'var(--font-main)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            overflow: 'hidden',
            gap: '2vh',
            ...themeStyles
        }}>
            {/* Header Area */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '1.5vh 2.5vw',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                backdropFilter: 'blur(12px)',
                height: '8vh',
                boxSizing: 'border-box',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
                    <Tv size={28} style={{ color: 'var(--brand-teal)' }} />
                    <div>
                        <h1 className="vibrant-text" style={{ fontSize: '2.8vh', fontWeight: '900', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                            {tournament?.name || "Bags & Brats"}
                        </h1>
                        <p style={{ fontSize: '1.2vh', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Arena Projector View
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.8vw', alignItems: 'center' }}>
                    <button
                        onClick={toggleAudio}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: isAudioEnabled ? 'rgba(93, 198, 207, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                            border: `1px solid ${isAudioEnabled ? 'var(--brand-teal)' : '#ef4444'}`,
                            color: isAudioEnabled ? 'var(--brand-teal)' : '#ef4444',
                            padding: '0.6vh 1.2vw',
                            borderRadius: '10px',
                            fontSize: '1.3vh',
                            fontWeight: '800',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}
                    >
                        {isAudioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                        {isAudioEnabled ? 'Audio Active' : 'Audio Muted (Click to Unmute)'}
                    </button>

                    {isAudioEnabled && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4vw',
                            background: 'rgba(255, 255, 255, 0.03)',
                            padding: '0.4vh 0.8vw',
                            borderRadius: '10px',
                            border: '1px solid var(--border)'
                        }}>
                            <button
                                onClick={playDoubleBeep}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--brand-teal)',
                                    fontSize: '1.2vh',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    padding: '0.2vh 0.5vw',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    transition: 'opacity 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.opacity = 0.7}
                                onMouseLeave={(e) => e.target.style.opacity = 1}
                            >
                                Warning Beep
                            </button>
                            <span style={{ color: 'rgba(255, 255, 255, 0.1)', fontSize: '1.2vh' }}>|</span>
                            <button
                                onClick={playTick}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--brand-teal)',
                                    fontSize: '1.2vh',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    padding: '0.2vh 0.5vw',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    transition: 'opacity 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.opacity = 0.7}
                                onMouseLeave={(e) => e.target.style.opacity = 1}
                            >
                                Tick
                            </button>
                            <span style={{ color: 'rgba(255, 255, 255, 0.1)', fontSize: '1.2vh' }}>|</span>
                            <button
                                onClick={playBuzzer}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--brand-teal)',
                                    fontSize: '1.2vh',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    padding: '0.2vh 0.5vw',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    transition: 'opacity 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.opacity = 0.7}
                                onMouseLeave={(e) => e.target.style.opacity = 1}
                            >
                                Buzzer
                            </button>
                        </div>
                    )}

                    <span style={{
                        fontSize: '1.4vh',
                        fontWeight: '800',
                        color: 'var(--brand-teal)',
                        background: 'var(--brand-teal-glow)',
                        padding: '0.6vh 1.2vw',
                        borderRadius: '10px',
                        border: '1px solid var(--brand-teal)',
                        textTransform: 'uppercase'
                    }}>
                        {tournament ? `Day ${tournament.current_day_index + 1}` : 'Day -'}
                    </span>
                    <span style={{
                        fontSize: '1.4vh',
                        fontWeight: '800',
                        color: 'white',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '0.6vh 1.2vw',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        textTransform: 'uppercase'
                    }}>
                        {tournament && tournament.current_round > 0 ? `Round ${tournament.current_round}` : 'Pending'}
                    </span>
                </div>
            </header>

            {/* Giant Centered Timer Card */}
            <section style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '1.5vh 0',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '24vh',
                boxSizing: 'border-box',
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '200px',
                    height: '200px',
                    background: `radial-gradient(circle, ${timerConfig.color}10 0%, transparent 70%)`,
                    zIndex: 0,
                    pointerEvents: 'none'
                }} />

                <motion.div
                    animate={timerConfig.pulse ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                    style={{
                        fontFamily: 'monospace',
                        fontSize: '13vh',
                        fontWeight: '900',
                        lineHeight: 1,
                        color: timerConfig.color,
                        textShadow: timerConfig.shadow,
                        letterSpacing: '-0.02em',
                        zIndex: 1,
                        position: 'relative'
                    }}
                >
                    {timerConfig.text}
                </motion.div>

                <div style={{
                    fontSize: '1.3vh',
                    fontWeight: '800',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    zIndex: 1,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '0.5vh'
                }}>
                    <Clock size={12} />
                    {timerConfig.subText}
                </div>
            </section>

            {/* Live Matches Grid Section */}
            <main style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1vh',
                height: '56vh',
                boxSizing: 'border-box',
                flexGrow: 1,
                overflow: 'hidden'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, height: '3vh' }}>
                    <h2 style={{ fontSize: '2vh', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Trophy size={18} style={{ color: 'var(--brand-teal)' }} />
                        Live Scoreboard
                    </h2>
                    {currentRoundGames.length > 0 && (
                        <span style={{ fontSize: '1.4vh', color: 'var(--text-muted)', fontWeight: '600' }}>
                            {currentRoundGames.filter(g => g.status === 'finalized').length} of {currentRoundGames.length} Complete
                        </span>
                    )}
                </div>

                <div style={{ flexGrow: 1, height: '52vh', overflow: 'hidden' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            layout
                            style={{
                                display: 'grid',
                                gridTemplateColumns: getGridColumns(),
                                gap: '1.5vh 1.5vw',
                                height: '100%',
                                boxSizing: 'border-box'
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
                                    height: '100%',
                                    background: 'rgba(255,255,255,0.01)',
                                    border: '1px dashed var(--border)',
                                    borderRadius: '16px',
                                    opacity: 0.3
                                }}>
                                    <Trophy size={36} style={{ marginBottom: '8px', color: 'var(--text-muted)' }} />
                                    <h3 style={{ fontSize: '1.8vh', fontWeight: '700' }}>Waiting for Matchups...</h3>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default DisplayView;
