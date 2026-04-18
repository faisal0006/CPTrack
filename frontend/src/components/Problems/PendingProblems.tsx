import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { ExternalLink, Plus, CheckCircle2, Trash2, ListTodo, X } from 'lucide-react';
import { getRatingBadgeClass } from '../../utils/colors';

const PendingProblems = () => {
    const [pending, setPending] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        problemName: '',
        url: '',
        difficulty: '',
        topic: '',
        platform: ''
    });

    const fetchPending = async () => {
        try {
            const res = await api.get('/pending');
            setPending(res.data);
        } catch (error) {
            console.error('Failed to fetch pending problems', error);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/pending', {
                ...formData,
                difficulty: formData.difficulty ? Number(formData.difficulty) : null
            });
            setFormData({ problemName: '', url: '', difficulty: '', topic: '', platform: '' });
            setShowForm(false);
            fetchPending();
        } catch (error) {
            alert('Failed to add to list');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/pending/${id}`);
            fetchPending();
        } catch (error) {
            console.error('Failed to delete', error);
        }
    };

    const handleMarkSolved = async (problem) => {
        try {
            await api.post('/problems', {
                problemName: problem.problemName,
                difficulty: problem.difficulty || 0,
                topic: problem.topic || 'Unknown',
                platform: problem.platform || 'Unknown'
            });
            await api.delete(`/pending/${problem._id}`);
            fetchPending();
        } catch (error) {
            alert('Failed to mark as solved');
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ListTodo size={22} className="text-indigo-500" />
                        To-Do List
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">{pending.length} problems queued</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 self-start"
                >
                    <Plus size={16} /> Add Problem
                </button>
            </div>

            {/* Collapsible Form */}
            {showForm && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Problem Name *</label>
                            <input type="text" name="problemName" value={formData.problemName} onChange={handleChange} required placeholder="e.g. 158A - Next Round"
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
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Difficulty</label>
                            <input type="number" name="difficulty" value={formData.difficulty} onChange={handleChange} placeholder="e.g. 1200"
                                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-slate-600 transition-colors" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Topic</label>
                            <input type="text" name="topic" value={formData.topic} onChange={handleChange} placeholder="e.g. DP"
                                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-slate-600 transition-colors" />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                                Add to List
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Problem List */}
            {pending.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl py-16 text-center">
                    <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={22} className="text-slate-600" />
                    </div>
                    <p className="text-slate-400 font-medium">All clear!</p>
                    <p className="text-slate-600 text-sm mt-1">Add problems you want to tackle later.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {pending.map(p => (
                        <div key={p._id} className="bg-slate-900 border border-slate-800 rounded-xl px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition-colors group">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-semibold text-slate-200 truncate">{p.problemName}</h4>
                                    {p.url && (
                                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-blue-400 transition-colors shrink-0">
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="text-slate-500">{p.platform}</span>
                                    {p.topic && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                            <span className="text-slate-500">{p.topic}</span>
                                        </>
                                    )}
                                    <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${getRatingBadgeClass(p.difficulty)}`}>
                                        {p.difficulty > 0 ? p.difficulty : '—'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => handleMarkSolved(p)}
                                    className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all flex items-center gap-1.5 text-xs font-medium"
                                >
                                    <CheckCircle2 size={14} /> Solved
                                </button>
                                <button
                                    onClick={() => handleDelete(p._id)}
                                    className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PendingProblems;
