# app/schemas/analysis.py
from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any
from datetime import datetime

class AnalysisCreate(BaseModel):
    resume_id: int
    job_description: str
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    
    @validator('job_description')
    def job_description_not_empty(cls, v):
        if len(v.strip()) < 50:
            raise ValueError('Job description must be at least 50 characters')
        return v.strip()

class AnalysisResponse(BaseModel):
    id: int
    resume_id: int
    job_title: Optional[str]
    company_name: Optional[str]
    match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    recommendations: List[str]
    strengths: List[str]
    weaknesses: List[str]
    ai_feedback: Optional[str]
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_resumes: int
    total_analyses: int
    average_match_score: float
    top_skills: List[str]
    recent_analyses: List[AnalysisResponse]