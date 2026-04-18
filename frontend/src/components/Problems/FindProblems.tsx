import React, { useState } from 'react';
import api from '../../api/axios';
import { Search, ExternalLink, CheckCircle2, Loader2, Filter, Users, Plus } from 'lucide-react';
import { getRatingColor, getRatingBadgeClass } from '../../utils/colors';

const CF_TAGS = [
    'implementation', 'math', 'greedy', 'dp', 'data structures', 'brute force',
    'constructive algorithms', 'graphs', 'sortings', 'binary search', 'dfs and similar',
    'trees', 'strings', 'number theory', 'geometry', 'combinatorics', 'two pointers',
    'dsu', 'bitmasks', 'probabilities', 'shortest paths', 'hashing', 'divide and conquer',
    'games', 'flows', 'interactive', 'matrices', 'string suffix structures', 'fft'
];

const FindProblems = () => {
    const [minRating, setMinRating] = useState('800');
    const [maxRating, setMaxRating] = useState('1400');
    const [selectedTag, setSelectedTag] = useState('');
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [addingId, setAddingId] = useState(null);

    const handleSearch = async () => {
        setLoading(true);
        setSearched(true);
        try {
            const params = new URLSearchParams();
            if (minRating) params.append('minRating', minRating);
            if (maxRating) params.append('maxRating', maxRating);
            if (selectedTag) params.append('tag', selectedTag);
            const res = await api.get(`/users/find-problems?${params.toString()}`);
            setProblems(res.data.problems);
        } catch (error) {
            console.error('Search failed', error);
        } finally { setLoading(false); }
    };

    const handleAddTodo = async (p) => {
        setAddingId(`${p.contestId}-${p.index}`);
        try {
            await api.post('/pending', {
                problemName: `${p.index} - ${p.name}`,
                url: p.url,
                difficulty: p.rating,
                topic: p.tags[0] || 'Unknown',
                platform: 'Codeforces'
            });
            // Mark as added in UI
            setProblems(prev => prev.map(pr =>
                pr.contestId === p.contestId && pr.index === p.index
                    ? { ...pr, _added: true }
                    : pr
            ));
        } catch (error) {
            alert('Failed to add');
        } finally { setAddingId(null); }
    };

    const solvedCount = problems.filter(p => p.userSolved).length;
    const unsolvedCount = problems.filter(p => !p.userSolved).length;

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Search size={22} className="text-cyan-500" />
                    Find Problems
                </h1>
                <p className="text-slate-500 text-sm mt-1">Browse Codeforces problems by rating and topic</p>
            </div>

            {/* Filters */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Filter size={16} className="text-slate-500" />
                    <span className="text-sm font-semibold text-slate-300">Filters</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Min Rating</label>
                        <input type="number" value={minRating} onChange={e => setMinRating(e.target.value)} placeholder="800"
                            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-slate-600 transition-colors" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Max Rating</label>
                        <input type="number" value={maxRating} onChange={e => setMaxRating(e.target.value)} placeholder="1400"
                            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-slate-600 transition-colors" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Topic</label>
                        <select value={selectedTag} onChange={e => setSelectedTag(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-slate-600 transition-colors">
                            <option value="">All Topics</option>
                            {CF_TAGS.map(tag => (
                                <option key={tag} value={tag}>{tag}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button onClick={handleSearch} disabled={loading}
                            className="w-full px-4 py-2.5 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                            {loading ? <><Loader2 size={14} className="animate-spin" /> Searching...</> : <><Search size={14} /> Search</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Results */}
            {searched && !loading && (
                <div className="flex items-center gap-4 mb-4 text-xs">
                    <span className="text-slate-400">{problems.length} problems found</span>
                    {solvedCount > 0 && <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 size={12} /> {solvedCount} solved</span>}
                    {unsolvedCount > 0 && <span className="text-slate-500">{unsolvedCount} unsolved</span>}
                </div>
            )}

            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={24} className="animate-spin text-cyan-500" />
                    <span className="ml-3 text-slate-400 text-sm">Fetching from Codeforces...</span>
                </div>
            )}

            {searched && !loading && problems.length === 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl py-16 text-center">
                    <p className="text-slate-400">No problems found for these filters.</p>
                    <p className="text-slate-600 text-sm mt-1">Try adjusting the rating range or topic.</p>
                </div>
            )}

            {!loading && problems.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Problem</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rating</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tags</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <span className="flex items-center gap-1"><Users size={12} /> Solved By</span>
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {problems.map(p => {
                                    const key = `${p.contestId}-${p.index}`;
                                    return (
                                        <tr key={key} className={`transition-colors ${p.userSolved ? 'bg-emerald-500/5' : 'hover:bg-slate-800/30'}`}>
                                            <td className="px-5 py-3">
                                                <a href={p.url} target="_blank" rel="noopener noreferrer"
                                                    className="text-sm font-medium text-slate-200 hover:text-blue-400 transition-colors flex items-center gap-1.5">
                                                    <span className="text-slate-500 text-xs w-8">{p.index}</span>
                                                    <span className="truncate max-w-[220px]">{p.name}</span>
                                                    <ExternalLink size={11} className="text-slate-600 shrink-0" />
                                                </a>
                                            </td>
                                            <td className={`px-5 py-3 text-sm font-bold ${getRatingColor(p.rating)}`}>{p.rating}</td>
                                            <td className="px-5 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {p.tags.slice(0, 2).map(tag => (
                                                        <span key={tag} className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{tag}</span>
                                                    ))}
                                                    {p.tags.length > 2 && <span className="text-[10px] text-slate-600">+{p.tags.length - 2}</span>}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-xs text-slate-500">{p.solvedCount.toLocaleString()}</td>
                                            <td className="px-5 py-3">
                                                {p.userSolved ? (
                                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                                                        <CheckCircle2 size={10} /> Solved
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-600">Unsolved</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                {!p.userSolved && !p._added && (
                                                    <button onClick={() => handleAddTodo(p)} disabled={addingId === key}
                                                        className="text-xs text-slate-400 hover:text-blue-400 flex items-center gap-1 ml-auto transition-colors">
                                                        {addingId === key ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                                                        To-Do
                                                    </button>
                                                )}
                                                {p._added && <span className="text-[10px] text-blue-400">Added ✓</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FindProblems;
