// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '', username: '', full_name: '',
        password: '', confirm_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match');
            return;
        }
        
        setLoading(true);
        setError('');

        try {
            await register(formData);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            const detail = err.response?.data?.detail;
            if (Array.isArray(detail)) {
                setError(detail.map(d => d.msg).join(', '));
            } else {
                setError(detail || 'Registration failed');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: '#f3f4f6'
            }}>
                <div style={{
                    textAlign: 'center', background: 'white',
                    borderRadius: '1rem', padding: '3rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '4rem' }}>🎉</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Account Created!</h2>
                    <p style={{ color: '#6b7280' }}>Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: '#f3f4f6', padding: '1rem'
        }}>
            <div style={{
                background: 'white', borderRadius: '1rem', padding: '2.5rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: 450
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '3rem' }}>🤖</div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Create Account</h1>
                    <p style={{ color: '#6b7280' }}>Join ResumeAI today</p>
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
                    {[
                        { key: 'full_name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
                        { key: 'username', label: 'Username', type: 'text', placeholder: 'johndoe' },
                        { key: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
                        { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
                        { key: 'confirm_password', label: 'Confirm Password', type: 'password', placeholder: '••••••••' }
                    ].map(({ key, label, type, placeholder }) => (
                        <div key={key} style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                                {label}
                            </label>
                            <input
                                type={type}
                                value={formData[key]}
                                onChange={(e) => setFormData({...formData, [key]: e.target.value})}
                                required
                                placeholder={placeholder}
                                style={{
                                    width: '100%', padding: '0.75rem', border: '1px solid #d1d5db',
                                    borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    ))}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', padding: '0.875rem', marginTop: '0.5rem',
                            background: loading ? '#9ca3af' : '#3b82f6',
                            color: 'white', border: 'none', borderRadius: '0.5rem',
                            fontSize: '1rem', fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6b7280' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#3b82f6', fontWeight: '600' }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;