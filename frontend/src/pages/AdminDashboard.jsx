import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Users, Sliders, Plus, LayoutList, Activity, Calendar, Check, X, ChevronLeft, ChevronRight, LogOut, LayoutDashboard, Star, FileText, Download, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminProxyRegister from '../components/AdminProxyRegister';
import AdminUserManagement from '../components/AdminUserManagement';
import AdminGameManagement from '../components/AdminGameManagement';
import TournamentStandings from '../components/TournamentStandings';
import RoundManager from '../components/RoundManager';
import ThemeToggle from '../components/ThemeToggle';
import API_URL from '../config';
import { useToast } from '../context/ToastContext';


const AdminDashboard = () => {
    const { showToast, confirm } = useToast();
    const [activeTab, setActiveTab] = useState('controls');
    const [activeTournament, setActiveTournament] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [tournamentName, setTournamentName] = useState('');
    const [roundsPerDay, setRoundsPerDay] = useState(2);
    const [selectedDates, setSelectedDates] = useState([]); // Array of YYYY-MM-DD
    const [viewDate, setViewDate] = useState(new Date()); // Controls which month we see
    const [selectedDayIndex, setSelectedDayIndex] = useState(null); // For day tabs navigation
    const [allGamesComplete, setAllGamesComplete] = useState(false);
    const navigate = useNavigate();
    const [backupData, setBackupData] = useState(null);
    const [backupDayIndex, setBackupDayIndex] = useState(0);

    // Sync backupDayIndex with tournament's current day upon load
    useEffect(() => {
        if (activeTournament) {
            setBackupDayIndex(activeTournament.current_day_index || 0);
        }
    }, [activeTournament]);


    const handleDownloadCSV = async (dayIndex) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/admin/tournament/daily-backup?day_index=${dayIndex}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data;
            
            // Build CSV rows
            const csvRows = [];
            // Header information
            csvRows.push(`"Bags & Brats Cornhole Tournament Day ${data.day_number} Record Backup"`);
            csvRows.push(`"Date: ${data.date}"`);
            csvRows.push(`"Exported: ${new Date().toLocaleString()}"`);
            csvRows.push(""); // Empty line
            
            // Table headers
            csvRows.push("Rank,Player Name,Round 1,Round 2,Day Wins,Day Points,Aggregate Wins,Aggregate Games Played,Aggregate Points");
            
            // Table rows
            data.players.forEach((p, idx) => {
                const r1 = p.daily_scores[0]?.score || "-";
                const r2 = p.daily_scores[1]?.score || "-";
                csvRows.push(`${idx + 1},"${p.name}",${r1},${r2},${p.daily_wins},${p.daily_points},${p.aggregate_wins},${p.aggregate_games_played},${p.aggregate_points}`);
            });
            
            // Trigger browser download via blob
            const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `bags_brats_day_${dayIndex + 1}_backup.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast("Daily backup CSV exported successfully!", "success");
        } catch (err) {
            console.error("Failed to download CSV", err);
            showToast("Failed to export daily record backup. Please check your connection.", "error");
        }
    };

    const handlePrintPDF = async (dayIndex) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/admin/tournament/daily-backup?day_index=${dayIndex}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBackupData(res.data);
            
            // Give DOM time to render the hidden printable component before triggering print
            setTimeout(() => {
                window.print();
            }, 300);
        } catch (err) {
            console.error("Failed to load print preview", err);
            showToast("Failed to load daily record print layout. Please try again.", "error");
        }
    };


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
                const res = await axios.get(`${API_URL}/admin/games`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const todayGames = res.data.filter(g => g.day_index === activeTournament.current_day_index);

                // Check that all rounds have games (not just existing games are finalized)
                const roundsPerDay = activeTournament.rounds_per_day || 2;
                const roundsWithGames = new Set(todayGames.map(g => g.round_number));
                const allRoundsHaveGames = roundsWithGames.size === roundsPerDay;

                // All rounds must have games AND all games must be finalized
                const allFinalized = todayGames.length > 0 &&
                    allRoundsHaveGames &&
                    todayGames.every(g => g.status === 'finalized');
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
            showToast("Please select at least one date.", "warning");
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
            setRoundsPerDay(2);
            setSelectedDates([]);
            fetchActiveTournament();
            showToast("Tournament created successfully! 🏆", "success");
        } catch (err) {
            showToast(err.response?.data?.error || "Failed to create tournament", "error");
        }
    };

    const handleGeneratePairings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/admin/generate-pairings`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast("Pairings generated and broadcasted! 🔄", "success");
        } catch (err) {
            showToast(err.response?.data?.error || "Failed to generate pairings", "error");
        }
    };

    const handleClearTournament = async () => {
        if (!(await confirm({
            title: 'Clear Tournament Data?',
            message: 'CRITICAL: This will permanently delete ALL tournaments and match logs from the database. This action is irreversible.',
            confirmText: 'Clear Everything',
            type: 'danger'
        }))) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/admin/tournaments/bulk-delete`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchActiveTournament();
            showToast("All tournaments and matches cleared successfully.", "success");
        } catch (err) {
            showToast("Failed to clear tournament", "error");
        }
    };

    const handleStartAllGames = async () => {
        if (!(await confirm({
            title: 'Activate Gameday Pulse?',
            message: 'This will start ALL upcoming games for the current round and begin the 20-minute countdown timer.',
            confirmText: 'Start Games',
            type: 'purple'
        }))) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/admin/tournament/start-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast("Gameday pulse activated! All games started. 🚀", "success");
        } catch (err) {
            showToast(err.response?.data?.error || "Failed to start all games", "error");
        }
    };

    const handleStopAllGames = async () => {
        if (!(await confirm({
            title: 'Finalize All Games?',
            message: 'This will instantly FINALIZE all active games with their current live scores. Proceed?',
            confirmText: 'Finalize Games',
            type: 'purple'
        }))) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/admin/tournament/stop-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast(res.data.msg || "All games finalized! 🏁", "success");
        } catch (err) {
            showToast(err.response?.data?.error || "Failed to stop games", "error");
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
                        <TabButton id="tournaments" icon={Calendar} label="Tournaments" />
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
                        {/* Admin Proxy Registration */}
                        <div>
                            <AdminProxyRegister />
                        </div>

                        {/* Tournament Data Backup */}
                        <div className="glass-card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <FileText size={20} style={{ color: 'var(--brand-teal)' }} />
                                <h3 style={{ fontSize: '22px' }}>Tournament Data Backup</h3>
                            </div>
                            
                            {!activeTournament ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                                    Active tournament required to download or save backups.
                                </p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
                                        Export player standings and round scores for manual/offline record keeping. Select a tournament day to export:
                                    </p>
                                    
                                    {/* Day Selection Row */}
                                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                                        {activeTournament.dates.map((date, idx) => {
                                            const isSelected = idx === backupDayIndex;
                                            const displayDate = new Date(date + 'T12:00:00');
                                            const dayName = displayDate.toLocaleDateString('en-US', { weekday: 'short' });
                                            const dayNum = displayDate.getDate();
                                            const isDisabled = idx > activeTournament.current_day_index;

                                            return (
                                                <button
                                                    key={date}
                                                    type="button"
                                                    onClick={() => setBackupDayIndex(idx)}
                                                    disabled={isDisabled}
                                                    style={{
                                                        padding: '10px 14px',
                                                        borderRadius: '8px',
                                                        background: isSelected ? 'var(--brand-teal)' : 'rgba(255,255,255,0.03)',
                                                        border: '1px solid transparent',
                                                        color: isDisabled ? 'rgba(255,255,255,0.15)' : (isSelected ? 'white' : 'var(--text-muted)'),
                                                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                        fontSize: '12px',
                                                        fontWeight: '700',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        minWidth: '55px',
                                                        transition: 'all 0.2s',
                                                        opacity: isDisabled ? 0.3 : 1
                                                    }}
                                                >
                                                    <span style={{ fontSize: '10px', textTransform: 'uppercase' }}>{dayName}</span>
                                                    <span style={{ fontSize: '16px', fontWeight: '800' }}>{dayNum}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                    <div className="glass-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                            <FileText size={16} style={{ color: 'var(--brand-teal)' }} />
                                            <span style={{ fontSize: '14px', fontWeight: '700' }}>Day {backupDayIndex + 1} Record Backup</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => handleDownloadCSV(backupDayIndex)}
                                                style={{
                                                    flex: 1,
                                                    background: 'rgba(255,255,255,0.03)',
                                                    color: 'var(--text)',
                                                    border: '1px solid var(--border)',
                                                    padding: '10px 14px',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <Download size={14} />
                                                Download CSV
                                            </button>
                                            <button
                                                onClick={() => handlePrintPDF(backupDayIndex)}
                                                style={{
                                                    flex: 1,
                                                    background: 'linear-gradient(135deg, var(--brand-teal), #48abb3)',
                                                    color: '#0a141a',
                                                    border: 'none',
                                                    padding: '10px 14px',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <Printer size={14} />
                                                Print / PDF
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'tournaments' && (
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

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border)', minHeight: '48px' }}>
                                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Rounds per day:</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => setRoundsPerDay(Math.max(1, roundsPerDay - 1))}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.05)',
                                                        border: '1px solid var(--border)',
                                                        color: 'white',
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '15px',
                                                        fontWeight: '700',
                                                        transition: 'all 0.2s ease',
                                                        userSelect: 'none'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                                                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                                                >
                                                    -
                                                </button>
                                                <span style={{
                                                    color: 'white',
                                                    width: '24px',
                                                    textAlign: 'center',
                                                    fontSize: '14px',
                                                    fontWeight: '700',
                                                    userSelect: 'none'
                                                }}>
                                                    {roundsPerDay}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setRoundsPerDay(Math.min(10, roundsPerDay + 1))}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.05)',
                                                        border: '1px solid var(--border)',
                                                        color: 'white',
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '15px',
                                                        fontWeight: '700',
                                                        transition: 'all 0.2s ease',
                                                        userSelect: 'none'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                                                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                                                >
                                                    +
                                                </button>
                                            </div>
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
                                                    <span style={{ fontSize: '13px', fontWeight: '700' }}>
                                                        {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
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
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'center' }}>
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
                                                        background: isSelected ? 'var(--brand-teal)' : 'rgba(255,255,255,0.03)',
                                                        border: '1px solid transparent',
                                                        color: isSelected ? 'white' : 'var(--text-muted)',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        fontWeight: '700',
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

                                    {/* Open Check-In Early Button */}
                                    <button
                                        onClick={async () => {
                                            try {
                                                const token = localStorage.getItem('token');
                                                const res = await axios.post(`${API_URL}/admin/tournament/toggle-checkin`,
                                                    { check_in_open: !activeTournament.check_in_open },
                                                    { headers: { Authorization: `Bearer ${token}` } }
                                                );
                                                showToast(res.data.msg, "success");
                                                fetchActiveTournament();
                                            } catch (err) {
                                                showToast(err.response?.data?.error || 'Failed to toggle check-in', 'error');
                                            }
                                        }}
                                        className="btn-primary"
                                        style={{
                                            width: '100%',
                                            marginTop: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            background: activeTournament.check_in_open ? 'rgba(16, 185, 129, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                                            border: activeTournament.check_in_open ? '1px solid #10b981' : '1px solid #fbbf24',
                                            color: activeTournament.check_in_open ? '#10b981' : '#fbbf24'
                                        }}
                                    >
                                        {activeTournament.check_in_open ? '🔓 Check-In Open (Close Early)' : '⏰ Open Check-In Early'}
                                    </button>

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
                                Once all rounds are complete, launch the dramatic podium reveal to announce the Golden Bag winner!
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {/* Launch Big Reveal Button */}
                                <button
                                    onClick={() => navigate('/admin/reveal')}
                                    disabled={!allGamesComplete}
                                    className="btn-primary"
                                    style={{
                                        width: '100%',
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
                                    {allGamesComplete ? 'Launch Daily Big Reveal 🏆' : 'Complete daily rounds first...'}
                                </button>

                                {/* Launch Grand Champion Reveal Button */}
                                <button
                                    onClick={() => navigate('/admin/grand-reveal')}
                                    disabled={!activeTournament}
                                    className="btn-primary"
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        background: activeTournament ? 'linear-gradient(135deg, var(--brand-teal), #48abb3)' : 'rgba(255,255,255,0.05)',
                                        border: activeTournament ? 'none' : '1px solid var(--border)',
                                        color: activeTournament ? '#0a141a' : 'var(--text-muted)',
                                        fontWeight: '800',
                                        cursor: activeTournament ? 'pointer' : 'not-allowed',
                                        opacity: activeTournament ? 1 : 0.5
                                    }}
                                >
                                    <Trophy size={18} />
                                    {activeTournament ? 'Launch Grand Champion Reveal 👑' : 'Create a tournament first...'}
                                </button>
                            </div>
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
            {backupData && (
                <div className="printable-backup-sheet" style={{ display: 'none' }}>
                    <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px' }}>
                        <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#000000' }}>
                            {backupData.tournament_name}
                        </h1>
                        <h2 style={{ fontSize: '16px', fontWeight: '700', margin: '5px 0 0 0', color: '#000000' }}>
                            Day {backupData.day_number} Backup & Standings Record
                        </h2>
                        <div style={{ fontSize: '11px', color: '#555555', marginTop: '5px' }}>
                            Date: {backupData.date} • Exported: {new Date().toLocaleString()}
                        </div>
                    </div>

                    <table className="backup-print-table">
                        <thead>
                            <tr>
                                <th style={{ width: '6%', textAlign: 'center' }}>Rank</th>
                                <th>Player Name</th>
                                <th className="text-center" style={{ width: '15%' }}>Round 1</th>
                                <th className="text-center" style={{ width: '15%' }}>Round 2</th>
                                <th className="text-center" style={{ width: '10%' }}>Day W</th>
                                <th className="text-center" style={{ width: '10%' }}>Day Pts</th>
                                <th className="text-center" style={{ width: '12%' }}>Agg W</th>
                                <th className="text-center" style={{ width: '12%' }}>Agg Games</th>
                                <th className="text-center" style={{ width: '10%' }}>Agg Pts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {backupData.players.map((p, idx) => (
                                <tr key={p.user_id}>
                                    <td className="text-center" style={{ fontWeight: 'bold' }}>{idx + 1}</td>
                                    <td style={{ fontWeight: '600' }}>{p.name}</td>
                                    <td className="text-center">{p.daily_scores[0]?.score || '-'}</td>
                                    <td className="text-center">{p.daily_scores[1]?.score || '-'}</td>
                                    <td className="text-center" style={{ fontWeight: 'bold' }}>{p.daily_wins}</td>
                                    <td className="text-center">{p.daily_points}</td>
                                    <td className="text-center" style={{ fontWeight: 'bold' }}>{p.aggregate_wins}</td>
                                    <td className="text-center">{p.aggregate_games_played}</td>
                                    <td className="text-center">{p.aggregate_points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    <div style={{ marginTop: '30px', fontSize: '10px', color: '#666666', fontStyle: 'italic', textAlign: 'center' }}>
                        * Keep this sheet secure. It contains accurate round standings to run remaining dates manually if needed.
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};


export default AdminDashboard;
