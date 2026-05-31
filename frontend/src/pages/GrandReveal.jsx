import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, Award, Star, Shield, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../config';

// Custom Gold Star Confetti Canvas Component
const GoldConfettiCanvas = ({ active }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!active) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Resize handler
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Particles definition
        const particles = [];
        const colors = ['#fbbf24', '#f59e0b', '#d97706', '#fef08a', '#ffffff'];

        for (let i = 0; i < 120; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * -canvas.height - 20,
                size: Math.random() * 8 + 4,
                speedY: Math.random() * 3 + 2,
                speedX: Math.random() * 2 - 1,
                rotation: Math.random() * 360,
                spinSpeed: Math.random() * 4 - 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: Math.random() * 0.5 + 0.5,
                shape: Math.random() > 0.4 ? 'star' : 'circle'
            });
        }

        // Draw a star
        const drawStar = (cx, cy, spikes, outerRadius, innerRadius, color, opacity) => {
            let rot = (Math.PI / 2) * 3;
            let x = cx;
            let y = cy;
            let step = Math.PI / spikes;

            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < spikes; i++) {
                x = cx + Math.cos(rot) * outerRadius;
                y = cy + Math.sin(rot) * outerRadius;
                ctx.lineTo(x, y);
                rot += step;

                x = cx + Math.cos(rot) * innerRadius;
                y = cy + Math.sin(rot) * innerRadius;
                ctx.lineTo(x, y);
                rot += step;
            }
            ctx.lineTo(cx, cy - outerRadius);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            ctx.restore();
        };

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p) => {
                p.y += p.speedY;
                p.x += p.speedX;
                p.rotation += p.spinSpeed;

                // Recycle particle if it goes off bottom
                if (p.y > canvas.height) {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                }

                if (p.shape === 'star') {
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate((p.rotation * Math.PI) / 180);
                    drawStar(0, 0, 5, p.size, p.size / 2, p.color, p.opacity);
                    ctx.restore();
                } else {
                    ctx.save();
                    ctx.globalAlpha = p.opacity;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
                    ctx.fillStyle = p.color;
                    ctx.fill();
                    ctx.restore();
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [active]);

    if (!active) return null;

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 99
            }}
        />
    );
};

const GrandReveal = () => {
    const navigate = useNavigate();
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [revealed, setRevealed] = useState({ third: false, second: false, first: false });
    const [confetti, setConfetti] = useState(false);

    useEffect(() => {
        fetchStandings();
    }, []);

    const fetchStandings = async () => {
        try {
            const res = await axios.get(`${API_URL}/tournaments/standings`);
            setStandings(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch overall standings:', err);
            setLoading(false);
        }
    };

    const handleReveal = (place) => {
        if (place === 'third') {
            setRevealed({ ...revealed, third: true });
        } else if (place === 'second' && revealed.third) {
            setRevealed({ ...revealed, second: true });
        } else if (place === 'first' && revealed.second) {
            setRevealed({ ...revealed, first: true });
            setConfetti(true);
        }
    };

    // Safely extract rank placements
    const getChampion = (rankIndex) => {
        if (standings.length > rankIndex) {
            return {
                name: standings[rankIndex].name,
                wins: standings[rankIndex].wins,
                games: standings[rankIndex].games_played,
                points: standings[rankIndex].total_points,
                rank: rankIndex + 1
            };
        }
        return null;
    };

    const firstPlace = getChampion(0);
    const secondPlace = getChampion(1);
    const thirdPlace = getChampion(2);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <div className="loading-spinner" />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', minHeight: '100vh', position: 'relative' }}>
            {/* Custom Gold Star Confetti Canvas */}
            <GoldConfettiCanvas active={confetti} />

            {/* Glowing Champion Aura Backplate */}
            <AnimatePresence>
                {confetti && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            pointerEvents: 'none',
                            background: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.08) 0%, transparent 60%)',
                            zIndex: 1
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Top Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', position: 'relative', zIndex: 10 }}>
                <button
                    onClick={() => navigate('/admin')}
                    className="btn-secondary"
                    style={{ padding: '8px 12px' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="vibrant-text" style={{ fontSize: '32px', margin: 0, fontWeight: '800' }}>2026 Bags & Brats Grand Champions</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '13px' }}>Click each pedestal to crown the overall tournament winners</p>
                </div>
            </div>

            {/* Symmetrical 3D Podium Grid */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                gap: '24px',
                marginTop: '80px',
                minHeight: '380px',
                position: 'relative',
                zIndex: 10
            }}>
                {/* 2ND PLACE (SILVER) */}
                <motion.div
                    initial={{ y: 120, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.15 }}
                    onClick={() => handleReveal('second')}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: revealed.third && !revealed.second ? 'pointer' : 'default',
                        opacity: revealed.third ? 1 : 0.3,
                        transition: 'opacity 0.3s ease'
                    }}
                >
                    <AnimatePresence>
                        {revealed.second && (
                            <motion.div
                                initial={{ scale: 0.4, y: 30, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                style={{ textAlign: 'center', marginBottom: '16px' }}
                            >
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>
                                    {secondPlace ? `${secondPlace.wins} Wins • ${secondPlace.points} Pts` : 'N/A'}
                                </div>
                                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text)' }}>
                                    {secondPlace ? secondPlace.name : 'No Competitor'}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Pedestal Block */}
                    <div style={{
                        width: '170px',
                        height: '140px',
                        background: revealed.second ? 'linear-gradient(135deg, #cbd5e1, #64748b)' : 'rgba(255,255,255,0.03)',
                        borderRadius: '16px 16px 0 0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid rgba(255,255,255,0.08)',
                        borderBottom: 'none',
                        boxShadow: revealed.second ? '0 10px 30px rgba(100, 116, 139, 0.15)' : 'none',
                        transition: 'all 0.3s ease'
                    }}>
                        <Shield size={34} style={{ color: revealed.second ? '#0f172a' : '#94a3b8' }} />
                        <span style={{ fontSize: '26px', fontWeight: '800', color: revealed.second ? '#0f172a' : '#94a3b8', marginTop: '4px' }}>2nd</span>
                    </div>
                </motion.div>

                {/* 1ST PLACE (GOLDEN CHAMPION) */}
                <motion.div
                    initial={{ y: 150, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 12, delay: 0.05 }}
                    onClick={() => handleReveal('first')}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: revealed.second && !revealed.first ? 'pointer' : 'default',
                        opacity: revealed.second ? 1 : 0.3,
                        transition: 'opacity 0.3s ease'
                    }}
                >
                    <AnimatePresence>
                        {revealed.first && (
                            <motion.div
                                initial={{ scale: 0.3, y: 50, opacity: 0 }}
                                animate={{ scale: 1.15, y: 0, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 180, damping: 10 }}
                                style={{ textAlign: 'center', marginBottom: '24px' }}
                            >
                                <motion.div
                                    animate={{ rotate: [0, -8, 8, -8, 8, 0], scale: [1, 1.1, 1] }}
                                    transition={{ duration: 0.6, repeat: 2 }}
                                    style={{ display: 'inline-block' }}
                                >
                                    <Star size={54} fill="#fbbf24" style={{ color: '#fbbf24', filter: 'drop-shadow(0 0 10px rgba(251,191,36,0.6))', marginBottom: '8px' }} />
                                </motion.div>
                                <div style={{ fontSize: '13px', color: '#fbbf24', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    🏆 {firstPlace ? `${firstPlace.wins} Wins • ${firstPlace.points} Pts` : 'N/A'}
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: '900', color: '#fbbf24', textShadow: '0 0 20px rgba(251,191,36,0.3)' }}>
                                    {firstPlace ? firstPlace.name : 'No Competitor'}
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    style={{
                                        marginTop: '10px',
                                        fontSize: '15px',
                                        fontWeight: '900',
                                        background: 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.15em'
                                    }}
                                >
                                    Grand Champion
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Pedestal Block */}
                    <div style={{
                        width: '190px',
                        height: '185px',
                        background: revealed.first ? 'linear-gradient(135deg, #fbbf24, #d97706)' : 'rgba(255,255,255,0.03)',
                        borderRadius: '16px 16px 0 0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid rgba(251, 191, 36, 0.4)',
                        borderBottom: 'none',
                        boxShadow: revealed.first ? '0 0 50px rgba(251, 191, 36, 0.25)' : 'none',
                        transition: 'all 0.3s ease'
                    }}>
                        <Trophy size={46} style={{ color: revealed.first ? '#0f172a' : '#fbbf24' }} />
                        <span style={{ fontSize: '32px', fontWeight: '900', color: revealed.first ? '#0f172a' : '#fbbf24', marginTop: '4px' }}>1st</span>
                    </div>
                </motion.div>

                {/* 3RD PLACE (BRONZE) */}
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 140, damping: 15, delay: 0.25 }}
                    onClick={() => handleReveal('third')}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: !revealed.third ? 'pointer' : 'default',
                        opacity: 1
                    }}
                >
                    <AnimatePresence>
                        {revealed.third && (
                            <motion.div
                                initial={{ scale: 0.4, y: 30, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                style={{ textAlign: 'center', marginBottom: '16px' }}
                            >
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>
                                    {thirdPlace ? `${thirdPlace.wins} Wins • ${thirdPlace.points} Pts` : 'N/A'}
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text)' }}>
                                    {thirdPlace ? thirdPlace.name : 'No Competitor'}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Pedestal Block */}
                    <div style={{
                        width: '150px',
                        height: '105px',
                        background: revealed.third ? 'linear-gradient(135deg, #b45309, #78350f)' : 'rgba(255,255,255,0.03)',
                        borderRadius: '16px 16px 0 0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid rgba(255,255,255,0.08)',
                        borderBottom: 'none',
                        boxShadow: revealed.third ? '0 10px 30px rgba(180, 83, 9, 0.15)' : 'none',
                        transition: 'all 0.3s ease'
                    }}>
                        <Award size={30} style={{ color: revealed.third ? '#ffffff' : '#cd7f32' }} />
                        <span style={{ fontSize: '22px', fontWeight: '800', color: revealed.third ? '#ffffff' : '#cd7f32', marginTop: '4px' }}>3rd</span>
                    </div>
                </motion.div>
            </div>

            {/* Instruction Guidance Prompt */}
            <div style={{ textAlign: 'center', marginTop: '50px', color: 'var(--text-muted)', fontSize: '14px', position: 'relative', zIndex: 10 }}>
                {!revealed.third && <p>🥉 Click **3rd place** to launch the reveal sequence...</p>}
                {revealed.third && !revealed.second && <p>🥈 Now reveal **2nd place**...</p>}
                {revealed.second && !revealed.first && <p style={{ color: '#fbbf24', fontWeight: '700' }}>👑 The moment of glory! Reveal the overall **Grand Champion**!</p>}
                {revealed.first && (
                    <motion.p
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ color: '#fbbf24', fontWeight: '900', fontSize: '16px' }}
                    >
                        🎉 Congratulations to our 2026 Bags & Brats Grand Champions! 🎉
                    </motion.p>
                )}
            </div>
        </div>
    );
};

export default GrandReveal;
