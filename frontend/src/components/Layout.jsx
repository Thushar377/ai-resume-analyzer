// src/components/Layout.jsx
import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/upload', label: 'Upload', icon: '📤' },
        { path: '/analyze', label: 'Analyze', icon: '🤖' },
        { path: '/analyses', label: 'History', icon: '📋' }
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex' }}>
            {/* Sidebar */}
            <aside style={{
                width: 240, background: '#1e1b4b', color: 'white',
                display: 'flex', flexDirection: 'column', position: 'fixed',
                top: 0, left: 0, height: '100vh', zIndex: 100
            }}>
                {/* Logo */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🤖 ResumeAI</div>
                    <div style={{ fontSize: '0.75rem', color: '#a5b4fc', marginTop: '0.25rem' }}>
                        AI Resume Analyzer
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '1rem 0' }}>
                    {navItems.map(({ path, label, icon }) => (
                        <Link
                            key={path}
                            to={path}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.875rem 1.5rem', textDecoration: 'none',
                                color: location.pathname === path ? 'white' : '#a5b4fc',
                                background: location.pathname === path 
                                    ? 'rgba(255,255,255,0.15)' : 'transparent',
                                borderLeft: location.pathname === path 
                                    ? '4px solid #818cf8' : '4px solid transparent',
                                transition: 'all 0.2s', fontWeight: '500'
                            }}
                        >
                            <span>{icon}</span>
                            {label}
                        </Link>
                    ))}
                </nav>

                {/* User Section */}
                <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                            {user?.full_name}
                        </div>
                        <div style={{ color: '#a5b4fc', fontSize: '0.75rem' }}>
                            {user?.email}
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%', padding: '0.625rem',
                            background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5',
                            border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem',
                            cursor: 'pointer', fontWeight: '500', fontSize: '0.875rem'
                        }}
                    >
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, marginLeft: 240, minHeight: '100vh' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;