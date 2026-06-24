import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Medal, Award, Grid, List } from 'lucide-react';
import API_URL from '../config';
import SocketService from '../services/socket';

const TournamentStandings = () => {
    const [standings, setStandings] = useState([]);
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('simple'); // 'simple' or 'detailed'
    const [sortConfig, setSortConfig] = useState({ key: 'default', direction: 'descending' });

    const fetchStandingsAndTournament = async () => {
        try {
            const [sRes, tRes] = await Promise.all([
                axios.get(`${API_URL}/tournaments/standings`),
                axios.get(`${API_URL}/tournaments/active`)
            ]);
            setStandings(sRes.data);
            setTournament(tRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch standings or tournament details", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStandingsAndTournament();

        // Listen for real-time updates
        SocketService.on('standings_updated', () => {
            fetchStandingsAndTournament();
        });

        return () => {
            SocketService.off('standings_updated');
        };
    }, []);

    const handleSort = (key) => {
        let direction = 'descending';
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'descending') {
                direction = 'ascending';
            } else {
                // Cycle back to default sorting order
                setSortConfig({ key: 'default', direction: 'descending' });
                return;
            }
        }
        setSortConfig({ key, direction });
    };

    const getSortedStandings = () => {
        if (!sortConfig || sortConfig.key === 'default') {
            return [...standings];
        }

        const sorted = [...standings].sort((a, b) => {
            const isDesc = sortConfig.direction === 'descending';

            if (sortConfig.key === 'name') {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                if (nameA < nameB) return isDesc ? 1 : -1;
                if (nameA > nameB) return isDesc ? -1 : 1;
                return 0;
            }

            if (sortConfig.key.startsWith('day_')) {
                const dayIdx = parseInt(sortConfig.key.split('_')[1]);
                const dayA = a.daily_stats?.find(d => d.day_index === dayIdx);
                const dayB = b.daily_stats?.find(d => d.day_index === dayIdx);

                const playedA = dayA && dayA.games_played > 0;
                const playedB = dayB && dayB.games_played > 0;
                
                if (!playedA && !playedB) return 0;
                if (!playedA) return 1; // Put non-playing players at the bottom
                if (!playedB) return -1;

                // Sort by Wins on that day first
                if (dayA.wins !== dayB.wins) {
                    return isDesc ? dayB.wins - dayA.wins : dayA.wins - dayB.wins;
                }
                // Tie-breaker 1: Total points on that day
                if (dayA.total_points !== dayB.total_points) {
                    return isDesc ? dayB.total_points - dayA.total_points : dayA.total_points - dayB.total_points;
                }
                // Tie-breaker 2: Margin on that day
                if (dayA.margin !== dayB.margin) {
                    return isDesc ? dayB.margin - dayA.margin : dayA.margin - dayB.margin;
                }
                return 0;
            }

            // Overall fields
            const valA = a[sortConfig.key] !== undefined ? a[sortConfig.key] : 0;
            const valB = b[sortConfig.key] !== undefined ? b[sortConfig.key] : 0;

            if (valA < valB) return isDesc ? 1 : -1;
            if (valA > valB) return isDesc ? -1 : 1;
            return 0;
        });

        return sorted;
    };

    if (loading) return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Calculating Standings...</div>;
    if (standings.length === 0) return (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
            <Award size={32} style={{ marginBottom: '8px', opacity: 0.3 }} />
            <p>Standings will appear once games are finalized.</p>
        </div>
    );

    const sortedStandings = getSortedStandings();

    const renderHeader = (label, sortKey, style = {}) => {
        const isSorted = sortConfig.key === sortKey;
        const indicator = isSorted ? (sortConfig.direction === 'descending' ? ' ▼' : ' ▲') : '';
        return (
            <th
                onClick={() => handleSort(sortKey)}
                style={{
                    padding: '10px 8px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    userSelect: 'none',
                    color: isSorted ? 'var(--brand-teal)' : 'var(--text-muted)',
                    transition: 'color 0.2s',
                    ...style
                }}
                onMouseEnter={(e) => {
                    if (!isSorted) e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    if (!isSorted) e.currentTarget.style.color = 'var(--text-muted)';
                }}
            >
                <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    justifyContent: style.textAlign === 'center' ? 'center' : 'flex-start', 
                    width: '100%' 
                }}>
                    {label}
                    <span style={{ fontSize: '10px', color: 'var(--brand-teal)', fontWeight: 'bold' }}>{indicator}</span>
                </div>
            </th>
        );
    };

    return (
        <div className="glass-card" style={{ padding: '24px', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Trophy size={20} style={{ color: 'var(--brand-teal)' }} />
                    <h3 style={{ fontSize: '20px', margin: 0 }}>Leaderboard</h3>
                </div>
                
                {/* Simple / Detailed View Mode Toggle */}
                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <button
                        onClick={() => setViewMode('simple')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: viewMode === 'simple' ? 'var(--brand-teal)' : 'transparent',
                            color: viewMode === 'simple' ? '#0a141a' : 'var(--text-muted)',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}
                    >
                        <List size={14} />
                        Simple
                    </button>
                    <button
                        onClick={() => setViewMode('detailed')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: viewMode === 'detailed' ? 'var(--brand-teal)' : 'transparent',
                            color: viewMode === 'detailed' ? '#0a141a' : 'var(--text-muted)',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}
                    >
                        <Grid size={14} />
                        Detailed Stats
                    </button>
                </div>
            </div>

            {viewMode === 'simple' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {sortedStandings.map((player, index) => (
                        <div
                            key={player.user_id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 16px',
                                background: index === 0 ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)',
                                borderRadius: '12px',
                                border: index === 0 ? '1px solid var(--brand-teal)' : '1px solid transparent'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    background: index === 0 ? 'var(--brand-teal)' : 'rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: '800',
                                    color: index === 0 ? '#0a141a' : 'var(--text)'
                                }}>
                                    {index + 1}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600' }}>{player.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                        {player.games_played} Games • {player.wins} Wins • Margin: {player.margin > 0 ? `+${player.margin}` : player.margin}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '20px', fontWeight: '800', color: index === 0 ? 'var(--brand-teal)' : 'white' }}>
                                    {player.total_points || 0}
                                </span>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pts</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ overflowX: 'auto', width: '100%' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', minWidth: '700px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>
                                <th style={{ padding: '10px 8px', fontWeight: '800', width: '50px' }}>Rank</th>
                                {renderHeader('Player', 'name')}
                                {renderHeader('Wins', 'wins', { textAlign: 'center', width: '60px' })}
                                {renderHeader('Games', 'games_played', { textAlign: 'center', width: '60px' })}
                                {renderHeader('Margin', 'margin', { textAlign: 'center', width: '70px' })}
                                {renderHeader('Total Pts', 'total_points', { textAlign: 'center', width: '80px' })}
                                {tournament?.dates?.map((date, idx) => 
                                    renderHeader(`Day ${idx + 1} (W / Pts / Mar)`, `day_${idx}`, { 
                                        textAlign: 'center', 
                                        borderLeft: '1px solid var(--border)', 
                                        width: '140px' 
                                    })
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedStandings.map((player, index) => (
                                <tr
                                    key={player.user_id}
                                    style={{
                                        borderBottom: '1px solid var(--border)',
                                        background: index === 0 ? 'rgba(93, 198, 207, 0.05)' : 'transparent',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <td style={{ padding: '12px 8px', fontWeight: '800', textAlign: 'center' }}>
                                        {index === 0 ? '👑 1' : index + 1}
                                    </td>
                                    <td style={{ padding: '12px 8px', fontWeight: '600', color: 'white' }}>
                                        {player.name}
                                    </td>
                                    <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '700' }}>
                                        {player.wins}
                                    </td>
                                    <td style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        {player.games_played}
                                    </td>
                                    <td style={{ 
                                        padding: '12px 8px', 
                                        textAlign: 'center', 
                                        fontWeight: '800',
                                        color: player.margin > 0 ? '#10b981' : player.margin < 0 ? '#ef4444' : 'var(--text)'
                                    }}>
                                        {player.margin > 0 ? `+${player.margin}` : player.margin}
                                    </td>
                                    <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '800', color: 'var(--brand-teal)' }}>
                                        {player.total_points || 0}
                                    </td>
                                    {tournament?.dates?.map((_, idx) => {
                                        const dayStat = player.daily_stats?.find(d => d.day_index === idx);
                                        if (dayStat && dayStat.games_played > 0) {
                                            return (
                                                <td key={idx} style={{ padding: '12px 8px', textAlign: 'center', borderLeft: '1px solid var(--border)', fontSize: '12px' }}>
                                                    <span style={{ fontWeight: '700', color: 'white' }}>{dayStat.wins}/{dayStat.games_played}</span>
                                                    <span style={{ color: 'rgba(255,255,255,0.15)' }}> | </span>
                                                    <span style={{ fontWeight: '700', color: 'var(--brand-teal)' }}>{dayStat.total_points}</span>
                                                    <span style={{ color: 'rgba(255,255,255,0.15)' }}> | </span>
                                                    <span style={{ 
                                                        fontWeight: '700', 
                                                        color: dayStat.margin > 0 ? '#10b981' : dayStat.margin < 0 ? '#ef4444' : 'var(--text-muted)' 
                                                    }}>
                                                        {dayStat.margin > 0 ? `+${dayStat.margin}` : dayStat.margin}
                                                    </span>
                                                </td>
                                            );
                                        }
                                        return (
                                            <td key={idx} style={{ padding: '12px 8px', textAlign: 'center', borderLeft: '1px solid var(--border)', color: 'rgba(255,255,255,0.15)', fontStyle: 'italic' }}>
                                                -
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TournamentStandings;
