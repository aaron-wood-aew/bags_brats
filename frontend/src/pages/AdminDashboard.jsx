import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Trophy, Users, Sliders, Plus, LayoutList, Activity, Calendar, Check, X, ChevronLeft, ChevronRight, LogOut, LayoutDashboard, Star, FileText, Download, Printer, Database, Upload, XCircle, CalendarPlus } from 'lucide-react';
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
    const [allTournamentGamesComplete, setAllTournamentGamesComplete] = useState(false);
    const navigate = useNavigate();
    const [backupData, setBackupData] = useState(null);
    const [backupDayIndex, setBackupDayIndex] = useState(0);
    const [dbRestoreLoading, setDbRestoreLoading] = useState(false);
    const restoreFileRef = useRef(null);
    const [addDayDate, setAddDayDate] = useState('');
    const [tieForFirst, setTieForFirst] = useState(false);
    const [suddenDeathGame, setSuddenDeathGame] = useState(null);

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

    const handleFullDbBackup = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/admin/db/backup`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const blob = new Blob([res.data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const disposition = res.headers['content-disposition'];
            const filename = disposition
                ? disposition.split('filename=')[1]?.replace(/"/g, '')
                : `bags_brats_full_backup_${new Date().toISOString().slice(0,10)}.json`;
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showToast('Full database backup downloaded successfully!', 'success');
        } catch (err) {
            console.error('DB backup failed', err);
            showToast('Failed to download database backup.', 'error');
        }
    };

    const handleDbRestore = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Reset so the same file can be re-selected
        e.target.value = '';

        if (!file.name.endsWith('.json')) {
            showToast('Please select a .json backup file.', 'error');
            return;
        }

        const proceed = await confirm({
            title: 'Restore Database from Backup?',
            message: `CRITICAL: This will REPLACE all current data (users, tournaments, games, teams) with the contents of "${file.name}". Your admin account will be preserved. This cannot be undone.`,
            confirmText: 'Restore Database',
            type: 'danger'
        });
        if (!proceed) return;

        setDbRestoreLoading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', file);
            const res = await axios.post(`${API_URL}/admin/db/restore`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            const stats = res.data.stats || {};
            showToast(
                `Database restored! Users: ${stats.users || 0}, Tournaments: ${stats.tournaments || 0}, Games: ${stats.games || 0}, Teams: ${stats.teams || 0}`,
                'success'
            );
            fetchActiveTournament();
        } catch (err) {
            console.error('DB restore failed', err);
            showToast(err.response?.data?.error || 'Failed to restore database.', 'error');
        } finally {
            setDbRestoreLoading(false);
        }
    };

    const handleCancelDay = async (dayIndex) => {
        const dateStr = activeTournament.dates[dayIndex];
        const displayDate = new Date(dateStr + 'T12:00:00');
        const formatted = `${displayDate.getMonth() + 1}/${displayDate.getDate()}`;
        const proceed = await confirm({
            title: `Cancel Day ${dayIndex + 1} (${formatted})?`,
            message: `This will cancel this tournament day. Any generated teams or games for this day will be deleted. Players will no longer see this day. This cannot be undone.`,
            confirmText: 'Yes — Cancel the Tournament Day',
            cancelText: 'No',
            type: 'danger'
        });
        if (!proceed) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/admin/tournament/schedule`, { cancel_day_index: dayIndex }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast(`Day ${dayIndex + 1} (${formatted}) has been cancelled`, 'success');
            fetchActiveTournament();
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to cancel day', 'error');
        }
    };

    const handleAddDay = async () => {
        if (!addDayDate) {
            showToast('Please select a date', 'error');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/admin/tournament/schedule`, { add_date: addDayDate }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast(`New tournament day added: ${addDayDate}`, 'success');
            setAddDayDate('');
            fetchActiveTournament();
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to add day', 'error');
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
        
        const handleAfterPrint = () => {
            setBackupData(null);
        };
        window.addEventListener('afterprint', handleAfterPrint);
        return () => window.removeEventListener('afterprint', handleAfterPrint);
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

                // Daily reveal: only on tournament days AND all games finalized
                const allFinalized = activeTournament.is_tournament_day &&
                    todayGames.length > 0 &&
                    allRoundsHaveGames &&
                    todayGames.every(g => g.status === 'finalized');
                setAllGamesComplete(allFinalized);

                // Fetch standings and check for 1st-place tie on the final day
                const standingsRes = await axios.get(`${API_URL}/tournaments/standings`);
                const standings = standingsRes.data;
                const totalDays = activeTournament.dates?.length || 1;
                const isLastDay = activeTournament.current_day_index === totalDays - 1;

                const hasTie = standings.length >= 2 &&
                    standings[0].wins === standings[1].wins &&
                    standings[0].total_points === standings[1].total_points;
                
                setTieForFirst(isLastDay && hasTie);

                const sdGame = todayGames.find(g => g.is_sudden_death === true) || null;
                setSuddenDeathGame(sdGame);

                // Check if ALL tournament days have complete games (for Grand Champion Reveal)
                const cancelledDays = activeTournament.cancelled_dates || [];
                let allDaysComplete = totalDays > 0;
                for (let dayIdx = 0; dayIdx < totalDays; dayIdx++) {
                    // Skip cancelled days
                    if (cancelledDays.includes(dayIdx)) continue;
                    const dayGames = res.data.filter(g => g.day_index === dayIdx);
                    const dayRoundsWithGames = new Set(dayGames.map(g => g.round_number));
                    const dayAllRoundsPlayed = dayRoundsWithGames.size >= roundsPerDay;
                    const dayAllFinalized = dayGames.length > 0 &&
                        dayAllRoundsPlayed &&
                        dayGames.every(g => g.status === 'finalized');
                    if (!dayAllFinalized) {
                        allDaysComplete = false;
                        break;
                    }
                }
                setAllTournamentGamesComplete(allDaysComplete);
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
            console.error("Clear tournament error:", err.response?.data || err.message || err);
            showToast(err.response?.data?.error || err.message || "Failed to clear tournament", "error");
        }
    };

    const handleGenerateSuddenDeath = async () => {
        if (!(await confirm({
            title: 'Generate Sudden Death Match? ⚔️',
            message: 'All daily rounds are complete and there is a tie for 1st place. This will generate a 1v1 Sudden Death Championship Match between the top two players to break the tie.',
            confirmText: 'Generate Match',
            type: 'purple'
        }))) return;

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/admin/generate-sudden-death`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast(res.data.msg || "Sudden Death Championship Match generated successfully! ⚔️", "success");
            fetchActiveTournament();
        } catch (err) {
            console.error("Failed to generate Sudden Death match", err);
            showToast(err.response?.data?.error || "Failed to generate Sudden Death match", "error");
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
                                            const isCancelled = (activeTournament.cancelled_dates || []).includes(idx);
                                            if (isCancelled) return null;
                                            const isSelected = idx === backupDayIndex;
                                            const displayDate = new Date(date + 'T12:00:00');
                                            const monthDay = `${displayDate.getMonth() + 1}/${displayDate.getDate()}`;
                                            const dayName = displayDate.toLocaleDateString('en-US', { weekday: 'short' });
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
                                                    <span style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.7 }}>{dayName}</span>
                                                    <span style={{ fontSize: '12px', fontWeight: '800' }}>{monthDay}</span>
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

                        {/* Full Database Backup & Restore */}
                        <div className="glass-card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <Database size={20} style={{ color: '#f59e0b' }} />
                                <h3 style={{ fontSize: '22px' }}>Database Backup & Restore</h3>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5', marginBottom: '20px' }}>
                                Full snapshot of all data — users, tournaments, games, and teams. Use this before the tournament as a safety net.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button
                                    onClick={handleFullDbBackup}
                                    style={{
                                        width: '100%',
                                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        color: '#0a141a',
                                        border: 'none',
                                        padding: '14px 18px',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Download size={16} />
                                    Download Full DB Backup
                                </button>

                                <input
                                    type="file"
                                    accept=".json"
                                    ref={restoreFileRef}
                                    onChange={handleDbRestore}
                                    style={{ display: 'none' }}
                                />
                                <button
                                    onClick={() => restoreFileRef.current?.click()}
                                    disabled={dbRestoreLoading}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(255,255,255,0.03)',
                                        color: dbRestoreLoading ? 'var(--text-muted)' : 'var(--text)',
                                        border: '1px solid var(--border)',
                                        padding: '14px 18px',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        cursor: dbRestoreLoading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s',
                                        opacity: dbRestoreLoading ? 0.5 : 1
                                    }}
                                >
                                    <Upload size={16} />
                                    {dbRestoreLoading ? 'Restoring...' : 'Restore from Backup'}
                                </button>
                            </div>

                            <div style={{
                                marginTop: '16px',
                                padding: '12px',
                                background: 'rgba(245, 158, 11, 0.06)',
                                borderRadius: '8px',
                                border: '1px solid rgba(245, 158, 11, 0.15)',
                                fontSize: '12px',
                                color: 'var(--text-muted)',
                                lineHeight: '1.5'
                            }}>
                                💡 <strong style={{ color: '#f59e0b' }}>Tip:</strong> Take a backup before each tournament day. If anything goes wrong, restore to the last good state instantly.
                            </div>
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
                                            const isCancelled = (activeTournament.cancelled_dates || []).includes(idx);
                                            const serverToday = activeTournament.today || new Date().toISOString().split('T')[0];
                                            const isToday = date === serverToday;
                                            const isPast = date < serverToday && !isToday;
                                            const isFuture = date > serverToday && !isCancelled;

                                            const displayDate = new Date(date + 'T12:00:00');
                                            const monthDay = `${displayDate.getMonth() + 1}/${displayDate.getDate()}`;
                                            const dayName = displayDate.toLocaleDateString('en-US', { weekday: 'short' });

                                            return (
                                                <div key={date} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <button
                                                        onClick={() => !isCancelled && setSelectedDayIndex(idx)}
                                                        style={{
                                                            padding: '10px 16px',
                                                            borderRadius: '8px',
                                                            background: isCancelled ? 'rgba(239, 68, 68, 0.05)' :
                                                                (isSelected && isToday) ? 'var(--brand-teal)' :
                                                                (isSelected && isPast) ? 'rgba(107, 114, 128, 0.3)' :
                                                                isSelected ? 'var(--brand-teal)' :
                                                                'rgba(255,255,255,0.03)',
                                                            border: isCancelled ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid transparent',
                                                            color: isCancelled ? 'rgba(239, 68, 68, 0.4)' : (isSelected ? 'white' : 'var(--text-muted)'),
                                                            cursor: isCancelled ? 'default' : 'pointer',
                                                            fontSize: '13px',
                                                            fontWeight: '700',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            minWidth: '60px',
                                                            opacity: isCancelled ? 0.5 : (isPast && !isSelected ? 0.6 : 1),
                                                            position: 'relative',
                                                            textDecoration: isCancelled ? 'line-through' : 'none'
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', opacity: 0.7 }}>{dayName}</span>
                                                        <span style={{ fontSize: '14px', fontWeight: '800' }}>{monthDay}</span>
                                                        {isToday && (
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
                                                        {isPast && !isCancelled && (
                                                            <Check size={12} style={{ color: '#6b7280', marginTop: '2px' }} />
                                                        )}
                                                        {isCancelled && (
                                                            <X size={12} style={{ color: '#ef4444', marginTop: '2px' }} />
                                                        )}
                                                    </button>
                                                    {isFuture && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleCancelDay(idx); }}
                                                            title="Cancel this day"
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: 'var(--text-muted)',
                                                                cursor: 'pointer',
                                                                padding: '2px',
                                                                marginTop: '4px',
                                                                opacity: 0.4,
                                                                transition: 'opacity 0.2s'
                                                            }}
                                                            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                                            onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
                                                        >
                                                            <XCircle size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            );

                                        })}

                                        {/* Add Day Button */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                            <button
                                                onClick={() => {
                                                    const input = document.getElementById('add-day-input');
                                                    if (input) input.showPicker();
                                                }}
                                                title="Add tournament day"
                                                style={{
                                                    padding: '10px 12px',
                                                    borderRadius: '8px',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px dashed var(--border)',
                                                    color: 'var(--text-muted)',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    minWidth: '48px',
                                                    minHeight: '42px',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <Plus size={18} />
                                            </button>
                                            <input
                                                id="add-day-input"
                                                type="date"
                                                value={addDayDate}
                                                onChange={(e) => {
                                                    setAddDayDate(e.target.value);
                                                    if (e.target.value) {
                                                        // Auto-submit on date selection
                                                        const token = localStorage.getItem('token');
                                                        axios.put(`${API_URL}/admin/tournament/schedule`, { add_date: e.target.value }, {
                                                            headers: { Authorization: `Bearer ${token}` }
                                                        }).then(res => {
                                                            showToast(res.data.msg, 'success');
                                                            setAddDayDate('');
                                                            fetchActiveTournament();
                                                        }).catch(err => {
                                                            showToast(err.response?.data?.error || 'Failed to add day', 'error');
                                                            setAddDayDate('');
                                                        });
                                                    }
                                                }}
                                                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Round Manager - date-aware display */}
                                    {(() => {
                                        const viewIdx = selectedDayIndex ?? activeTournament.current_day_index;
                                        const viewDate = activeTournament.dates?.[viewIdx];
                                        const serverToday = activeTournament.today || new Date().toISOString().split('T')[0];
                                        const isCancelledDay = (activeTournament.cancelled_dates || []).includes(viewIdx);
                                        const isViewingToday = viewDate === serverToday;
                                        const isViewingPast = viewDate < serverToday;
                                        
                                        if (isCancelledDay) {
                                            return (
                                                <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                                                    <XCircle size={32} style={{ color: '#ef4444', marginBottom: '8px', opacity: 0.6 }} />
                                                    <div style={{ fontWeight: '700', marginBottom: '4px', color: '#ef4444' }}>Day Cancelled</div>
                                                    <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>This tournament day has been cancelled</div>
                                                </div>
                                            );
                                        }
                                        if (isViewingToday) {
                                            return <RoundManager tournament={activeTournament} onUpdate={fetchActiveTournament} />;
                                        }
                                        if (isViewingPast) {
                                            return (
                                                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', textAlign: 'center' }}>
                                                    <Check size={32} style={{ color: '#6b7280', marginBottom: '8px' }} />
                                                    <div style={{ fontWeight: '700', marginBottom: '4px' }}>Day Completed</div>
                                                    <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>View game results in the Games tab</div>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', textAlign: 'center' }}>
                                                <Calendar size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                                                <div style={{ fontWeight: '700', marginBottom: '4px' }}>Upcoming Day</div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Pairings will be generated when this day begins</div>
                                            </div>
                                        );
                                    })()}

                                    {/* Open Check-In Early Button */}
                                    {(() => {
                                        const isOpenBySchedule = activeTournament.check_in_currently_open && !activeTournament.check_in_open;
                                        const isOpenManually = activeTournament.check_in_currently_open && activeTournament.check_in_open;

                                        return (
                                            <button
                                                onClick={async () => {
                                                    if (isOpenBySchedule) return;
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
                                                disabled={isOpenBySchedule}
                                                className="btn-primary"
                                                style={{
                                                    width: '100%',
                                                    marginTop: '16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    background: isOpenManually ? 'rgba(16, 185, 129, 0.1)' : 
                                                                isOpenBySchedule ? 'rgba(16, 185, 129, 0.05)' : 
                                                                'rgba(251, 191, 36, 0.1)',
                                                    border: isOpenManually ? '1px solid #10b981' : 
                                                            isOpenBySchedule ? '1px solid rgba(16, 185, 129, 0.4)' : 
                                                            '1px solid #fbbf24',
                                                    color: isOpenManually ? '#10b981' : 
                                                           isOpenBySchedule ? 'rgba(16, 185, 129, 0.6)' : 
                                                           '#fbbf24',
                                                    cursor: isOpenBySchedule ? 'default' : 'pointer',
                                                    opacity: isOpenBySchedule ? 0.7 : 1
                                                }}
                                            >
                                                {isOpenManually ? '🔓 Check-In Open (Close Early)' :
                                                 isOpenBySchedule ? '🔓 Check-In Open (by schedule)' :
                                                 '⏰ Open Check-In Early'}
                                            </button>
                                        );
                                    })()}

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
                                {/* Sudden Death Match Generator */}
                                {allGamesComplete && tieForFirst && !suddenDeathGame && (
                                    <button
                                        onClick={handleGenerateSuddenDeath}
                                        className="btn-primary"
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                                            border: 'none',
                                            color: 'white',
                                            fontWeight: '800',
                                            cursor: 'pointer',
                                            boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
                                            padding: '14px'
                                        }}
                                    >
                                        <Activity size={18} />
                                        Generate Sudden Death Match ⚔️
                                    </button>
                                )}

                                {suddenDeathGame && (
                                    <div style={{
                                        padding: '12px',
                                        borderRadius: '8px',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        color: '#ef4444',
                                        fontSize: '13px',
                                        fontWeight: '700',
                                        textAlign: 'center',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px'
                                    }}>
                                        ⚔️ Sudden Death Match: {suddenDeathGame.status.toUpperCase()}
                                    </div>
                                )}

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
                                    {allGamesComplete ? 'Launch Daily Big Reveal 🏆' : 
                                        !activeTournament?.is_tournament_day ? 'No games today' : 
                                        'Complete daily rounds first...'}
                                </button>

                                {/* Launch Grand Champion Reveal Button */}
                                <button
                                    onClick={() => navigate('/admin/grand-reveal')}
                                    disabled={!allTournamentGamesComplete}
                                    className="btn-primary"
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        background: allTournamentGamesComplete ? 'linear-gradient(135deg, var(--brand-teal), #48abb3)' : 'rgba(255,255,255,0.05)',
                                        border: allTournamentGamesComplete ? 'none' : '1px solid var(--border)',
                                        color: allTournamentGamesComplete ? '#0a141a' : 'var(--text-muted)',
                                        fontWeight: '800',
                                        cursor: allTournamentGamesComplete ? 'pointer' : 'not-allowed',
                                        opacity: allTournamentGamesComplete ? 1 : 0.5
                                    }}
                                >
                                    <Trophy size={18} />
                                    {allTournamentGamesComplete ? 'Launch Grand Champion Reveal 👑' : 'Complete all tournament days first...'}  
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
