import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, FilePlus, Trophy, LogOut, Map, Settings } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        ...(user?.role === 'Admin' || user?.role === 'Worker'
            ? [{ path: '/admin', label: 'Control Center', icon: <Map size={20} /> }]
            : [{ path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> }]),
        ...(user?.role === 'Citizen'
            ? [{ path: '/submit', label: 'Submit Complaint', icon: <FilePlus size={20} /> }]
            : []),
        { path: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={20} /> },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-gray-900 text-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 flex flex-col bg-gray-800 border-r border-gray-700 shadow-xl hidden md:flex">
                <div className="p-6 flex items-center space-x-3 text-emerald-500">
                    <Map size={32} />
                    <span className="text-xl font-bold tracking-wide">CleanPulse</span>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-emerald-600 font-medium shadow-md shadow-emerald-900/20' : 'hover:bg-gray-700 text-gray-400 hover:text-white'
                                }`
                            }
                        >
                            {link.icon}
                            <span>{link.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center space-x-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <p className="font-semibold text-sm">{user?.username}</p>
                            <p className="text-xs text-gray-400">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-red-600/90 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col w-full h-full relative overflow-y-auto">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
                    <div className="flex items-center space-x-2 text-emerald-500">
                        <Map size={24} />
                        <span className="text-lg font-bold">CleanPulse</span>
                    </div>
                    <button onClick={handleLogout} className="text-gray-400 hover:text-red-500">
                        <LogOut size={20} />
                    </button>
                </header>

                <div className="p-6 md:p-8 flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
