import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Code2 } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950">
            <div className="w-full max-w-sm px-6">
                <div className="flex items-center justify-center gap-2 mb-10">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-emerald-400 flex items-center justify-center">
                        <Code2 size={18} className="text-white" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">CPTrack</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                    <h2 className="text-xl font-bold text-white mb-1">Create account</h2>
                    <p className="text-sm text-slate-500 mb-6">Get started with CPTrack</p>

                    {error && (
                        <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required
                                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-slate-600 transition-colors" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-slate-600 transition-colors" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-slate-600 transition-colors" />
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2">
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-500 hover:text-blue-400 transition-colors">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
