import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import { BarChart3, Loader2, Trophy, TrendingDown, TrendingUp, Percent, ExternalLink, Plus } from 'lucide-react';
import { getRatingColor, getRatingBadgeClass } from '../../utils/colors';

const CFAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addingId, setAddingId] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/users/deep-analytics');
                setData(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load analytics');
            } finally { setLoading(false); }
        };
        fetch();
    }, []);

    const handleAddTodo = async (p) => {
        setAddingId(`${p.contestId}-${p.index}`);
        try {
            await api.post('/pending', {
                problemName: `${p.index} - ${p.name}`, url: p.url,
                difficulty: p.rating, topic: p.tags[0] || 'Unknown', platform: 'Codeforces'
            });
            setData(prev => ({
                ...prev,
                upsolveSuggestions: prev.upsolveSuggestions.map(pr =>
                    pr.contestId === p.contestId && pr.index === p.index ? { ...pr, _added: true } : pr
                )
            }));
        } catch (e) { alert('Failed to add'); }
        finally { setAddingId(null); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full py-20">
            <Loader2 size={24} className="animate-spin text-cyan-500" />
            <span className="ml-3 text-slate-400 text-sm">Fetching from Codeforces (may take a few seconds)...</span>
        </div>
    );

    if (error) return (
        <div className="p-10 max-w-3xl mx-auto">
            <div className="bg-slate-900 border border-red-900/50 rounded-xl p-8 text-center">
                <p className="text-red-400 font-medium">{error}</p>
                <p className="text-slate-500 text-sm mt-2">Make sure your Codeforces handle is set on the Dashboard.</p>
            </div>
        </div>
    );

    const { ratingHistory, contestStats, topicAnalysis, upsolveSuggestions } = data;

    const getBarColor = (rate) => {
        if (rate >= 80) return '#10b981';
        if (rate >= 60) return '#22d3ee';
        if (rate >= 40) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BarChart3 size={22} className="text-violet-500" />
                    CF Analytics
                </h1>
                <p className="text-slate-500 text-sm mt-1">Deep insights Codeforces doesn't show you</p>
            </div>

            {/* Contest Performance Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Contests</p>
                    <p className="text-2xl font-bold text-white">{contestStats.totalContests}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{contestStats.positiveContests} positive</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Percent size={12} className="text-slate-500" />
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Win Rate</p>
                    </div>
                    <p className={`text-2xl font-bold ${contestStats.winRate >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>{contestStats.winRate}%</p>
                    <p className="text-xs text-slate-500 mt-0.5">Avg {contestStats.avgChange >= 0 ? '+' : ''}{contestStats.avgChange}/contest</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <div className="flex items-center gap-1.5 mb-1">
                        <TrendingUp size={12} className="text-emerald-500" />
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Best</p>
                    </div>
                    {contestStats.bestContest ? (
                        <>
                            <p className="text-xl font-bold text-emerald-400">+{contestStats.bestContest.change}</p>
                            <p className="text-xs text-slate-500 mt-0.5 truncate" title={contestStats.bestContest.name}>Rank #{contestStats.bestContest.rank}</p>
                        </>
                    ) : <p className="text-slate-600">—</p>}
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <div className="flex items-center gap-1.5 mb-1">
                        <TrendingDown size={12} className="text-red-500" />
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Worst</p>
                    </div>
                    {contestStats.worstContest ? (
                        <>
                            <p className="text-xl font-bold text-red-400">{contestStats.worstContest.change}</p>
                            <p className="text-xs text-slate-500 mt-0.5 truncate" title={contestStats.worstContest.name}>Rank #{contestStats.worstContest.rank}</p>
                        </>
                    ) : <p className="text-slate-600">—</p>}
                </div>
            </div>

            {/* Rating History Chart */}
            {ratingHistory.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
                    <h3 className="text-sm font-semibold text-slate-300 mb-5">Rating History</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={ratingHistory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 10 }} interval={Math.max(0, Math.floor(ratingHistory.length / 10))} />
                                <YAxis stroke="#475569" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: 12 }}
                                    formatter={(value, name) => [value, name === 'rating' ? 'Rating' : name]}
                                    labelFormatter={(label) => {
                                        const entry = ratingHistory.find(r => r.date === label);
                                        return entry ? `${entry.contestName} (${label})` : label;
                                    }}
                                />
                                <Line type="monotone" dataKey="rating" stroke="#6366f1" strokeWidth={2} dot={{ r: 2, fill: '#6366f1' }} activeDot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Weak Topics Analysis */}
            {topicAnalysis.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
                    <h3 className="text-sm font-semibold text-slate-300 mb-1">Topic Strengths & Weaknesses</h3>
                    <p className="text-xs text-slate-600 mb-5">Sorted by success rate — weakest topics first</p>
                    <div className="space-y-3">
                        {topicAnalysis.slice(0, 15).map(t => (
                            <div key={t.topic} className="flex items-center gap-4">
                                <span className="text-xs text-slate-400 w-32 truncate shrink-0" title={t.topic}>{t.topic}</span>
                                <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${t.successRate}%`, backgroundColor: getBarColor(t.successRate) }}></div>
                                </div>
                                <span className="text-xs font-mono w-10 text-right shrink-0" style={{ color: getBarColor(t.successRate) }}>{t.successRate}%</span>
                                <span className="text-[10px] text-slate-600 w-20 shrink-0">{t.solved}/{t.attempted}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upsolving Suggestions */}
            {upsolveSuggestions.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-800">
                        <h3 className="text-sm font-semibold text-slate-300">Upsolving Suggestions</h3>
                        <p className="text-xs text-slate-600 mt-0.5">Problems from your past contests you haven't solved yet</p>
                    </div>
                    <div className="divide-y divide-slate-800/50">
                        {upsolveSuggestions.map(p => {
                            const key = `${p.contestId}-${p.index}`;
                            return (
                                <div key={key} className="flex items-center justify-between px-6 py-3 hover:bg-slate-800/30 transition-colors">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <span className={`text-sm font-bold shrink-0 ${getRatingColor(p.rating)}`}>{p.rating}</span>
                                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-200 hover:text-blue-400 transition-colors truncate flex items-center gap-1.5">
                                            {p.index} — {p.name}
                                            <ExternalLink size={11} className="text-slate-600 shrink-0" />
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 ml-4">
                                        <div className="flex gap-1">
                                            {p.tags.slice(0, 2).map(tag => (
                                                <span key={tag} className="text-[10px] text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded">{tag}</span>
                                            ))}
                                        </div>
                                        {p._added ? (
                                            <span className="text-[10px] text-blue-400 w-14 text-right">Added ✓</span>
                                        ) : (
                                            <button onClick={() => handleAddTodo(p)} disabled={addingId === key}
                                                className="text-xs text-slate-500 hover:text-blue-400 flex items-center gap-1 w-14 justify-end transition-colors">
                                                {addingId === key ? <Loader2 size={12} className="animate-spin" /> : <><Plus size={12} /> To-Do</>}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CFAnalytics;
