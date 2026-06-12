# app/routers/resume.py
import os
import uuid
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.resume import Resume
from app.schemas.resume import ResumeResponse, ResumeListResponse
from app.services.resume_parser import resume_parser
from app.services.ai_service import ai_service
from app.routers.auth import get_current_user_dep
from app.models.user import User
from app.config import settings

router = APIRouter(prefix="/resumes", tags=["Resume Management"])

async def save_upload_file(file: UploadFile, user_id: int) -> tuple:
    """Save uploaded file and return path and filename."""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    ext = file.filename.split('.')[-1].lower()
    stored_name = f"{user_id}_{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, stored_name)
    
    content = await file.read()
    
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)
    
    return file_path, stored_name, content, ext

@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db)
):
    """Upload and process a resume file (PDF or DOCX)."""
    # Validate file type
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    ext = file.filename.split('.')[-1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Use: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size
    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {settings.MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Save file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    stored_name = f"{current_user.id}_{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, stored_name)
    
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)
    
    try:
        # Parse resume
        parsed = resume_parser.parse_resume(content, ext)
        
        # AI skill extraction (enhanced)
        ai_skills = {}
        if settings.OPENAI_API_KEY:
            ai_skills = ai_service.extract_skills_ai(parsed["raw_text"])
        
        # Combine skills from both methods
        all_skills = list(set(
            parsed["skills"] + 
            ai_skills.get("technical_skills", []) +
            ai_skills.get("frameworks", [])
        ))
        
        # Save to database
        resume = Resume(
            user_id=current_user.id,
            original_filename=file.filename,
            stored_filename=stored_name,
            file_path=file_path,
            file_type=ext,
            file_size=len(content),
            raw_text=parsed["raw_text"],
            extracted_skills=all_skills,
            extracted_experience=parsed["experience"],
            extracted_education=parsed["education"],
            extracted_contact=parsed["contact"],
            is_processed=True
        )
        
        db.add(resume)
        db.commit()
        db.refresh(resume)
        
        return resume
        
    except Exception as e:
        # Clean up file on error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Resume processing failed: {str(e)}")

@router.get("/", response_model=List[ResumeListResponse])
async def get_all_resumes(
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db)
):
    """Get all resumes for the current user."""
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    
    result = []
    for resume in resumes:
        result.append({
            "id": resume.id,
            "original_filename": resume.original_filename,
            "file_type": resume.file_type,
            "is_processed": resume.is_processed,
            "created_at": resume.created_at,
            "analyses_count": len(resume.analyses)
        })
    
    return result

@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db)
):
    """Get a specific resume by ID."""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    return resume

@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db)
):
    """Delete a resume and its analyses."""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Delete file
    if os.path.exists(resume.file_path):
        os.remove(resume.file_path)
    
    db.delete(resume)
    db.commit()