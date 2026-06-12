// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: '#f3f4f6', padding: '1rem'
        }}>
            <div style={{
                background: 'white', borderRadius: '1rem', padding: '2.5rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: 400
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '3rem' }}>🤖</div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                        ResumeAI
                    </h1>
                    <p style={{ color: '#6b7280' }}>Sign in to your account</p>
                </div>

                {error && (
                    <div style={{
                        padding: '0.75rem', marginBottom: '1rem',
                        background: '#fef2f2', border: '1px solid #fecaca',
                        borderRadius: '0.5rem', color: '#dc2626', fontSize: '0.875rem'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                            placeholder="you@example.com"
                            style={{
                                width: '100%', padding: '0.75rem', border: '1px solid #d1d5db',
                                borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                            placeholder="••••••••"
                            style={{
                                width: '100%', padding: '0.75rem', border: '1px solid #d1d5db',
                                borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', padding: '0.875rem',
                            background: loading ? '#9ca3af' : '#3b82f6',
                            color: 'white', border: 'none', borderRadius: '0.5rem',
                            fontSize: '1rem', fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6b7280' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: '#3b82f6', fontWeight: '600' }}>
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;