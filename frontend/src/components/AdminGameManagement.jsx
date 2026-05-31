import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import SocketService from '../services/socket';
import { Trophy, Activity, Edit2, Lock, Unlock, Clock, Save, Play, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminGameManagement = () => {
    const [games, setGames] = useState([]);
    const [tournament, setTournament] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchGames = async () => {
        try {
            const token = localStorage.getItem('token');

            // Fetch active tournament first to know current day/round context
            const tRes = await axios.get(`${API_URL}/tournaments/active`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTournament(tRes.data);

            // Fetch all games
            const res = await axios.get(`${API_URL}/admin/games`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGames(res.data);

            // Initialize default expanded sections (active day and round)
            if (tRes.data) {
                const activeKey = `${tRes.data.current_day_index}-${tRes.data.current_round}`;
                setExpandedSections(prev => {
                    // Always make sure the active day/round is expanded when data reloads
                    return { ...prev, [activeKey]: true };
                });
            }

            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch games", err);
        }
    };

    useEffect(() => {
        fetchGames();

        SocketService.on('standings_updated', fetchGames);
        SocketService.on('pairings_revealed', fetchGames);

        return () => {
            SocketService.off('standings_updated', fetchGames);
            SocketService.off('pairings_revealed', fetchGames);
        };
    }, []);

    const [editingGame, setEditingGame] = useState(null);
    const [editData, setEditData] = useState({ score1: 0, score2: 0, status: '' });

    const handleStartEdit = (game) => {
        setEditingGame(game._id);
        setEditData({ score1: game.score1, score2: game.score2, status: game.status });
    };

    const handleUpdate = async (gameId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/admin/games/${gameId}`, editData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingGame(null);
            fetchGames();
        } catch (err) {
            alert("Failed to update game");
        }
    };

    const handleStartGame = async (gameId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/games/${gameId}/start`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchGames();
        } catch (err) {
            alert("Failed to start game");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'var(--brand-teal)';
            case 'finalized': return '#10b981';
            case 'upcoming': return 'var(--text-muted)';
            default: return 'var(--text-muted)';
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const toggleSection = (dayIndex, roundNum) => {
        const key = `${dayIndex}-${roundNum}`;
        setExpandedSections(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Group games by day_index and round_number
    const getGroupedGames = () => {
        const groups = {};
        games.forEach(game => {
            const day = game.day_index !== undefined ? game.day_index : 0;
            const round = game.round_number !== undefined ? game.round_number : 1;
            
            if (!groups[day]) {
                groups[day] = {};
            }
            if (!groups[day][round]) {
                groups[day][round] = [];
            }
            groups[day][round].push(game);
        });
        return groups;
    };

    if (loading) return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Loading Games...</div>;

    const grouped = getGroupedGames();
    
    // Sort day indexes descending so current/latest day is at the top
    const sortedDayIndexes = Object.keys(grouped)
        .map(Number)
        .sort((a, b) => b - a);

    return (
        <div className="glass-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Activity style={{ color: 'var(--brand-teal)' }} />
                <h3 style={{ fontSize: '24px' }}>Tournament Games</h3>
            </div>

            {sortedDayIndexes.map((dayIndex) => {
                const dayRounds = grouped[dayIndex];
                // Sort round numbers descending so latest round is at the top within a day
                const sortedRoundNumbers = Object.keys(dayRounds)
                    .map(Number)
                    .sort((a, b) => b - a);
                
                const dateStr = tournament?.dates?.[dayIndex];
                const isCurrentDay = tournament?.current_day_index === dayIndex;

                return (
                    <div key={dayIndex} style={{ marginBottom: '32px' }}>
                        {/* Day Section Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '16px',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            paddingBottom: '8px'
                        }}>
                            <Calendar size={18} style={{ color: isCurrentDay ? 'var(--brand-teal)' : 'var(--text-muted)' }} />
                            <h4 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: isCurrentDay ? 'white' : 'var(--text-muted)' }}>
                                Day {dayIndex + 1} {dateStr ? `— ${formatDate(dateStr)}` : ''}
                            </h4>
                            {isCurrentDay && (
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: '800',
                                    color: 'var(--brand-teal)',
                                    background: 'var(--brand-teal-glow)',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--brand-teal)'
                                }}>
                                    TODAY
                                </span>
                            )}
                        </div>

                        {/* Rounds Collapsible Group */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {sortedRoundNumbers.map((roundNum) => {
                                const roundGames = dayRounds[roundNum];
                                const sectionKey = `${dayIndex}-${roundNum}`;
                                const isExpanded = expandedSections[sectionKey];

                                // Determine aggregate status of the round
                                let roundStatus = 'upcoming';
                                if (roundGames.some(g => g.status === 'active')) {
                                    roundStatus = 'active';
                                } else if (roundGames.every(g => g.status === 'finalized')) {
                                    roundStatus = 'finalized';
                                }

                                return (
                                    <div key={roundNum} style={{ display: 'flex', flexDirection: 'column' }}>
                                        {/* Collapsible Round Header */}
                                        <div
                                            onClick={() => toggleSection(dayIndex, roundNum)}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '16px 20px',
                                                background: 'rgba(255, 255, 255, 0.02)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                marginBottom: isExpanded ? '16px' : '0px',
                                            }}
                                            className="round-header"
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontSize: '15px', fontWeight: '700' }}>
                                                    Round {roundNum}
                                                </span>
                                                <span style={{
                                                    fontSize: '10px',
                                                    textTransform: 'uppercase',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    background: getStatusColor(roundStatus) + '33',
                                                    color: getStatusColor(roundStatus),
                                                    fontWeight: '800'
                                                }}>
                                                    {roundStatus}
                                                </span>
                                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                    ({roundGames.length} {roundGames.length === 1 ? 'game' : 'games'})
                                                </span>
                                            </div>
                                            <div>
                                                {isExpanded ? <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />}
                                            </div>
                                        </div>

                                        {/* Game Cards Grid under this Round */}
                                        <AnimatePresence initial={false}>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    style={{ overflow: 'hidden' }}
                                                >
                                                    <div style={{ 
                                                        display: 'grid', 
                                                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                                                        gap: '20px', 
                                                        padding: '4px 2px 16px 2px' 
                                                    }}>
                                                        {roundGames.map((game) => (
                                                            <motion.div
                                                                key={game._id}
                                                                layout
                                                                style={{
                                                                    padding: '20px',
                                                                    background: 'rgba(255,255,255,0.03)',
                                                                    borderRadius: '12px',
                                                                    border: editingGame === game._id ? '1px solid var(--brand-teal)' : '1px solid var(--border)',
                                                                    boxShadow: editingGame === game._id ? '0 0 20px var(--brand-teal-glow)' : 'none'
                                                                }}
                                                            >
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                            <Clock size={12} /> Court {game.court}
                                                                        </span>
                                                                        {game.status === 'active' && game.end_time && (
                                                                            <span style={{
                                                                                fontSize: '12px',
                                                                                fontWeight: '800',
                                                                                color: (new Date(game.end_time).getTime() - now.getTime()) <= 0 ? '#ef4444' :
                                                                                    (new Date(game.end_time).getTime() - now.getTime()) < 120000 ? '#fbbf24' : 'var(--brand-teal)'
                                                                            }}>
                                                                                ({Math.max(0, Math.floor((new Date(game.end_time).getTime() - now.getTime()) / 60000))}:
                                                                                {String(Math.max(0, Math.floor(((new Date(game.end_time).getTime() - now.getTime()) % 60000) / 1000))).padStart(2, '0')})
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {editingGame === game._id ? (
                                                                        <select
                                                                            value={editData.status}
                                                                            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                                                            style={{
                                                                                background: 'rgba(255, 255, 255, 0.05)',
                                                                                color: 'var(--text)',
                                                                                border: '1px solid var(--border)',
                                                                                borderRadius: '6px',
                                                                                fontSize: '11px',
                                                                                fontWeight: '600',
                                                                                padding: '4px 24px 4px 8px',
                                                                                cursor: 'pointer',
                                                                                outline: 'none',
                                                                                transition: 'all 0.2s ease',
                                                                                appearance: 'none',
                                                                                WebkitAppearance: 'none',
                                                                                backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m3 5 3 3 3-3'/%3E%3C/svg%3E")`,
                                                                                backgroundRepeat: 'no-repeat',
                                                                                backgroundPosition: 'right 6px center'
                                                                            }}
                                                                        >
                                                                            <option value="upcoming" style={{ background: 'var(--bg)', color: 'var(--text)' }}>Upcoming</option>
                                                                            <option value="active" style={{ background: 'var(--bg)', color: 'var(--text)' }}>Active</option>
                                                                            <option value="finalized" style={{ background: 'var(--bg)', color: 'var(--text)' }}>Finalized</option>
                                                                        </select>
                                                                    ) : (
                                                                        <span style={{
                                                                            fontSize: '10px',
                                                                            textTransform: 'uppercase',
                                                                            padding: '2px 6px',
                                                                            borderRadius: '4px',
                                                                            background: getStatusColor(game.status) + '33',
                                                                            color: getStatusColor(game.status),
                                                                            fontWeight: '800'
                                                                        }}>
                                                                            {game.status}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                                                    <div style={{ flex: 1, textAlign: 'center' }}>
                                                                        <div style={{ fontSize: '13px', fontWeight: '600', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                            {game.team1_player_names?.join(' & ') || 'Unknown Team'}
                                                                        </div>
                                                                        {editingGame === game._id ? (
                                                                            <input
                                                                                type="number"
                                                                                value={editData.score1}
                                                                                onChange={(e) => setEditData({ ...editData, score1: e.target.value })}
                                                                                className="input-field"
                                                                                style={{ padding: '8px', textAlign: 'center', marginBottom: '0', marginTop: '8px' }}
                                                                            />
                                                                        ) : (
                                                                            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--brand-teal)', marginTop: '8px' }}>{game.score1}</div>
                                                                        )}
                                                                    </div>

                                                                    <div style={{ opacity: 0.3, fontSize: '12px', marginTop: '20px' }}>VS</div>

                                                                    <div style={{ flex: 1, textAlign: 'center' }}>
                                                                        <div style={{ fontSize: '13px', fontWeight: '600', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                            {game.team2_player_names?.join(' & ') || 'Unknown Team'}
                                                                        </div>
                                                                        {editingGame === game._id ? (
                                                                            <input
                                                                                type="number"
                                                                                value={editData.score2}
                                                                                onChange={(e) => setEditData({ ...editData, score2: e.target.value })}
                                                                                className="input-field"
                                                                                style={{ padding: '8px', textAlign: 'center', marginBottom: '0', marginTop: '8px' }}
                                                                            />
                                                                        ) : (
                                                                            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--brand-teal)', marginTop: '8px' }}>{game.score2}</div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', gap: '8px' }}>
                                                                    {editingGame === game._id ? (
                                                                        <>
                                                                            <button
                                                                                className="btn-primary"
                                                                                style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                                                                                onClick={() => handleUpdate(game._id)}
                                                                            >
                                                                                <Save size={14} style={{ marginRight: '6px' }} /> Save
                                                                            </button>
                                                                            <button
                                                                                style={{ flex: 1, padding: '8px', fontSize: '12px', background: 'none', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '12px', cursor: 'pointer' }}
                                                                                onClick={() => setEditingGame(null)}
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                                                                            {game.status === 'upcoming' && (
                                                                                <button
                                                                                    className="btn-primary"
                                                                                    style={{ flex: 1, padding: '8px', fontSize: '12px', background: 'var(--brand-teal)', color: 'white' }}
                                                                                    onClick={() => handleStartGame(game._id)}
                                                                                >
                                                                                    <Play size={14} style={{ marginRight: '6px' }} /> Start
                                                                                </button>
                                                                            )}
                                                                            <button
                                                                                className="btn-primary"
                                                                                style={{ flex: 1, padding: '8px', fontSize: '12px', background: 'rgba(255,255,255,0.05)', color: 'var(--text)', border: '1px solid var(--border)' }}
                                                                                onClick={() => handleStartEdit(game)}
                                                                            >
                                                                                <Edit2 size={14} style={{ marginRight: '6px' }} /> Override
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {games.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No games found for this tournament.
                </div>
            )}
        </div>
    );
};

export default AdminGameManagement;
