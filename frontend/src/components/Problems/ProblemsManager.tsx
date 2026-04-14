import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, CheckSquare, Search, ChevronDown, ChevronUp, Save, StickyNote, ExternalLink } from 'lucide-react';
import { getRatingColor, getRatingBadgeClass } from '../../utils/colors';

const ProblemsManager = () => {
    const [problems, setProblems] = useState([]);
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [editingNotes, setEditingNotes] = useState({});
    const [formData, setFormData] = useState({
        problemName: '', difficulty: '', topic: '', platform: '', url: '', notes: ''
    });
    const [showForm, setShowForm] = useState(false);

    const fetchProblems = async () => {
        try {
            const res = await api.get('/problems');
            setProblems(res.data);
        } catch (error) {
            console.error('Failed to fetch problems', error);
        }
    };

    useEffect(() => { fetchProblems(); }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/problems', {
                ...formData,
                difficulty: Number(formData.difficulty)
            });
            setFormData({ problemName: '', difficulty: '', topic: '', platform: '', url: '', notes: '' });
            setShowForm(false);
            fetchProblems();
        } catch (error) { alert('Failed to log problem'); }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/problems/${id}`);
            if (expandedId === id) setExpandedId(null);
            fetchProblems();
        } catch (error) { console.error('Failed to delete', error); }
    };

    const handleSaveNotes = async (id) => {
        try {
            await api.put(`/problems/${id}`, { notes: editingNotes[id] ?? '' });
            fetchProblems();
        } catch (error) { alert('Failed to save notes'); }
    };

    const toggleExpand = (id) => {
        if (expandedId === id) {
            setExpandedId(null);
        } else {
            setExpandedId(id);
            const problem = problems.find(p => p._id === id);
            setEditingNotes({ ...editingNotes, [id]: problem?.notes || '' });
        }
    };

    const filtered = problems.filter(p =>
        p.problemName.toLowerCase().includes(search.toLowerCase()) ||
        p.topic.toLowerCase().includes(search.toLowerCase()) ||
        p.platform.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <CheckSquare size={22} className="text-blue-500" />
                        Solved Problems
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">{problems.length} problems logged</p>
                </div>
                <button onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 self-start">
                    <Plus size={16} /> Log Problem
                </button>
            </div>

            {showForm && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Problem Name *</label>
                            <input type="text" name="problemName" value={formData.problemName} onChange={handleChange} required placeholder="e.g. 158A - Next Round"
                                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-slate-600 transition-colors" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Difficulty *</label>
                            <input type="number" name="difficulty" value={formData.difficulty} onChange={handleChange} required placeholder="e.g. 800"
                                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-slate-600 transition-colors" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Topic *</label>
                            <input type="text" name="topic" value={formData.topic} onChange={handleChange} required placeholder="e.g. DP, Greedy"
                                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-slate-600 transition-colors" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Platform *</label>
                            <input type="text" name="platform" value={formData.platform} onChange={handleChange} required placeholder="e.g. Codeforces"
                                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-slate-600 transition-colors" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Problem URL</label>
                            <input type="url" name="url" value={formData.url} onChange={handleChange} placeholder="https://..."
                                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-slate-600 transition-colors" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Notes</label>
                            <input type="text" name="notes" value={formData.notes} onChange={handleChange} placeholder="Quick note about your approach..."
                                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-slate-600 transition-colors" />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
                            <button type="submit" className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">Save</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search */}
            <div className="mb-6">
                <div className="relative w-full max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter problems..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-slate-600 transition-colors" />
                </div>
            </div>

            {/* Problems List */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-slate-500 text-sm">{problems.length === 0 ? 'No problems logged yet.' : 'No matching problems found.'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-8"></th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Topic</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rating</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(p => (
                                    <React.Fragment key={p._id}>
                                        <tr className="hover:bg-slate-800/30 transition-colors border-b border-slate-800/50 cursor-pointer" onClick={() => toggleExpand(p._id)}>
                                            <td className="pl-6 py-3.5">
                                                {expandedId === p._id
                                                    ? <ChevronUp size={14} className="text-slate-500" />
                                                    : <ChevronDown size={14} className="text-slate-600" />}
                                            </td>
                                            <td className="px-6 py-3.5 text-sm text-slate-200 font-medium max-w-[200px]">
                                                <div className="flex items-center gap-2">
                                                    <span className="truncate">{p.problemName}</span>
                                                    {p.notes && <StickyNote size={12} className="text-amber-500/60 shrink-0" />}
                                                    {p.url && (
                                                        <a href={p.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-slate-600 hover:text-blue-400 shrink-0">
                                                            <ExternalLink size={12} />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5 text-sm text-slate-400">{p.platform}</td>
                                            <td className="px-6 py-3.5">
                                                <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300">{p.topic}</span>
                                            </td>
                                            <td className={`px-6 py-3.5 text-sm ${getRatingColor(p.difficulty)}`}>
                                                {p.difficulty > 0 ? p.difficulty : '—'}
                                            </td>
                                            <td className="px-6 py-3.5 text-sm text-slate-500">
                                                {new Date(p.solvedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => handleDelete(p._id)} className="text-slate-600 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-400/10 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                        {/* Expanded Notes Row */}
                                        {expandedId === p._id && (
                                            <tr className="bg-slate-950/50">
                                                <td colSpan={7} className="px-6 py-4">
                                                    <div className="max-w-2xl">
                                                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">Notes & Approach</label>
                                                        <textarea
                                                            value={editingNotes[p._id] ?? p.notes ?? ''}
                                                            onChange={e => setEditingNotes({ ...editingNotes, [p._id]: e.target.value })}
                                                            placeholder="Write your approach, key observations, or learnings for this problem..."
                                                            rows={4}
                                                            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-slate-600 transition-colors resize-none"
                                                        />
                                                        <div className="flex justify-end mt-2">
                                                            <button
                                                                onClick={() => handleSaveNotes(p._id)}
                                                                className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                                                            >
                                                                <Save size={13} /> Save Notes
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProblemsManager;
