import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Target, Flame, TrendingUp, BookOpen, RefreshCw, Save, X, Pencil, Zap, Award, Globe, ExternalLink, CheckCircle2, Loader2 } from 'lucide-react';
import { getRatingBadgeClass, getRatingColor } from '../../utils/colors';

const TOPIC_COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b'];

// Contribution Heatmap Component
const Heatmap = ({ data }) => {
    const today = new Date();
    const weeks = 22; // ~5 months
    const days = weeks * 7;
    const cells = [];

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const count = data[key] || 0;
        cells.push({ date: key, count, day: d.getDay() });
    }

    // Arrange into columns (weeks)
    const columns = [];
    let col = [];
    // Pad first column so it starts on Sunday
    const firstDay = cells[0]?.day || 0;
    for (let pad = 0; pad < firstDay; pad++) col.push(null);
    cells.forEach(cell => {
        col.push(cell);
        if (col.length === 7) {
            columns.push(col);
            col = [];
        }
    });
    if (col.length > 0) columns.push(col);

    const getColor = (count) => {
        if (count === 0) return 'bg-slate-800';
        if (count === 1) return 'bg-emerald-900';
        if (count <= 3) return 'bg-emerald-700';
        if (count <= 5) return 'bg-emerald-500';
        return 'bg-emerald-400';
    };

    const monthLabels = [];
    let lastMonth = -1;
    columns.forEach((week, i) => {
        const validCell = week.find(c => c !== null);
        if (validCell) {
            const m = new Date(validCell.date).getMonth();
            if (m !== lastMonth) {
                monthLabels.push({ index: i, name: new Date(validCell.date).toLocaleString('en', { month: 'short' }) });
                lastMonth = m;
            }
        }
    });

    return (
        <div>
            <div className="flex gap-0.5 mb-1 ml-6">
                {monthLabels.map(m => (
                    <span key={m.index} className="text-[10px] text-slate-600" style={{ position: 'relative', left: `${m.index * 14}px` }}>
                        {m.name}
                    </span>
                ))}
            </div>
            <div className="flex gap-[3px] overflow-x-auto">
                <div className="flex flex-col gap-[3px] shrink-0 mr-1">
                    {['', 'M', '', 'W', '', 'F', ''].map((d, i) => (
                        <span key={i} className="text-[10px] text-slate-600 h-[12px] leading-[12px] w-4 text-right">{d}</span>
                    ))}
                </div>
                {columns.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-[3px]">
                        {week.map((cell, di) => (
                            cell === null
                                ? <div key={di} className="w-[12px] h-[12px]" />
                                : <div
                                    key={di}
                                    className={`w-[12px] h-[12px] rounded-sm ${getColor(cell.count)} transition-colors`}
                                    title={`${cell.date}: ${cell.count} problem${cell.count !== 1 ? 's' : ''}`}
                                />
                        ))}
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-1.5 mt-3 justify-end">
                <span className="text-[10px] text-slate-600">Less</span>
                {[0, 1, 2, 4, 6].map(n => (
                    <div key={n} className={`w-[10px] h-[10px] rounded-sm ${getColor(n)}`} />
                ))}
                <span className="text-[10px] text-slate-600">More</span>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [profile, setProfile] = useState(null);
    const [cfHandle, setCfHandle] = useState('');
    const [syncing, setSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState('');
    const [showTargetModal, setShowTargetModal] = useState(false);
    const [targetRating, setTargetRating] = useState('');
    const [dailyGoal, setDailyGoal] = useState('');

    // POTD state
    const [potd, setPotd] = useState(null);
    const [potdLoading, setPotdLoading] = useState(false);
    const [potdSolved, setPotdSolved] = useState(null);
    const [potdChecking, setPotdChecking] = useState(false);

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/users/profile');
            setAnalytics(res.data.analytics);
            setProfile(res.data.user);
            setCfHandle(res.data.user.codeforcesHandle || '');
            setTargetRating(res.data.user.targetRating || '');
            setDailyGoal(res.data.user.dailyGoal || 1);
        } catch (error) {
            console.error('Failed to fetch analytics', error);
        }
    };

    const fetchPotd = async () => {
        setPotdLoading(true);
        try {
            const res = await api.get('/users/potd');
            setPotd(res.data);
            setPotdSolved(null);
        } catch (error) {
            console.error('Failed to fetch POTD', error);
        } finally { setPotdLoading(false); }
    };

    const handleCheckPotd = async () => {
        if (!potd) return;
        setPotdChecking(true);
        try {
            const res = await api.post('/users/check-potd', {
                contestId: potd.problem.contestId,
                problemIndex: potd.problem.index
            });
            setPotdSolved(res.data.solved);
        } catch (error) {
            console.error('Failed to check POTD', error);
        } finally { setPotdChecking(false); }
    };

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchAnalytics();
    }, [user, navigate]);

    useEffect(() => {
        if (profile?.codeforcesHandle) fetchPotd();
    }, [profile?.codeforcesHandle]);

    const handleSaveHandle = async () => {
        try {
            await api.put('/users/handle', { codeforcesHandle: cfHandle });
            setSyncMessage('Handle saved');
            setTimeout(() => setSyncMessage(''), 3000);
        } catch (error) { setSyncMessage('Failed to save'); }
    };

    const handleSync = async () => {
        setSyncing(true);
        setSyncMessage('Fetching submissions...');
        try {
            const res = await api.post('/users/sync');
            setSyncMessage(res.data.message);
            fetchAnalytics();
        } catch (error) {
            setSyncMessage(error.response?.data?.message || 'Sync failed');
        } finally {
            setSyncing(false);
            setTimeout(() => setSyncMessage(''), 5000);
        }
    };

    const handleSaveTarget = async () => {
        try {
            await api.put('/users/goal', { targetRating: Number(targetRating), dailyGoal: Number(dailyGoal) });
            setShowTargetModal(false);
            fetchAnalytics();
        } catch (error) { alert('Failed to update goals'); }
    };

    if (!analytics) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const diffData = Object.keys(analytics.difficultyStats)
        .sort((a, b) => Number(a) - Number(b))
        .map(key => ({ name: key, count: analytics.difficultyStats[key] }));

    const topicData = analytics.topicStats
        ? Object.keys(analytics.topicStats).map(key => ({ name: key, value: analytics.topicStats[key] }))
        : [];

    const totalSolved = analytics.advancedStats?.totalSolved || 0;
    const avgDiff = analytics.advancedStats?.avgDifficulty || 0;
    const hardest = analytics.advancedStats?.hardestProblem;
    const topPlatform = analytics.advancedStats?.topPlatform || '—';

    // Progress towards target (using current CF rating)
    const cfRating = potd?.ratingInfo?.currentRating || profile?.currentRating || 0;
    const cfRank = potd?.ratingInfo?.rank || 'unrated';
    const cfMaxRating = potd?.ratingInfo?.maxRating || 0;
    const progressPct = profile?.targetRating > 0 && cfRating > 0
        ? Math.min(100, Math.round((cfRating / profile.targetRating) * 100))
        : 0;

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1">Your competitive programming overview</p>
            </div>

            {/* CF Sync */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex-1">
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Codeforces Handle</label>
                        <div className="flex gap-2">
                            <input type="text" value={cfHandle} onChange={e => setCfHandle(e.target.value)} placeholder="your_handle"
                                className="w-48 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-slate-600 transition-colors" />
                            <button onClick={handleSaveHandle} className="px-3 py-2 bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg hover:bg-slate-700 transition-colors">
                                <Save size={15} />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {syncMessage && <span className="text-xs text-emerald-400">{syncMessage}</span>}
                        <button onClick={handleSync} disabled={!cfHandle || syncing}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${!cfHandle || syncing ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                            {syncing ? 'Syncing...' : 'Sync'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Row 1 - Main Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center mb-3">
                        <Flame size={18} className="text-orange-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{analytics.streak}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Day Streak</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                        <BookOpen size={18} className="text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{totalSolved}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Total Solved</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-3">
                        <TrendingUp size={18} className="text-indigo-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{analytics.weeklySummary.totalSolved}</p>
                    <p className="text-xs text-slate-500 mt-0.5">This Week</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 cursor-pointer hover:border-slate-700 transition-colors group relative"
                    onClick={() => setShowTargetModal(true)}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Target size={18} className="text-emerald-400" />
                        </div>
                        <Pencil size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </div>
                    <p className="text-2xl font-bold text-white">{profile?.targetRating || '—'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Target Rating {profile?.dailyGoal > 0 ? `· ${profile.dailyGoal}/day` : ''}</p>
                </div>
            </div>

            {/* Stats Row 2 - Advanced Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                        <Zap size={18} className="text-purple-400" />
                    </div>
                    <p className={`text-2xl font-bold ${getRatingColor(avgDiff)}`}>{avgDiff || '—'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Avg Difficulty</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center mb-3">
                        <Award size={18} className="text-red-400" />
                    </div>
                    <p className={`text-lg font-bold truncate ${hardest ? getRatingColor(hardest.rating) : 'text-slate-500'}`}>
                        {hardest ? hardest.rating : '—'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate" title={hardest?.name}>
                        Hardest {hardest ? `· ${hardest.name.substring(0, 15)}` : ''}
                    </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-3">
                        <Globe size={18} className="text-cyan-400" />
                    </div>
                    <p className="text-lg font-bold text-white truncate">{topPlatform}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Top Platform</p>
                </div>
                {/* CF Rating Progress */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">CF Rating</p>
                    <p className={`text-2xl font-bold ${getRatingColor(cfRating)}`}>{cfRating || '—'}</p>
                    <p className="text-xs text-slate-500 mt-0.5 capitalize">{cfRank}{cfMaxRating > 0 ? ` · max ${cfMaxRating}` : ''}</p>
                    {profile?.targetRating > 0 && cfRating > 0 && (
                        <div className="mt-3">
                            <div className="w-full bg-slate-800 rounded-full h-1.5">
                                <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
                            </div>
                            <p className="text-[10px] text-slate-600 mt-1">{progressPct}% → {profile.targetRating}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Problem of the Day */}
            {profile?.codeforcesHandle && (
                <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30 border border-slate-800 rounded-xl p-6 mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">Problem of the Day</span>
                                {potdSolved === true && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle2 size={10} /> Solved</span>}
                                {potdSolved === false && <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Not Solved Yet</span>}
                            </div>
                            {potdLoading ? (
                                <div className="flex items-center gap-2 mt-3"><Loader2 size={16} className="animate-spin text-slate-500" /><span className="text-sm text-slate-500">Fetching today's challenge...</span></div>
                            ) : potd ? (
                                <div className="mt-2">
                                    <a href={potd.problem.url} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-white hover:text-blue-400 transition-colors flex items-center gap-2">
                                        {potd.problem.index} — {potd.problem.name}
                                        <ExternalLink size={14} className="text-slate-500" />
                                    </a>
                                    <div className="flex flex-wrap items-center gap-3 mt-2">
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${getRatingBadgeClass(potd.problem.rating)}`}>{potd.problem.rating}</span>
                                        <span className="text-[10px] text-slate-600">Range: {potd.ratingInfo.lowerBound}–{potd.ratingInfo.upperBound}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 mt-2">Set your Codeforces handle to get a daily challenge</p>
                            )}
                        </div>
                        {potd && (
                            <button onClick={handleCheckPotd} disabled={potdChecking}
                                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shrink-0 transition-all ${potdChecking ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : potdSolved ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                                {potdChecking ? <><Loader2 size={14} className="animate-spin" /> Checking...</> : potdSolved ? <><CheckCircle2 size={14} /> Completed!</> : <><RefreshCw size={14} /> Check Status</>}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Heatmap */}
            {analytics.heatmapData && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4">Activity</h3>
                    <Heatmap data={analytics.heatmapData} />
                </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-slate-300 mb-5">Difficulty Distribution</h3>
                    <div className="h-56">
                        {diffData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={diffData} barCategoryGap="20%">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 12 }} />
                                    <YAxis stroke="#475569" tick={{ fontSize: 12 }} allowDecimals={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: 13 }} />
                                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <div className="flex items-center justify-center h-full text-slate-600 text-sm">No data yet</div>}
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-slate-300 mb-5">Topic Breakdown</h3>
                    {topicData.length > 0 ? (
                        <div className="h-56 flex flex-col">
                            <div className="flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={topicData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                                            {topicData.map((_, idx) => <Cell key={idx} fill={TOPIC_COLORS[idx % TOPIC_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: 13 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                {topicData.slice(0, 6).map((t, i) => (
                                    <span key={t.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TOPIC_COLORS[i % TOPIC_COLORS.length] }}></span>
                                        {t.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : <div className="flex items-center justify-center h-56 text-slate-600 text-sm">No data yet</div>}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-300">Recent Activity</h3>
                    <span className="text-xs text-slate-600">Last 7 days</span>
                </div>
                {analytics.weeklySummary.problems.length > 0 ? (
                    <div className="divide-y divide-slate-800/50">
                        {analytics.weeklySummary.problems.slice(0, 8).map(p => (
                            <div key={p._id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-800/30 transition-colors">
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-medium text-slate-200 truncate">{p.problemName}</h4>
                                    <span className="text-xs text-slate-500">{p.platform} · {p.topic}</span>
                                </div>
                                <div className="flex items-center gap-4 shrink-0 ml-4">
                                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${getRatingBadgeClass(p.difficulty)}`}>
                                        {p.difficulty > 0 ? p.difficulty : '—'}
                                    </span>
                                    <span className="text-xs text-slate-600 w-20 text-right">
                                        {new Date(p.solvedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <div className="py-12 text-center text-slate-600 text-sm">No problems solved this week</div>}
            </div>

            {/* Target Modal */}
            {showTargetModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowTargetModal(false)}>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white">Set Your Goals</h3>
                            <button onClick={() => setShowTargetModal(false)} className="text-slate-500 hover:text-slate-300 transition-colors"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Target Rating</label>
                                <input type="number" value={targetRating} onChange={e => setTargetRating(e.target.value)} placeholder="e.g. 1600"
                                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-slate-600 transition-colors" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Daily Problem Goal</label>
                                <input type="number" value={dailyGoal} onChange={e => setDailyGoal(e.target.value)} placeholder="e.g. 3" min="1"
                                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-slate-600 transition-colors" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowTargetModal(false)} className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors">Cancel</button>
                            <button onClick={handleSaveTarget} className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">Save Goals</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
