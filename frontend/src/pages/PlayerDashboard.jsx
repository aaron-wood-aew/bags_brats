import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { User, Users, Clock, CheckCircle2, Trophy, Play, Save, Shield, LogOut, Settings, Hourglass, Zap, Calendar, LayoutDashboard, Activity, Plus, Minus } from 'lucide-react';

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
    const [score1, setScore1] = useState(() => {
        const saved = sessionStorage.getItem('bb_score1');
        return saved !== null ? parseInt(saved) : 0;
    });
    const [score2, setScore2] = useState(() => {
        const saved = sessionStorage.getItem('bb_score2');
        return saved !== null ? parseInt(saved) : 0;
    });
    const [scorePulse, setScorePulse] = useState(null); // 'score1' or 'score2'
    const [scoreError, setScoreError] = useState('');
    const [myStats, setMyStats] = useState({ wins: 0, points: 0 });
    const [daySummary, setDaySummary] = useState({ state: 'waiting', games: [], rounds_total: 0, rounds_completed: 0 });
    const [showPowerPlayerToast, setShowPowerPlayerToast] = useState(false);
    const [schedule, setSchedule] = useState(user.attendance_schedule || {});
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');

    const lastTapRef = useRef(0);
    const lastGameIdRef = useRef(null);
    const currentGameRef = useRef(null);
    const userRef = useRef(null);

    // Keep refs updated to prevent stale socket closures
    useEffect(() => {
        currentGameRef.current = currentGame;
    }, [currentGame]);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    const isTimeExpired = () => {
        if (!currentGame || !currentGame.end_time) return false;
        const end = new Date(currentGame.end_time).getTime();
        const now = Date.now();
        return now > end;
    };

    const isScoreLocked = currentGame?.status === 'finalized' || 
        (currentGame?.status === 'active' && isTimeExpired() && user.role !== 'admin');

    // Persist scores locally and send live updates to backend (debounced)
    useEffect(() => {
        if (currentGame && currentGame.status !== 'finalized' && !isScoreLocked) {
            sessionStorage.setItem('bb_score1', score1.toString());
            sessionStorage.setItem('bb_score2', score2.toString());

            const userId = user.id || user._id;
            const isOnTeam1 = currentGame.team1_player_ids?.includes(userId);
            const serverScore1 = isOnTeam1 ? currentGame.score1 : currentGame.score2;
            const serverScore2 = isOnTeam1 ? currentGame.score2 : currentGame.score1;

            console.log(`[LIVE SCORE EFFECT] Local: ${score1}-${score2}, Server: ${serverScore1}-${serverScore2}`);

            // Prevent loops by skipping updates if the local state matches what the server sent
            if (score1 === serverScore1 && score2 === serverScore2) {
                return;
            }

            const delayDebounceFn = setTimeout(async () => {
                try {
                    const token = localStorage.getItem('token');
                    
                    // Map local display scores back to API teams
                    const apiScore1 = isOnTeam1 ? score1 : score2;
                    const apiScore2 = isOnTeam1 ? score2 : score1;

                    console.log(`[LIVE SCORE POST] Sending ${apiScore1}-${apiScore2} for game ${currentGame._id}`);

                    await axios.post(`${API_URL}/games/${currentGame._id}/live-score`, {
                        score1: apiScore1,
                        score2: apiScore2
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } catch (err) {
                    console.error("[LIVE SCORE POST] Failed to send live score update", err);
                }
            }, 500); // 500ms debounce

            return () => clearTimeout(delayDebounceFn);
        }
    }, [score1, score2, currentGame?._id, currentGame?.status]);

    // Sync local scores with server game scores when updated via socket or polling
    useEffect(() => {
        if (currentGame && currentGame.status !== 'finalized') {
            // Ignore server updates if local user tapped recently to prevent lag race conditions
            if (Date.now() - lastTapRef.current < 2000) {
                return;
            }
            const userId = user.id || user._id;
            const isOnTeam1 = currentGame.team1_player_ids?.includes(userId);
            const serverScore1 = isOnTeam1 ? currentGame.score1 : currentGame.score2;
            const serverScore2 = isOnTeam1 ? currentGame.score2 : currentGame.score1;
            
            if (score1 !== serverScore1 || score2 !== serverScore2) {
                console.log(`[LIVE SCORE SYNC] Updating local scores from server: ${serverScore1}-${serverScore2}`);
                setScore1(serverScore1);
                setScore2(serverScore2);
                sessionStorage.setItem('bb_score1', serverScore1.toString());
                sessionStorage.setItem('bb_score2', serverScore2.toString());
            }
        }
    }, [currentGame?.score1, currentGame?.score2]);

    // Reset scores when a NEW game starts (different game ID) or load initial scores from server
    useEffect(() => {
        if (currentGame) {
            const userId = user.id || user._id;
            const isOnTeam1 = currentGame.team1_player_ids?.includes(userId);
            const serverScore1 = isOnTeam1 ? currentGame.score1 : currentGame.score2;
            const serverScore2 = isOnTeam1 ? currentGame.score2 : currentGame.score1;

            if (currentGame._id !== lastGameIdRef.current) {
                lastGameIdRef.current = currentGame._id;
                const savedGameId = sessionStorage.getItem('bb_game_id');
                if (savedGameId === currentGame._id) {
                    const saved1 = sessionStorage.getItem('bb_score1');
                    const saved2 = sessionStorage.getItem('bb_score2');
                    setScore1(saved1 !== null ? parseInt(saved1) : serverScore1);
                    setScore2(saved2 !== null ? parseInt(saved2) : serverScore2);
                } else {
                    setScore1(serverScore1);
                    setScore2(serverScore2);
                    sessionStorage.setItem('bb_game_id', currentGame._id);
                    sessionStorage.setItem('bb_score1', serverScore1.toString());
                    sessionStorage.setItem('bb_score2', serverScore2.toString());
                }
            }
        }
    }, [currentGame?._id]);


    const formatDateShort = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const toggleScheduleDate = async (dateStr) => {
        let currentStatus = schedule[dateStr];
        let nextStatus;
        if (currentStatus === undefined) {
            nextStatus = true;
        } else if (currentStatus === true) {
            nextStatus = false;
        } else {
            nextStatus = null;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_URL}/user/schedule`, {
                date: dateStr,
                status: nextStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSchedule(res.data.attendance_schedule || {});
            
            // Sync with local storage
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ 
                ...currentUser, 
                attendance_schedule: res.data.attendance_schedule 
            }));
        } catch (err) {
            console.error("Failed to update schedule", err);
        }
    };

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
                setSchedule(uRes.data.attendance_schedule || {});

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
                        if (myPair) {
                            setCurrentGame(myPair);
                            if (myPair.status === 'active') {
                                setActiveTab('live');
                            }
                        }
                    });
                }

                // Fetch current game (active or upcoming)
                const gRes = await axios.get(`${API_URL}/player/current-game`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (gRes.data) {
                    setCurrentGame(gRes.data);
                    if (gRes.data.status === 'active') {
                        setActiveTab('live');
                    }
                } else {
                    setCurrentGame(null);
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

                // Listen for real-time live score updates to keep teammates in sync without re-fetching API
                SocketService.on('live_score_updated', (data) => {
                    const currentG = currentGameRef.current;
                    const currentUser = userRef.current;
                    if (currentG && data.game_id === currentG._id) {
                        // Update currentGame locally in state
                        setCurrentGame(prev => prev ? { ...prev, score1: data.score1, score2: data.score2 } : null);

                        // Sync local user track scores if they haven't tapped recently
                        if (Date.now() - lastTapRef.current >= 2000) {
                            const userId = currentUser.id || currentUser._id;
                            const isOnTeam1 = currentG.team1_player_ids?.includes(userId);
                            const serverScore1 = isOnTeam1 ? data.score1 : data.score2;
                            const serverScore2 = isOnTeam1 ? data.score2 : data.score1;

                            setScore1(serverScore1);
                            setScore2(serverScore2);
                            sessionStorage.setItem('bb_score1', serverScore1.toString());
                            sessionStorage.setItem('bb_score2', serverScore2.toString());
                        }
                    }
                });

            } catch (err) {
                console.error("Dashboard fetch error", err);
            }
        };
        fetchData();

        return () => {
            SocketService.off('standings_updated', fetchData);
            SocketService.off('live_score_updated');
            SocketService.disconnect();
        };
    }, []);

    // Show Power Player toast after 12 seconds for non-Power Players if not dismissed
    useEffect(() => {
        if (user && !user.is_power_player) {
            const isDismissed = localStorage.getItem('power_player_dismissed') === 'true';
            if (isDismissed) return;

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
    }, [currentGame?._id, currentGame?.status, currentGame?.end_time]);

    // Automatically redirect to dashboard if the active game is completed/finalized
    useEffect(() => {
        if (currentGame === null) {
            if (activeTab === 'live') {
                setActiveTab('dashboard');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentGame]);

    const [checkInError, setCheckInError] = useState('');

    const handleCheckIn = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/player/check-in`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCheckedIn(true);
            setCheckInError('');
        } catch (err) {
            if (err.response?.data?.check_in_closed) {
                setCheckInError(err.response.data.error);
            } else {
                console.error("Check-in failed", err);
                setCheckInError("Check-in failed. Please try again.");
            }
        }
    };

    const handleSubmitScore = async () => {
        if (isScoreLocked) {
            setScoreError("Time has expired. Scores are locked.");
            return;
        }
        if (score1 === 0 && score2 === 0) {
            setScoreError("Both scores can't be zero. Track the score first!");
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const userId = user.id || user._id;
            const isOnTeam1 = currentGame.team1_player_ids?.includes(userId);
            
            // score1 state = "Your Team" score (left panel)
            // score2 state = "Opponents" score (right panel)
            // API expects: score1 = Team 1's score, score2 = Team 2's score
            // If player is on Team 2, their "Your Team" score is actually Team 2's score
            const apiScore1 = isOnTeam1 ? score1 : score2;
            const apiScore2 = isOnTeam1 ? score2 : score1;
            
            await axios.post(`${API_URL}/games/${currentGame._id}/submit`, {
                score1: apiScore1,
                score2: apiScore2
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Clear sessionStorage
            sessionStorage.removeItem('bb_score1');
            sessionStorage.removeItem('bb_score2');
            sessionStorage.removeItem('bb_game_id');
            
            setCurrentGame(null);
            setScore1(0);
            setScore2(0);
            setScoreError('');
            setActiveTab('dashboard');
            // Refresh day summary

            const dsRes = await axios.get(`${API_URL}/player/day-summary`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDaySummary(dsRes.data);
        } catch (err) {
            setScoreError("Submission failed. Try again.");
        }
    };

    const handleScoreIncrement = (which, delta) => {
        if (isScoreLocked) return;
        lastTapRef.current = Date.now();
        const setter = which === 'score1' ? setScore1 : setScore2;
        setter(prev => {
            const next = Math.max(0, Math.min(50, prev + delta));
            if (next !== prev) {
                // Trigger pulse animation
                setScorePulse(which);
                setTimeout(() => setScorePulse(null), 300);
                // Haptic feedback
                if (navigator.vibrate) navigator.vibrate(10);
            }
            return next;
        });
    };

    // Render session content based on state
    const renderSessionContent = () => {
        // Active game takes priority
        if (currentGame) {
            const isPowerGame = currentGame.is_power_game;
            const isSuddenDeath = currentGame.is_sudden_death;

            const isOnTeam1 = currentGame.team1_player_ids?.includes(user.id || user._id);
            // For display: "Your Team" score = team's actual score, "Opponents" = other team's score
            const myTeamScore = isOnTeam1 ? currentGame.score1 : currentGame.score2;
            const oppTeamScore = isOnTeam1 ? currentGame.score2 : currentGame.score1;

            // Helper to render player names for a team
            const renderTeamNames = (names, isMyTeam) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minHeight: '40px', justifyContent: 'center' }}>
                    {names?.map(name => {
                        const hasPowerIcon = name.includes('⚡');
                        const cleanName = name.replace(' ⚡', '');
                        const isMe = isMyTeam && cleanName === user.name;
                        return (
                            <span key={name} style={{
                                fontSize: '14px',
                                fontWeight: isMe ? '800' : '600',
                                color: hasPowerIcon ? '#fbbf24' : (isMe ? 'white' : 'rgba(255,255,255,0.8)'),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px'
                            }}>
                                {hasPowerIcon && <Zap size={12} style={{ color: '#fbbf24' }} />}
                                {cleanName}
                                {hasPowerIcon && <Zap size={12} style={{ color: '#fbbf24' }} />}
                            </span>
                        );
                    })}
                </div>
            );

            const myTeamNames = isOnTeam1 ? currentGame.team1_player_names : currentGame.team2_player_names;
            const oppTeamNames = isOnTeam1 ? currentGame.team2_player_names : currentGame.team1_player_names;

            const isFinalized = currentGame.status === 'finalized';

            // Score panel component
            const ScorePanel = ({ label, teamNames, isMyTeam, score, scoreKey, color, colorGlow, colorBorder }) => (
                <div style={{
                    flex: 1,
                    background: `linear-gradient(180deg, ${colorGlow}, rgba(0,0,0,0))`,
                    border: `1px solid ${colorBorder}`,
                    borderRadius: '16px',
                    padding: '16px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Team label */}
                    <div style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: color,
                        opacity: 0.9
                    }}>
                        {label}
                    </div>

                    {/* Player names */}
                    {renderTeamNames(teamNames, isMyTeam)}

                    {/* + Button */}
                    <button
                        onClick={() => !isScoreLocked && handleScoreIncrement(scoreKey, 1)}
                        disabled={isScoreLocked}
                        style={{
                            width: '100%',
                            height: '56px',
                            borderRadius: '12px',
                            border: `2px solid ${isScoreLocked ? 'rgba(255,255,255,0.05)' : colorBorder}`,
                            background: isScoreLocked ? 'rgba(255,255,255,0.02)' : `linear-gradient(135deg, ${colorGlow}, rgba(0,0,0,0))`,
                            color: isScoreLocked ? 'var(--text-muted)' : color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: isScoreLocked ? 'not-allowed' : 'pointer',
                            opacity: isScoreLocked ? 0.3 : 1,
                            transition: 'all 0.15s ease',
                            fontSize: '28px',
                            fontWeight: '800'
                        }}
                    >
                        <Plus size={28} strokeWidth={3} />
                    </button>

                    {/* Score display */}
                    <motion.div
                        key={`${scoreKey}-${score}`}
                        initial={{ scale: 1 }}
                        animate={{ scale: scorePulse === scoreKey ? [1, 1.25, 1] : 1 }}
                        transition={{ duration: 0.25 }}
                        style={{
                            fontSize: '52px',
                            fontWeight: '900',
                            color: 'white',
                            lineHeight: 1,
                            textShadow: `0 0 30px ${colorGlow}`,
                            minWidth: '60px',
                            textAlign: 'center',
                            padding: '4px 0'
                        }}
                    >
                        {isFinalized ? (scoreKey === 'score1' ? myTeamScore : oppTeamScore) : score}
                    </motion.div>

                    {/* - Button */}
                    <button
                        onClick={() => !isScoreLocked && handleScoreIncrement(scoreKey, -1)}
                        disabled={isScoreLocked || score === 0}
                        style={{
                            width: '100%',
                            height: '56px',
                            borderRadius: '12px',
                            border: `2px solid ${isScoreLocked || score === 0 ? 'rgba(255,255,255,0.05)' : colorBorder}`,
                            background: 'rgba(255,255,255,0.02)',
                            color: isScoreLocked || score === 0 ? 'rgba(255,255,255,0.15)' : color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: (isScoreLocked || score === 0) ? 'not-allowed' : 'pointer',
                            opacity: (isScoreLocked || score === 0) ? 0.3 : 0.7,
                            transition: 'all 0.15s ease',
                            fontSize: '28px',
                            fontWeight: '800'
                        }}
                    >
                        <Minus size={28} strokeWidth={3} />
                    </button>
                </div>
            );

            return (
                <div>
                    {/* Sudden Death Championship Banner */}
                    {isSuddenDeath && (
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(185, 28, 28, 0.1))',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 0 15px rgba(239, 68, 68, 0.15)'
                        }}>
                            <Trophy size={20} style={{ color: '#ef4444' }} />
                            <span style={{ color: '#ef4444', fontWeight: '900', fontSize: '14px', letterSpacing: '0.05em' }}>SUDDEN DEATH CHAMPIONSHIP ROUND ⚔️</span>
                            <Trophy size={20} style={{ color: '#ef4444' }} />
                        </div>
                    )}

                    {/* Power Game Banner */}
                    {isPowerGame && !isSuddenDeath && (
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.1))',
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '16px',
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

                    {/* Station Indicator */}
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <div style={{ 
                            display: 'inline-block',
                            background: isSuddenDeath ? 'rgba(239, 68, 68, 0.08)' : 'rgba(139, 92, 246, 0.08)',
                            border: isSuddenDeath ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(139, 92, 246, 0.2)',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: '800',
                            color: isSuddenDeath ? '#ef4444' : '#a78bfa',
                            boxShadow: isSuddenDeath ? '0 0 15px rgba(239, 68, 68, 0.15)' : '0 0 15px rgba(139, 92, 246, 0.15)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Station {currentGame.court || currentGame.game_number || "—"}
                        </div>
                    </div>

                    {/* Score Tracker Panels */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                        <ScorePanel
                            label="Your Team"
                            teamNames={myTeamNames}
                            isMyTeam={true}
                            score={score1}
                            scoreKey="score1"
                            color={isSuddenDeath ? "#ef4444" : "#10b981"}
                            colorGlow={isSuddenDeath ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.12)"}
                            colorBorder={isSuddenDeath ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)"}
                        />
                        <ScorePanel
                            label="Opponents"
                            teamNames={oppTeamNames}
                            isMyTeam={false}
                            score={score2}
                            scoreKey="score2"
                            color={isSuddenDeath ? "#ef4444" : "#f97316"}
                            colorGlow={isSuddenDeath ? "rgba(239, 68, 68, 0.12)" : "rgba(249, 115, 22, 0.12)"}
                            colorBorder={isSuddenDeath ? "rgba(239, 68, 68, 0.3)" : "rgba(249, 115, 22, 0.3)"}
                        />
                    </div>

                    {scoreError && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>{scoreError}</p>}

                    {isFinalized ? (
                        <div style={{ 
                            background: isSuddenDeath ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                            padding: '16px', 
                            borderRadius: '12px', 
                            border: isSuddenDeath ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid #10b98133', 
                            color: isSuddenDeath ? '#ef4444' : '#10b981', 
                            fontWeight: '700', 
                            textAlign: 'center' 
                        }}>
                            Match Result Finalized
                        </div>
                    ) : (
                        <button
                            className="btn-primary"
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                padding: '16px',
                                fontSize: '16px',
                                fontWeight: '800',
                                background: isScoreLocked 
                                    ? 'rgba(255,255,255,0.05)'
                                    : (score1 > 0 || score2 > 0) 
                                        ? (isSuddenDeath ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg, var(--brand-teal), #48abb3)') 
                                        : 'rgba(255,255,255,0.05)',
                                opacity: isScoreLocked ? 0.35 : ((score1 > 0 || score2 > 0) ? 1 : 0.5),
                                border: isScoreLocked ? '1px solid rgba(255,255,255,0.05)' : ((score1 > 0 || score2 > 0) ? 'none' : '1px solid var(--border)'),
                                color: isScoreLocked ? 'var(--text-muted)' : ((score1 > 0 || score2 > 0) ? 'white' : 'var(--text-muted)'),
                                cursor: isScoreLocked ? 'not-allowed' : 'pointer'
                            }}
                            onClick={handleSubmitScore}
                            disabled={isScoreLocked || (score1 === 0 && score2 === 0)}
                        >
                            <Save size={20} />
                            Submit Final Score
                        </button>
                    )}
                    <p style={{ 
                        fontSize: '11px', 
                        color: isScoreLocked && !isFinalized ? '#ef4444' : 'var(--text-muted)', 
                        marginTop: '12px', 
                        textAlign: 'center',
                        fontWeight: isScoreLocked && !isFinalized ? '700' : 'normal'
                    }}>
                        {isFinalized 
                            ? "Results have been recorded by the Director or a teammate." 
                            : isScoreLocked 
                                ? "Time has expired. Scores are locked. Contact Tournament Director." 
                                : "Tap + or − to track. Only one player needs to submit."}
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
                <div style={{ display: 'grid', gap: '20px' }}>
                    {/* Tab Navigation */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            style={{
                                flex: 1,
                                padding: '12px 16px',
                                borderRadius: '12px',
                                background: activeTab === 'dashboard' ? 'var(--brand-teal-glow)' : 'transparent',
                                border: activeTab === 'dashboard' ? '1px solid var(--brand-teal)' : '1px solid transparent',
                                color: activeTab === 'dashboard' ? 'var(--brand-teal)' : 'var(--text-muted)',
                                fontWeight: '700',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <LayoutDashboard size={18} />
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('live')}
                            style={{
                                flex: 1,
                                padding: '12px 16px',
                                borderRadius: '12px',
                                background: activeTab === 'live' ? 'var(--brand-teal-glow)' : 'transparent',
                                border: activeTab === 'live' ? '1px solid var(--brand-teal)' : '1px solid transparent',
                                color: activeTab === 'live' ? 'var(--brand-teal)' : 'var(--text-muted)',
                                fontWeight: '700',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                position: 'relative'
                            }}
                        >
                            <Activity size={18} />
                            Live Match
                            {currentGame?.status === 'active' && (
                                <span style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    width: '10px',
                                    height: '10px',
                                    background: '#fbbf24',
                                    borderRadius: '50%',
                                    border: '2px solid var(--bg)'
                                }} />
                            )}
                        </button>
                    </div>

                    {/* DASHBOARD TAB CONTENT */}
                    {activeTab === 'dashboard' && (
                        <div style={{ display: 'grid', gap: '20px' }}>
                            {/* Check-In Card — only on tournament days */}
                            {tournament?.is_tournament_day ? (
                                <>
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
                                                        {checkInError && (
                                                            <div style={{
                                                                background: 'rgba(251, 191, 36, 0.1)',
                                                                border: '1px solid rgba(251, 191, 36, 0.3)',
                                                                borderRadius: '8px',
                                                                padding: '12px',
                                                                marginBottom: '16px',
                                                                color: '#fbbf24',
                                                                fontSize: '13px',
                                                                textAlign: 'center'
                                                            }}>
                                                                ⏰ {checkInError}
                                                            </div>
                                                        )}
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
                                </>
                            ) : tournament ? (
                                <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Calendar size={22} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                                    <div>
                                        <div style={{ fontWeight: '600', marginBottom: '2px' }}>No tournament today</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                            {(() => {
                                                const nextDate = tournament.dates?.find(d => d > (tournament.today || ''));
                                                if (nextDate) {
                                                    const dt = new Date(nextDate + 'T12:00:00');
                                                    return `Next game day: ${dt.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`;
                                                }
                                                return 'Check back for the next game day.';
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {/* Attendance Planner Card */}
                            {tournament.dates && tournament.dates.some((_, idx) => idx > tournament.current_day_index && !(tournament.cancelled_dates || []).includes(idx)) && (
                                <div className="glass-card" style={{ padding: '24px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                        <Calendar size={22} style={{ color: 'var(--brand-teal)' }} />
                                        <h3 style={{ fontSize: '18px' }}>Attendance Planner</h3>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: '20px', marginLeft: 'auto' }}>Optional</span>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px', lineHeight: '1.5' }}>
                                        Help us plan match courts by indicating which upcoming dates you expect to attend or miss. Tap to toggle.
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                        {tournament.dates.map((dateStr, idx) => {
                                            if (idx <= tournament.current_day_index) return null;
                                            if ((tournament.cancelled_dates || []).includes(idx)) return null;
                                            
                                            const status = schedule[dateStr];
                                            let borderColor = 'var(--border)';
                                            let bgColor = 'rgba(255,255,255,0.02)';
                                            let textColor = 'var(--text-muted)';
                                            let planLabel = 'Undecided';
                                            
                                            if (status === true) {
                                                borderColor = '#10b981';
                                                bgColor = 'rgba(16, 185, 129, 0.08)';
                                                textColor = '#10b981';
                                                planLabel = 'Attending';
                                            } else if (status === false) {
                                                borderColor = '#ef4444';
                                                bgColor = 'rgba(239, 68, 68, 0.08)';
                                                textColor = '#ef4444';
                                                planLabel = 'Skipping';
                                            }
                                            
                                            return (
                                                <button
                                                    key={dateStr}
                                                    onClick={() => toggleScheduleDate(dateStr)}
                                                    style={{
                                                        background: bgColor,
                                                        border: `2px solid ${borderColor}`,
                                                        borderRadius: '16px',
                                                        padding: '12px 16px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        cursor: 'pointer',
                                                        minWidth: '95px',
                                                        transition: 'all 0.2s ease',
                                                        flex: '1 1 calc(33.333% - 8px)'
                                                    }}
                                                    className="schedule-btn"
                                                >
                                                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>
                                                        {formatDateShort(dateStr)}
                                                    </span>
                                                    <span style={{ fontSize: '11px', color: textColor, fontWeight: '700', textTransform: 'uppercase' }}>
                                                        {planLabel}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Personal Stats */}
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

                    {/* LIVE GAME TAB CONTENT */}
                    {activeTab === 'live' && (
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div className="glass-card" style={{
                                padding: '24px',
                                border: currentGame?.status === 'active' && timer === 0 ? '1px solid #ef4444' : '1px solid var(--border)',
                                boxShadow: currentGame?.status === 'active' && timer === 0 ? '0 0 20px rgba(239, 68, 68, 0.1)' : 'none',
                                transition: 'all 0.5s ease'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                        <Users size={24} style={{ color: 'var(--brand-teal)' }} />
                                        <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Your Session</h3>
                                        {currentGame && (
                                            <span style={{
                                                fontSize: '11px',
                                                textTransform: 'uppercase',
                                                padding: '2px 8px',
                                                borderRadius: '20px',
                                                background: 'rgba(139, 92, 246, 0.1)',
                                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                                color: '#a78bfa',
                                                fontWeight: '800',
                                                boxShadow: '0 0 10px rgba(139, 92, 246, 0.1)',
                                                marginLeft: '4px'
                                            }}>
                                                Station {currentGame.court || currentGame.game_number}
                                            </span>
                                        )}
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
                        </div>
                    )}
                </div>
            )}


            {/* Power Player Toast Notification */}
            <AnimatePresence>
                {showPowerPlayerToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        style={{
                            position: 'fixed',
                            bottom: '24px',
                            left: '50%',
                            width: 'calc(100% - 32px)',
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
                                            localStorage.setItem('power_player_dismissed', 'true');
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
                                        onClick={() => {
                                            localStorage.setItem('power_player_dismissed', 'true');
                                            setShowPowerPlayerToast(false);
                                        }}
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
