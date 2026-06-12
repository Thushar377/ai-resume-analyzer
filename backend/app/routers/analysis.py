# app/routers/analysis.py
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models.resume import Resume, Analysis
from app.schemas.analysis import AnalysisCreate, AnalysisResponse
from app.services.ai_service import ai_service
from app.routers.auth import get_current_user_dep
from app.models.user import User

router = APIRouter(prefix="/analyses", tags=["AI Analysis"])

async def process_analysis(analysis_id: int, db: Session):
    """Background task to process AI analysis."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        return
    
    try:
        analysis.status = "processing"
        db.commit()
        
        # Get resume
        resume = db.query(Resume).filter(Resume.id == analysis.resume_id).first()
        
        # Run AI analysis
        result = ai_service.analyze_job_match(
            resume.raw_text,
            analysis.job_description,
            resume.extracted_skills
        )
        
        # Update analysis with results
        analysis.match_score = result.get("match_score", 0.0)
        analysis.matched_skills = result.get("matched_skills", [])
        analysis.missing_skills = result.get("missing_skills", [])
        analysis.recommendations = result.get("recommendations", [])
        analysis.strengths = result.get("strengths", [])
        analysis.weaknesses = result.get("weaknesses", [])
        analysis.ai_feedback = result.get("ai_feedback", "")
        analysis.status = "completed"
        
        db.commit()
        
    except Exception as e:
        analysis.status = "failed"
        analysis.ai_feedback = f"Analysis failed: {str(e)}"
        db.commit()

@router.post("/", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
async def create_analysis(
    analysis_data: AnalysisCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db)
):
    """Create a new AI job match analysis."""
    # Verify resume ownership
    resume = db.query(Resume).filter(
        Resume.id == analysis_data.resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    if not resume.is_processed:
        raise HTTPException(status_code=400, detail="Resume is still being processed")
    
    # Create analysis record
    analysis = Analysis(
        resume_id=analysis_data.resume_id,
        user_id=current_user.id,
        job_title=analysis_data.job_title,
        job_description=analysis_data.job_description,
        company_name=analysis_data.company_name,
        status="pending"
    )
    
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    
    # Run analysis in background
    background_tasks.add_task(
        process_analysis_sync, 
        analysis.id, 
        analysis.resume_id,
        current_user.id
    )
    
    return analysis

def process_analysis_sync(analysis_id: int, resume_id: int, user_id: int):
    """Synchronous analysis processing for background tasks."""
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        
        if not analysis or not resume:
            return
        
        analysis.status = "processing"
        db.commit()
        
        result = ai_service.analyze_job_match(
            resume.raw_text or "",
            analysis.job_description,
            resume.extracted_skills or []
        )
        
        analysis.match_score = result.get("match_score", 0.0)
        analysis.matched_skills = result.get("matched_skills", [])
        analysis.missing_skills = result.get("missing_skills", [])
        analysis.recommendations = result.get("recommendations", [])
        analysis.strengths = result.get("strengths", [])
        analysis.weaknesses = result.get("weaknesses", [])
        analysis.ai_feedback = result.get("ai_feedback", "")
        analysis.status = "completed"
        db.commit()
        
    except Exception as e:
        if analysis:
            analysis.status = "failed"
            db.commit()
    finally:
        db.close()

@router.get("/", response_model=List[AnalysisResponse])
async def get_all_analyses(
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db)
):
    """Get all analyses for the current user."""
    analyses = db.query(Analysis).filter(
        Analysis.user_id == current_user.id
    ).order_by(Analysis.created_at.desc()).all()
    return analyses

@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db)
):
    """Get a specific analysis by ID."""
    analysis = db.query(Analysis).filter(
        Analysis.id == analysis_id,
        Analysis.user_id == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return analysis

@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db)
):
    """Delete a specific analysis."""
    analysis = db.query(Analysis).filter(
        Analysis.id == analysis_id,
        Analysis.user_id == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    db.delete(analysis)
    db.commit()