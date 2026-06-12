# app/routers/dashboard.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.resume import Resume, Analysis
from app.schemas.analysis import DashboardStats, AnalysisResponse
from app.routers.auth import get_current_user_dep
from app.models.user import User
from typing import List

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for the current user."""
    # Total counts
    total_resumes = db.query(Resume).filter(
        Resume.user_id == current_user.id
    ).count()
    
    total_analyses = db.query(Analysis).filter(
        Analysis.user_id == current_user.id
    ).count()
    
    # Average match score
    avg_score = db.query(func.avg(Analysis.match_score)).filter(
        Analysis.user_id == current_user.id,
        Analysis.status == "completed"
    ).scalar() or 0.0
    
    # Extract top skills across all resumes
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    skill_count = {}
    for resume in resumes:
        for skill in (resume.extracted_skills or []):
            skill_count[skill] = skill_count.get(skill, 0) + 1
    
    top_skills = sorted(skill_count, key=skill_count.get, reverse=True)[:10]
    
    # Recent analyses
    recent_analyses = db.query(Analysis).filter(
        Analysis.user_id == current_user.id
    ).order_by(Analysis.created_at.desc()).limit(5).all()
    
    return {
        "total_resumes": total_resumes,
        "total_analyses": total_analyses,
        "average_match_score": round(float(avg_score), 2),
        "top_skills": top_skills,
        "recent_analyses": recent_analyses
    }

@router.get("/analyses/history", response_model=List[AnalysisResponse])
async def get_analysis_history(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db)
):
    """Get paginated analysis history."""
    analyses = db.query(Analysis).filter(
        Analysis.user_id == current_user.id
    ).order_by(
        Analysis.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return analyses