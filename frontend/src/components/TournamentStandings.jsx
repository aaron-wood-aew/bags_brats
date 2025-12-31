import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Medal, Award } from 'lucide-react';
import API_URL from '../config';
import SocketService from '../services/socket';

const TournamentStandings = () => {
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStandings = async () => {
        try {
            const res = await axios.get(`${API_URL}/tournaments/standings`);
            setStandings(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch standings", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStandings();

        // Listen for real-time updates
        SocketService.on('standings_updated', () => {
            fetchStandings();
        });

        return () => {
            SocketService.off('standings_updated');
        };
    }, []);

    if (loading) return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Calculating Standings...</div>;
    if (standings.length === 0) return (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
            <Award size={32} style={{ marginBottom: '8px', opacity: 0.3 }} />
            <p>Standings will appear once games are finalized.</p>
        </div>
    );

    return (
        <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <Trophy size={20} style={{ color: 'var(--brand-teal)' }} />
                <h3 style={{ fontSize: '20px' }}>Leaderboard</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {standings.map((player, index) => (
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
                                fontWeight: '800'
                            }}>
                                {index + 1}
                            </div>
                            <div>
                                <div style={{ fontWeight: '600' }}>{player.name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{player.games_played} Games Played</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px', fontWeight: '800', color: index === 0 ? 'var(--brand-teal)' : 'white' }}>
                                {player.wins}
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Wins</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TournamentStandings;
