import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Users, Sliders, Plus, LayoutList, Activity, Calendar, Check, X, Lock, Unlock, ChevronLeft, ChevronRight, LogOut, LayoutDashboard, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminProxyRegister from '../components/AdminProxyRegister';
import AdminUserManagement from '../components/AdminUserManagement';
import AdminGameManagement from '../components/AdminGameManagement';
import TournamentStandings from '../components/TournamentStandings';
import RoundManager from '../components/RoundManager';
import ThemeToggle from '../components/ThemeToggle';
import API_URL from '../config';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('controls');
    const [activeTournament, setActiveTournament] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [tournamentName, setTournamentName] = useState('');
    const [roundsPerDay, setRoundsPerDay] = useState(3);
    const [selectedDates, setSelectedDates] = useState([]); // Array of YYYY-MM-DD
    const [viewDate, setViewDate] = useState(new Date()); // Controls which month we see
    const [selectedDayIndex, setSelectedDayIndex] = useState(null); // For day tabs navigation
    const [allGamesComplete, setAllGamesComplete] = useState(false);
    const navigate = useNavigate();

    const fetchActiveTournament = async () => {
        try {
            const res = await axios.get(`${API_URL}/tournaments/active`);
            setActiveTournament(res.data);
        } catch (err) {
            console.error("Failed to fetch active tournament", err);
        }
    };

    useEffect(() => {
        fetchActiveTournament();
    }, []);

    // Sync selectedDayIndex with tournament's current day
    useEffect(() => {
        if (activeTournament && selectedDayIndex === null) {
            setSelectedDayIndex(activeTournament.current_day_index || 0);
        }
    }, [activeTournament, selectedDayIndex]);

    // Check if all games are complete for the Big Reveal
    useEffect(() => {
        const checkGamesComplete = async () => {
            if (!activeTournament) return;
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/games`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const todayGames = res.data.filter(g => g.day_index === activeTournament.current_day_index);
                const allFinalized = todayGames.length > 0 && todayGames.every(g => g.status === 'finalized');
                setAllGamesComplete(allFinalized);
            } catch (err) {
                console.error('Failed to check games status', err);
            }
        };
        checkGamesComplete();
        // Re-check every 10 seconds
        const interval = setInterval(checkGamesComplete, 10000);
        return () => clearInterval(interval);
    }, [activeTournament]);


    const handleCreateTournament = async (e) => {
        e.preventDefault();
        if (selectedDates.length === 0) {
            alert("Please select at least one date.");
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/tournaments`, {
                name: tournamentName,
                dates: selectedDates.sort(),
                rounds_per_day: roundsPerDay
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setShowCreateForm(false);
            setTournamentName('');
            setRoundsPerDay(3);
            setSelectedDates([]);
            fetchActiveTournament();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to create tournament");
        }
    };

    const handleGeneratePairings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/admin/generate-pairings`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Pairings generated and broadcasted!");
        } catch (err) {
            alert(err.response?.data?.error || "Failed to generate pairings");
        }
    };

    const handleClearTournament = async () => {
        if (!window.confirm("Delete ALL tournaments and games?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/admin/tournaments/bulk-delete`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchActiveTournament();
        } catch (err) {
            alert("Failed to clear tournament");
        }
    };

    const handleToggleBlackout = async (status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/admin/tournament/blackout`, { blackout: status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchActiveTournament();
        } catch (err) {
            alert("Failed to toggle blackout mode");
        }
    };

    const handleStartAllGames = async () => {
        if (!window.confirm("This will start ALL upcoming games for the current round and begin the 20-minute countdown. Proceed?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/admin/tournament/start-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Gameday pulse activated! All games started.");
        } catch (err) {
            alert(err.response?.data?.error || "Failed to start all games");
        }
    };

    const handleStopAllGames = async () => {
        if (!window.confirm("This will FINALIZE all active games with their current scores. Proceed?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/admin/tournament/stop-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(res.data.msg || "All games finalized!");
        } catch (err) {
            alert(err.response?.data?.error || "Failed to stop games");
        }
    };

    const TabButton = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: activeTab === id ? 'var(--brand-teal-glow)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: activeTab === id ? 'var(--brand-teal)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s'
            }}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 className="vibrant-text" style={{ fontSize: '36px' }}>Director Control Center</h2>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', overflowX: 'auto' }}>
                        <TabButton id="controls" icon={Sliders} label="Controls" />
                        <TabButton id="overview" icon={Trophy} label="Overview" />
                        <TabButton id="roster" icon={Users} label="Global Roster" />
                        <TabButton id="games" icon={Activity} label="Live Games" />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <ThemeToggle />
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            background: 'var(--glass)',
                            border: '1px solid var(--border)',
                            color: 'var(--text)',
                            padding: '10px 16px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            fontWeight: '700'
                        }}
                    >
                        <LayoutDashboard size={18} />
                        <span>Player View</span>
                    </button>
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            navigate('/login');
                        }}
                        style={{
                            background: 'none',
                            border: '1px solid var(--border)',
                            color: 'var(--text-muted)',
                            padding: '10px 12px',
                            borderRadius: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            <div style={{ marginTop: '24px' }}>
                {activeTab === 'controls' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

                        {/* Tournament Creation / Status */}
                        <div className="glass-card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <Sliders size={20} style={{ color: 'var(--brand-teal)' }} />
                                <h3 style={{ fontSize: '22px' }}>Tournament Lifecycle</h3>
                            </div>

                            {!activeTournament ? (
                                !showCreateForm ? (
                                    <button
                                        onClick={() => setShowCreateForm(true)}
                                        className="btn-primary"
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    >
                                        <Plus size={18} />
                                        Create New Tournament
                                    </button>
                                ) : (
                                    <form onSubmit={handleCreateTournament} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <input
                                            placeholder="Tournament Name"
                                            value={tournamentName}
                                            onChange={(e) => setTournamentName(e.target.value)}
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', padding: '12px', borderRadius: '8px' }}
                                            required
                                        />

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Rounds per day:</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={roundsPerDay}
                                                onChange={(e) => setRoundsPerDay(parseInt(e.target.value) || 3)}
                                                style={{
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid var(--border)',
                                                    color: 'white',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    width: '70px',
                                                    textAlign: 'center'
                                                }}
                                            />
                                        </div>

                                        <div style={{ marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Select Tournament Days:</p>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <button type="button" onClick={() => {
                                                        const d = new Date(viewDate);
                                                        d.setMonth(d.getMonth() - 1);
                                                        setViewDate(d);
                                                    }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                                        <ChevronLeft size={16} />
                                                    </button>
                                                    <span style={{ fontSize: '12px', fontWeight: '700', minWidth: '80px', textAlign: 'center' }}>
                                                        {viewDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <button type="button" onClick={() => {
                                                        const d = new Date(viewDate);
                                                        d.setMonth(d.getMonth() + 1);
                                                        setViewDate(d);
                                                    }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                                        <ChevronRight size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                                    <div key={i} style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700' }}>{d}</div>
                                                ))}

                                                {/* Calendar Grid */}
                                                {(() => {
                                                    const days = [];
                                                    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
                                                    const lastDay = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);

                                                    // Padding for start of month
                                                    for (let i = 0; i < firstDay.getDay(); i++) {
                                                        days.push(<div key={`pad-${i}`} />);
                                                    }

                                                    // Actual days
                                                    for (let i = 1; i <= lastDay.getDate(); i++) {
                                                        const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), i);
                                                        const dateStr = d.toISOString().split('T')[0];
                                                        const isSelected = selectedDates.includes(dateStr);
                                                        const isToday = new Date().toISOString().split('T')[0] === dateStr;

                                                        days.push(
                                                            <button
                                                                key={dateStr}
                                                                type="button"
                                                                onClick={() => {
                                                                    if (isSelected) {
                                                                        setSelectedDates(selectedDates.filter(date => date !== dateStr));
                                                                    } else {
                                                                        setSelectedDates([...selectedDates, dateStr]);
                                                                    }
                                                                }}
                                                                style={{
                                                                    padding: '8px 0',
                                                                    borderRadius: '6px',
                                                                    background: isSelected ? 'var(--brand-teal)' : 'rgba(255,255,255,0.03)',
                                                                    border: isToday && !isSelected ? '1px solid var(--brand-teal-glow)' : '1px solid transparent',
                                                                    color: isSelected ? 'white' : 'var(--text-muted)',
                                                                    cursor: 'pointer',
                                                                    fontSize: '13px',
                                                                    fontWeight: isSelected ? '800' : '500',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                {i}
                                                            </button>
                                                        );
                                                    }
                                                    return days;
                                                })()}
                                            </div>
                                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'center' }}>
                                                {selectedDates.length} days selected
                                            </p>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button type="submit" className="btn-primary" style={{ flex: 1 }}>Start Tournament</button>
                                            <button type="button" onClick={() => setShowCreateForm(false)} className="btn-primary" style={{ flex: 1, background: 'none', border: '1px solid var(--border)', color: 'var(--text)' }}>Cancel</button>
                                        </div>
                                    </form>
                                )
                            ) : (
                                <div>
                                    <div style={{ background: 'var(--brand-teal-glow)', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--brand-teal)' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--brand-teal)', fontWeight: '700', textTransform: 'uppercase' }}>Active Tournament</div>
                                        <div style={{ fontSize: '18px', fontWeight: '800', margin: '4px 0' }}>{activeTournament.name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{activeTournament.dates.length} Days • Day {(selectedDayIndex ?? activeTournament.current_day_index) + 1}</div>
                                    </div>

                                    {/* Day Tabs */}
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
                                        {activeTournament.dates.map((date, idx) => {
                                            const isSelected = idx === (selectedDayIndex ?? activeTournament.current_day_index);
                                            const isCurrent = idx === activeTournament.current_day_index;
                                            const isPast = idx < activeTournament.current_day_index;
                                            const isFuture = idx > activeTournament.current_day_index;

                                            const displayDate = new Date(date + 'T12:00:00');
                                            const dayName = displayDate.toLocaleDateString('en-US', { weekday: 'short' });
                                            const dayNum = displayDate.getDate();

                                            return (
                                                <button
                                                    key={date}
                                                    onClick={() => setSelectedDayIndex(idx)}
                                                    style={{
                                                        padding: '10px 16px',
                                                        borderRadius: '8px',
                                                        border: isSelected ? '2px solid var(--brand-teal)' : '1px solid var(--border)',
                                                        background: isSelected ? 'var(--brand-teal-glow)' : 'rgba(255,255,255,0.02)',
                                                        color: isSelected ? 'var(--brand-teal)' : isPast ? 'var(--text-muted)' : 'white',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        minWidth: '60px',
                                                        opacity: isPast ? 0.7 : 1,
                                                        position: 'relative'
                                                    }}
                                                >
                                                    <span style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>{dayName}</span>
                                                    <span style={{ fontSize: '18px', fontWeight: '800' }}>{dayNum}</span>
                                                    {isCurrent && (
                                                        <span style={{
                                                            position: 'absolute',
                                                            top: '-6px',
                                                            right: '-6px',
                                                            width: '12px',
                                                            height: '12px',
                                                            background: '#10b981',
                                                            borderRadius: '50%',
                                                            border: '2px solid var(--bg)'
                                                        }} />
                                                    )}
                                                    {isPast && (
                                                        <Check size={12} style={{ color: '#10b981', marginTop: '2px' }} />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Round Manager - only show for current day */}
                                    {(selectedDayIndex ?? activeTournament.current_day_index) === activeTournament.current_day_index ? (
                                        <RoundManager tournament={activeTournament} onUpdate={fetchActiveTournament} />
                                    ) : (selectedDayIndex ?? 0) < activeTournament.current_day_index ? (
                                        /* Past day - show completed games */
                                        <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', textAlign: 'center' }}>
                                            <Check size={32} style={{ color: '#10b981', marginBottom: '8px' }} />
                                            <div style={{ fontWeight: '700', marginBottom: '4px' }}>Day Completed</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>View game results in the Games tab</div>
                                        </div>
                                    ) : (
                                        /* Future day - not yet started */
                                        <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', textAlign: 'center' }}>
                                            <Calendar size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                                            <div style={{ fontWeight: '700', marginBottom: '4px' }}>Upcoming Day</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Pairings will be generated when this day begins</div>
                                        </div>
                                    )}

                                    {/* End Tournament Button */}
                                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                                        <button
                                            onClick={handleClearTournament}
                                            className="btn-primary"
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: '1px solid #ef4444',
                                                color: '#ef4444'
                                            }}
                                        >
                                            <X size={18} />
                                            End Tournament
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Big Reveal Control */}
                        <div className="glass-card" style={{ padding: '32px', background: 'linear-gradient(135deg, var(--brand-teal-glow), rgba(19, 32, 41, 0.4))' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <Trophy size={20} style={{ color: 'var(--brand-teal)' }} />
                                <h3 style={{ fontSize: '22px' }}>The Big Reveal</h3>
                            </div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>
                                Control what players see. Blackout scores during the final rounds to build suspense.
                            </p>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {activeTournament?.status === 'blackout' ? (
                                    <button
                                        onClick={() => handleToggleBlackout(false)}
                                        className="btn-primary"
                                        style={{ flex: 1, fontSize: '14px', background: 'var(--bg)', border: '1px solid var(--brand-teal)' }}
                                    >
                                        <Unlock size={14} style={{ marginRight: '6px' }} /> Reveal Results
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleToggleBlackout(true)}
                                        className="btn-primary"
                                        style={{ flex: 1, fontSize: '14px' }}
                                    >
                                        <Lock size={14} style={{ marginRight: '6px' }} /> Blackout Mode
                                    </button>
                                )}
                            </div>

                            {/* Launch Big Reveal Button */}
                            <button
                                onClick={() => navigate('/admin/reveal')}
                                disabled={!allGamesComplete}
                                className="btn-primary"
                                style={{
                                    width: '100%',
                                    marginTop: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    background: allGamesComplete ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'rgba(255,255,255,0.05)',
                                    border: allGamesComplete ? 'none' : '1px solid var(--border)',
                                    color: allGamesComplete ? '#1f2937' : 'var(--text-muted)',
                                    fontWeight: '800',
                                    cursor: allGamesComplete ? 'pointer' : 'not-allowed',
                                    opacity: allGamesComplete ? 1 : 0.5
                                }}
                            >
                                <Star size={18} />
                                {allGamesComplete ? 'Launch Big Reveal 🏆' : 'Complete all games first...'}
                            </button>
                        </div>

                        {/* Proxy Registration Inline */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <AdminProxyRegister />
                        </div>
                    </div>
                )}

                {activeTab === 'overview' && (
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <TournamentStandings />
                    </div>
                )}
                {activeTab === 'roster' && <AdminUserManagement />}
                {activeTab === 'games' && <AdminGameManagement />}
            </div>
        </div>
    );
};

export default AdminDashboard;
