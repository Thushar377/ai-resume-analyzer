// src/pages/JobMatcher.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeAPI, analysisAPI } from '../services/api';

const JobMatcher = () => {
    const [resumes, setResumes] = useState([]);
    const [selectedResume, setSelectedResume] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [company, setCompany] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingResumes, setFetchingResumes] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadResumes();
    }, []);

    const loadResumes = async () => {
        try {
            const data = await resumeAPI.getAll();
            setResumes(data.filter(r => r.is_processed));
            if (data.length > 0) setSelectedResume(data[0].id.toString());
        } catch (err) {
            setError('Failed to load resumes');
        } finally {
            setFetchingResumes(false);
        }
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        
        if (!selectedResume) {
            setError('Please select a resume');
            return;
        }
        if (jobDescription.trim().length < 50) {
            setError('Job description must be at least 50 characters');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const analysis = await analysisAPI.create({
                resume_id: parseInt(selectedResume),
                job_title: jobTitle.trim() || undefined,
                company_name: company.trim() || undefined,
                job_description: jobDescription.trim()
            });
            
            navigate(`/analyses/${analysis.id}`);
        } catch (err) {
            setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
            setLoading(false);
        }
    };

    if (fetchingResumes) {
        return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading resumes...</div>;
    }

    if (resumes.length === 0) {
        return (
            <div style={{ maxWidth: 600, margin: '3rem auto', textAlign: 'center', padding: '0 1rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>No Resumes Found</h2>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                    Upload a resume first to start job matching
                </p>
                <button
                    onClick={() => navigate('/upload')}
                    style={{
                        padding: '0.75rem 2rem', background: '#3b82f6',
                        color: 'white', border: 'none', borderRadius: '0.5rem',
                        cursor: 'pointer', fontWeight: '600'
                    }}
                >
                    Upload Resume
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 700, margin: '3rem auto', padding: '0 1rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
                    🤖 AI Job Matcher
                </h1>
                <p style={{ color: '#6b7280' }}>
                    Paste a job description to see how well your resume matches
                </p>
            </div>

            <form onSubmit={handleAnalyze} style={{
                background: 'white', borderRadius: '1rem', padding: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                {/* Resume Selection */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Select Resume *
                    </label>
                    <select
                        value={selectedResume}
                        onChange={(e) => setSelectedResume(e.target.value)}
                        required
                        style={{
                            width: '100%', padding: '0.75rem', border: '1px solid #d1d5db',
                            borderRadius: '0.5rem', fontSize: '1rem', background: 'white'
                        }}
                    >
                        <option value="">Choose a resume...</option>
                        {resumes.map(resume => (
                            <option key={resume.id} value={resume.id}>
                                {resume.original_filename} — {new Date(resume.created_at).toLocaleDateString()}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Job Title */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Job Title
                    </label>
                    <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g., Senior Software Engineer"
                        style={{
                            width: '100%', padding: '0.75rem', border: '1px solid #d1d5db',
                            borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Company */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Company Name
                    </label>
                    <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g., Google, Microsoft"
                        style={{
                            width: '100%', padding: '0.75rem', border: '1px solid #d1d5db',
                            borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Job Description */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Job Description * 
                        <span style={{ fontWeight: 'normal', color: '#6b7280', marginLeft: '0.5rem' }}>
                            (min 50 characters)
                        </span>
                    </label>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the full job description here..."
                        rows={10}
                        required
                        style={{
                            width: '100%', padding: '0.75rem', border: '1px solid #d1d5db',
                            borderRadius: '0.5rem', fontSize: '1rem', resize: 'vertical',
                            fontFamily: 'inherit', boxSizing: 'border-box'
                        }}
                    />
                    <div style={{ 
                        textAlign: 'right', fontSize: '0.75rem', 
                        color: jobDescription.length < 50 ? '#ef4444' : '#6b7280',
                        marginTop: '0.25rem'
                    }}>
                        {jobDescription.length} characters
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        marginBottom: '1rem', padding: '0.75rem',
                        background: '#fef2f2', border: '1px solid #fecaca',
                        borderRadius: '0.5rem', color: '#dc2626'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%', padding: '1rem',
                        background: loading ? '#9ca3af' : '#8b5cf6',
                        color: 'white', border: 'none', borderRadius: '0.5rem',
                        fontSize: '1.1rem', fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? '🔄 Analyzing with AI...' : '🚀 Analyze Match'}
                </button>
            </form>
        </div>
    );
};

export default JobMatcher;