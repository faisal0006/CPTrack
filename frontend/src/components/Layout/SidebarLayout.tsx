import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LayoutDashboard, CheckSquare, ListTodo, Search, BarChart3, LogOut, Code2 } from 'lucide-react';

const SidebarLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/problems', icon: CheckSquare, label: 'Solved Problems' },
        { path: '/pending', icon: ListTodo, label: 'To-Do List' },
        { path: '/find', icon: Search, label: 'Find Problems' },
        { path: '/analytics', icon: BarChart3, label: 'CF Analytics' },
    ];

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
                <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Code2 size={18} className="text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">CPTrack</span>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Menu</p>
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                                    isActive 
                                    ? 'bg-blue-500/10 text-blue-400 shadow-[inset_2px_0_0_0_rgba(59,130,246,1)]' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }`
                            }
                        >
                            <link.icon size={18} />
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-y-auto bg-slate-950">
                <Outlet />
            </main>
        </div>
    );
};

export default SidebarLayout;
