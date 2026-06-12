// src/pages/UploadResume.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeAPI } from '../services/api';

const UploadResume = () => {
    const [file, setFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef();
    const navigate = useNavigate();

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const validateAndSetFile = (selectedFile) => {
        setError('');
        if (!selectedFile) return;
        
        const ext = selectedFile.name.split('.').pop().toLowerCase();
        if (!['pdf', 'docx'].includes(ext)) {
            setError('Only PDF and DOCX files are allowed');
            return;
        }
        
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }
        
        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return;
        
        setUploading(true);
        setProgress(0);
        setError('');
        
        // Simulate progress
        const progressInterval = setInterval(() => {
            setProgress(prev => prev < 85 ? prev + 10 : prev);
        }, 300);
        
        try {
            const data = await resumeAPI.upload(file);
            clearInterval(progressInterval);
            setProgress(100);
            setResult(data);
        } catch (err) {
            clearInterval(progressInterval);
            setError(err.response?.data?.detail || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    if (result) {
        return <UploadSuccess resume={result} onAnalyze={() => navigate('/analyze')} />;
    }

    return (
        <div style={{ maxWidth: 600, margin: '3rem auto', padding: '0 1rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
                    Upload Your Resume 📄
                </h1>
                <p style={{ color: '#6b7280' }}>
                    Upload your resume in PDF or DOCX format for AI analysis
                </p>
            </div>

            {/* Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                style={{
                    border: `3px dashed ${dragOver ? '#3b82f6' : file ? '#10b981' : '#d1d5db'}`,
                    borderRadius: '1rem', padding: '3rem',
                    textAlign: 'center', cursor: 'pointer',
                    background: dragOver ? '#eff6ff' : file ? '#f0fdf4' : '#f9fafb',
                    transition: 'all 0.2s'
                }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx"
                    style={{ display: 'none' }}
                    onChange={(e) => validateAndSetFile(e.target.files[0])}
                />
                
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    {file ? '✅' : '📁'}
                </div>
                
                {file ? (
                    <div>
                        <p style={{ fontWeight: '600', color: '#059669' }}>{file.name}</p>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {(file.size / 1024).toFixed(1)} KB
                        </p>
                    </div>
                ) : (
                    <div>
                        <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                            Drop your resume here
                        </p>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                            or click to browse • PDF, DOCX • Max 5MB
                        </p>
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    marginTop: '1rem', padding: '0.75rem 1rem',
                    background: '#fef2f2', border: '1px solid #fecaca',
                    borderRadius: '0.5rem', color: '#dc2626'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Progress */}
            {uploading && (
                <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.875rem' }}>Uploading & Analyzing...</span>
                        <span style={{ fontSize: '0.875rem' }}>{progress}%</span>
                    </div>
                    <div style={{ background: '#e5e7eb', borderRadius: '9999px', height: 8 }}>
                        <div style={{
                            width: `${progress}%`, height: '100%',
                            background: '#3b82f6', borderRadius: '9999px',
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                </div>
            )}

            {/* Actions */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    style={{
                        flex: 1, padding: '0.875rem',
                        background: file && !uploading ? '#3b82f6' : '#9ca3af',
                        color: 'white', border: 'none', borderRadius: '0.5rem',
                        fontSize: '1rem', fontWeight: '600', cursor: file ? 'pointer' : 'not-allowed'
                    }}
                >
                    {uploading ? 'Processing...' : 'Upload & Analyze'}
                </button>
                
                {file && !uploading && (
                    <button
                        onClick={() => { setFile(null); setError(''); }}
                        style={{
                            padding: '0.875rem 1.5rem', background: 'white',
                            border: '1px solid #d1d5db', borderRadius: '0.5rem',
                            cursor: 'pointer', color: '#374151'
                        }}
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
};

const UploadSuccess = ({ resume, onAnalyze }) => (
    <div style={{ maxWidth: 600, margin: '3rem auto', padding: '0 1rem' }}>
        <div style={{
            background: 'white', borderRadius: '1rem', padding: '2rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center'
        }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Resume Uploaded Successfully!
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                We extracted {resume.extracted_skills?.length || 0} skills from your resume
            </p>
            
            {/* Skills Preview */}
            {resume.extracted_skills?.length > 0 && (
                <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                    <h3 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>
                        Detected Skills:
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {resume.extracted_skills.slice(0, 12).map((skill, idx) => (
                            <span key={idx} style={{
                                padding: '0.25rem 0.75rem',
                                background: '#dbeafe', color: '#1d4ed8',
                                borderRadius: '9999px', fontSize: '0.875rem'
                            }}>
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            
            <button
                onClick={onAnalyze}
                style={{
                    width: '100%', padding: '0.875rem',
                    background: '#8b5cf6', color: 'white',
                    border: 'none', borderRadius: '0.5rem',
                    fontSize: '1rem', fontWeight: '600', cursor: 'pointer'
                }}
            >
                🤖 Analyze Job Match Now
            </button>
        </div>
    </div>
);

export default UploadResume;