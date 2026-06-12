// src/pages/AnalysisResult.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analysisAPI } from '../services/api';

const AnalysisResult = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [polling, setPolling] = useState(false);

    useEffect(() => {
        loadAnalysis();
    }, [id]);

    const loadAnalysis = async () => {
        try {
            const data = await analysisAPI.getById(id);
            setAnalysis(data);
            
            // Poll if still processing
            if (data.status === 'pending' || data.status === 'processing') {
                setPolling(true);
                setTimeout(loadAnalysis, 3000);
            } else {
                setPolling(false);
                setLoading(false);
            }
        } catch (err) {
            setLoading(false);
        }
    };

    if (loading || polling) {
        return (
            <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤖</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    AI is Analyzing Your Resume
                </h2>
                <p style={{ color: '#6b7280' }}>
                    This usually takes 10-30 seconds...
                </p>
                <div style={{ 
                    marginTop: '2rem', display: 'inline-block',
                    width: 40, height: 40, border: '4px solid #f3f4f6',
                    borderTopColor: '#8b5cf6', borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
            </div>
        );
    }

    if (!analysis) return <div>Analysis not found</div>;

    const scoreColor = analysis.match_score >= 70 
        ? '#10b981' : analysis.match_score >= 50 
        ? '#f59e0b' : '#ef4444';

    return (
        <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'none', border: 'none',
                        color: '#6b7280', cursor: 'pointer', marginBottom: '1rem',
                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                >
                    ← Back
                </button>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
                    Analysis Results 📊
                </h1>
                {analysis.job_title && (
                    <p style={{ color: '#6b7280' }}>
                        {analysis.job_title} {analysis.company_name && `at ${analysis.company_name}`}
                    </p>
                )}
            </div>

            {/* Score Card */}
            <div style={{
                background: 'white', borderRadius: '1rem', padding: '2rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '1.5rem',
                display: 'flex', alignItems: 'center', gap: '2rem',
                borderTop: `6px solid ${scoreColor}`
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        fontSize: '4rem', fontWeight: 'bold', 
                        color: scoreColor, lineHeight: 1
                    }}>
                        {Math.round(analysis.match_score)}%
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Match Score</div>
                </div>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: scoreColor }}>
                        {analysis.match_score >= 70 ? '🎉 Strong Match!' 
                         : analysis.match_score >= 50 ? '👍 Good Match'
                         : '⚠️ Needs Improvement'}
                    </h2>
                    <p style={{ color: '#6b7280' }}>
                        {analysis.match_score >= 70 
                            ? 'Your resume is well-aligned with this position!'
                            : analysis.match_score >= 50
                            ? 'You have many of the required skills. Work on the gaps.'
                            : 'Significant skill gaps identified. Focus on the recommendations.'}
                    </p>
                </div>
            </div>

            {/* Grid Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Matched Skills */}
                <SkillCard 
                    title="✅ Matched Skills"
                    skills={analysis.matched_skills}
                    bgColor="#f0fdf4"
                    tagColor="#dcfce7"
                    textColor="#166534"
                    emptyMsg="No matched skills found"
                />
                
                {/* Missing Skills */}
                <SkillCard 
                    title="❌ Missing Skills"
                    skills={analysis.missing_skills}
                    bgColor="#fef2f2"
                    tagColor="#fee2e2"
                    textColor="#991b1b"
                    emptyMsg="No major skill gaps!"
                />
            </div>

            {/* Strengths & Weaknesses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <ListCard title="💪 Strengths" items={analysis.strengths} color="#059669" />
                <ListCard title="📈 Areas to Improve" items={analysis.weaknesses} color="#dc2626" />
            </div>

            {/* Recommendations */}
            {analysis.recommendations?.length > 0 && (
                <div style={{
                    background: 'white', borderRadius: '1rem', padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem'
                }}>
                    <h3 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '1rem' }}>
                        🚀 AI Recommendations
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {analysis.recommendations.map((rec, idx) => (
                            <div key={idx} style={{
                                display: 'flex', gap: '0.75rem',
                                padding: '0.875rem', background: '#f0f9ff',
                                borderRadius: '0.5rem', borderLeft: '4px solid #3b82f6'
                            }}>
                                <span style={{ 
                                    width: 24, height: 24, background: '#3b82f6',
                                    color: 'white', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', 
                                    justifyContent: 'center', fontSize: '0.75rem',
                                    flexShrink: 0, fontWeight: 'bold'
                                }}>
                                    {idx + 1}
                                </span>
                                <p style={{ color: '#374151', margin: 0 }}>{rec}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Feedback */}
            {analysis.ai_feedback && (
                <div style={{
                    background: '#f8f7ff', borderRadius: '1rem', padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem',
                    border: '1px solid #e0d7ff'
                }}>
                    <h3 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '1rem' }}>
                        🤖 Detailed AI Feedback
                    </h3>
                    <p style={{ color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                        {analysis.ai_feedback}
                    </p>
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    onClick={() => navigate('/analyze')}
                    style={{
                        padding: '0.875rem 1.5rem', background: '#8b5cf6',
                        color: 'white', border: 'none', borderRadius: '0.5rem',
                        cursor: 'pointer', fontWeight: '600'
                    }}
                >
                    🔄 Analyze Another Job
                </button>
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                        padding: '0.875rem 1.5rem', background: 'white',
                        border: '1px solid #d1d5db', borderRadius: '0.5rem',
                        cursor: 'pointer', color: '#374151', fontWeight: '600'
                    }}
                >
                    📊 Go to Dashboard
                </button>
            </div>
        </div>
    );
};

const SkillCard = ({ title, skills, bgColor, tagColor, textColor, emptyMsg }) => (
    <div style={{
        background: bgColor, borderRadius: '1rem', padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
        <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>{title}</h3>
        {skills?.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {skills.map((skill, idx) => (
                    <span key={idx} style={{
                        padding: '0.25rem 0.75rem', background: tagColor,
                        color: textColor, borderRadius: '9999px', fontSize: '0.875rem'
                    }}>
                        {skill}
                    </span>
                ))}
            </div>
        ) : (
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{emptyMsg}</p>
        )}
    </div>
);

const ListCard = ({ title, items, color }) => (
    <div style={{
        background: 'white', borderRadius: '1rem', padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
        <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>{title}</h3>
        {items?.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {items.map((item, idx) => (
                    <li key={idx} style={{
                        display: 'flex', gap: '0.5rem', marginBottom: '0.5rem',
                        color: '#374151', fontSize: '0.925rem'
                    }}>
                        <span style={{ color, fontWeight: 'bold' }}>•</span>
                        {item}
                    </li>
                ))}
            </ul>
        ) : (
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>None identified</p>
        )}
    </div>
);

export default AnalysisResult;