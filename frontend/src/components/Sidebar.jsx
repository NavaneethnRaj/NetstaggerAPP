import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 min-h-screen">
            <div className="p-6 flex items-center gap-2 border-b border-slate-800">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold">S</div>
                <span className="text-xl font-bold tracking-tight">SalarySync</span>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                <a
                    onClick={() => navigate('/dashboard')}
                    className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors cursor-pointer ${location.pathname === '/dashboard'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                    <span>Dashboard</span>
                </a>
                <a
                    onClick={() => navigate('/employees')}
                    className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors cursor-pointer ${location.pathname === '/employees'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                    <span>Employees</span>
                </a>
            </nav>

            <div className="p-4 bg-slate-800/50 mt-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center overflow-hidden border border-slate-500">
                        <span className="text-xs uppercase z-10">{user?.name?.substring(0, 2) || 'HR'}</span>
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{user?.name || 'Loading...'}</p>
                        <p className="text-xs text-slate-400 truncate capitalize">{user?.role || 'Admin'}</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors p-2"
                    title="Sign out"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
