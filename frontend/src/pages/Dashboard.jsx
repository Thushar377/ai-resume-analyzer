// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ScoreCircle = ({ score }) => {
    const color = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
    return (
        <div style={{ 
            width: 80, height: 80, borderRadius: '50%',
            border: `6px solid ${color}`, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column'
        }}>
            <span style={{ fontSize: 20, fontWeight: 'bold', color }}>
                {Math.round(score)}
            </span>
            <span style={{ fontSize: 10, color: '#6b7280' }}>%</span>
        </div>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await dashboardAPI.getStats();
            setStats(data);
        } catch (err) {
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>
                    Welcome back, {user?.full_name?.split(' ')[0]}! 👋
                </h1>
                <p style={{ color: '#6b7280' }}>
                    Here's your resume analysis overview
                </p>
            </div>

            {/* Stats Cards */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <StatCard 
                    title="Total Resumes" 
                    value={stats?.total_resumes || 0}
                    icon="📄"
                    color="#3b82f6"
                />
                <StatCard 
                    title="Total Analyses" 
                    value={stats?.total_analyses || 0}
                    icon="🔍"
                    color="#8b5cf6"
                />
                <StatCard 
                    title="Avg Match Score" 
                    value={`${stats?.average_match_score || 0}%`}
                    icon="🎯"
                    color="#10b981"
                />
                <StatCard 
                    title="Skills Detected" 
                    value={stats?.top_skills?.length || 0}
                    icon="⚡"
                    color="#f59e0b"
                />
            </div>

            {/* Quick Actions */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <Link 
                    to="/upload"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '1.5rem', background: '#3b82f6', color: 'white',
                        borderRadius: '0.75rem', textDecoration: 'none',
                        fontWeight: '600', fontSize: '1.1rem'
                    }}
                >
                    <span style={{ fontSize: '2rem' }}>📤</span>
                    Upload New Resume
                </Link>
                <Link 
                    to="/analyze"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '1.5rem', background: '#8b5cf6', color: 'white',
                        borderRadius: '0.75rem', textDecoration: 'none',
                        fontWeight: '600', fontSize: '1.1rem'
                    }}
                >
                    <span style={{ fontSize: '2rem' }}>🤖</span>
                    Analyze Job Match
                </Link>
            </div>

            {/* Top Skills */}
            {stats?.top_skills?.length > 0 && (
                <div style={{ 
                    background: 'white', borderRadius: '0.75rem', 
                    padding: '1.5rem', marginBottom: '2rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                        🚀 Your Top Skills
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {stats.top_skills.map((skill, idx) => (
                            <span key={idx} style={{
                                padding: '0.375rem 0.75rem',
                                background: '#ede9fe', color: '#7c3aed',
                                borderRadius: '9999px', fontSize: '0.875rem',
                                fontWeight: '500'
                            }}>
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Analyses */}
            {stats?.recent_analyses?.length > 0 && (
                <div style={{ 
                    background: 'white', borderRadius: '0.75rem', 
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                            📊 Recent Analyses
                        </h2>
                        <Link to="/analyses" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                            View All →
                        </Link>
                    </div>
                    {stats.recent_analyses.map(analysis => (
                        <div key={analysis.id} style={{
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', padding: '1rem',
                            borderBottom: '1px solid #f3f4f6'
                        }}>
                            <div>
                                <p style={{ fontWeight: '600', color: '#111827' }}>
                                    {analysis.job_title || 'Job Analysis'}
                                </p>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                    {analysis.company_name || 'Company'} • {' '}
                                    {new Date(analysis.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <ScoreCircle score={analysis.match_score} />
                                <Link 
                                    to={`/analyses/${analysis.id}`}
                                    style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.875rem' }}
                                >
                                    View →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {stats?.total_resumes === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No resumes yet</h3>
                    <p>Upload your first resume to get started!</p>
                    <Link 
                        to="/upload"
                        style={{
                            display: 'inline-block', marginTop: '1rem',
                            padding: '0.75rem 1.5rem', background: '#3b82f6',
                            color: 'white', borderRadius: '0.5rem', textDecoration: 'none'
                        }}
                    >
                        Upload Resume
                    </Link>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div style={{
        background: 'white', borderRadius: '0.75rem', padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderLeft: `4px solid ${color}`
    }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color }}>{value}</div>
        <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>{title}</div>
    </div>
);

const LoadingSpinner = () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div style={{
            width: 40, height: 40, border: '4px solid #f3f4f6',
            borderTopColor: '#3b82f6', borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }} />
    </div>
);

export default Dashboard;