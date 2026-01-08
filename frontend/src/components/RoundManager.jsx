import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Square, Activity, Check, Clock, Loader } from 'lucide-react';
import API_URL from '../config';

/**
 * RoundManager - Displays round cards with status and controls
 * Shows each round with its current status and appropriate action buttons
 */
const RoundManager = ({ tournament, onUpdate }) => {
    const [roundStatus, setRoundStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchRoundStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/admin/round/status`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRoundStatus(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch round status", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tournament) {
            fetchRoundStatus();
            const interval = setInterval(fetchRoundStatus, 5000);
            return () => clearInterval(interval);
        }
    }, [tournament]);

    const handleGeneratePairings = async (roundNumber) => {
        setActionLoading(`generate-${roundNumber}`);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/admin/generate-pairings`, {
                round_number: roundNumber,
                day_index: roundStatus?.day_index || 0
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRoundStatus();
            if (onUpdate) onUpdate();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to generate pairings");
        }
        setActionLoading(null);
    };

    const handleStartRound = async (roundNumber) => {
        if (!window.confirm(`Start Round ${roundNumber}? This will begin the 20-minute countdown for all games.`)) return;
        setActionLoading(`start-${roundNumber}`);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/admin/round/start`, {
                round_number: roundNumber,
                day_index: roundStatus?.day_index || 0
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRoundStatus();
            if (onUpdate) onUpdate();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to start round");
        }
        setActionLoading(null);
    };

    const handleStopRound = async (roundNumber) => {
        if (!window.confirm(`Stop Round ${roundNumber}? This will finalize all active games with their current scores.`)) return;
        setActionLoading(`stop-${roundNumber}`);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/admin/round/stop`, {
                round_number: roundNumber,
                day_index: roundStatus?.day_index || 0
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRoundStatus();
            if (onUpdate) onUpdate();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to stop round");
        }
        setActionLoading(null);
    };

    if (loading) {
        return (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '8px' }}>Loading rounds...</p>
            </div>
        );
    }

    if (!roundStatus) {
        return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>No round data available</div>;
    }

    const getStatusConfig = (status) => {
        switch (status) {
            case 'complete':
                return { icon: Check, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', label: 'Complete' };
            case 'active':
                return { icon: Play, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', label: 'Active' };
            case 'ready':
                return { icon: Clock, color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)', label: 'Ready' };
            default:
                return { icon: Clock, color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.03)', label: 'Pending' };
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
            }}>
                <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>
                    Day {roundStatus.day_number} • {roundStatus.rounds_per_day} Rounds
                </h4>
            </div>

            {roundStatus.rounds.map((round) => {
                const config = getStatusConfig(round.status);
                const StatusIcon = config.icon;
                const isLoading = actionLoading?.includes(round.round_number);

                return (
                    <div
                        key={round.round_number}
                        style={{
                            background: config.bg,
                            border: `1px solid ${round.status === 'active' ? config.color : 'var(--border)'}`,
                            borderRadius: '12px',
                            padding: '16px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    background: round.status === 'active' ? config.color : 'rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: round.status === 'active' ? 'black' : 'var(--text-muted)'
                                }}>
                                    <span style={{ fontWeight: '800', fontSize: '16px' }}>{round.round_number}</span>
                                </div>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '15px' }}>Round {round.round_number}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                        {round.total_games} games
                                        {round.finalized_games > 0 && ` • ${round.finalized_games} finalized`}
                                        {round.active_games > 0 && ` • ${round.active_games} active`}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    background: config.bg,
                                    color: config.color,
                                    border: `1px solid ${config.color}`
                                }}>
                                    {config.label}
                                </span>

                                {/* Action Buttons */}
                                {round.status === 'pending' && (
                                    <button
                                        onClick={() => handleGeneratePairings(round.round_number)}
                                        disabled={isLoading}
                                        style={{
                                            background: 'var(--brand-teal)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <Activity size={14} />
                                        {isLoading ? 'Generating...' : 'Pairings'}
                                    </button>
                                )}

                                {round.status === 'ready' && (
                                    <button
                                        onClick={() => handleStartRound(round.round_number)}
                                        disabled={isLoading}
                                        style={{
                                            background: '#10b981',
                                            color: 'white',
                                            border: 'none',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <Play size={14} />
                                        {isLoading ? 'Starting...' : 'Start'}
                                    </button>
                                )}

                                {round.status === 'active' && (
                                    <button
                                        onClick={() => handleStopRound(round.round_number)}
                                        disabled={isLoading}
                                        style={{
                                            background: '#fb923c',
                                            color: 'white',
                                            border: 'none',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <Square size={14} />
                                        {isLoading ? 'Stopping...' : 'Stop'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default RoundManager;
