# app/schemas/resume.py
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ResumeResponse(BaseModel):
    id: int
    original_filename: str
    file_type: str
    file_size: int
    extracted_skills: List[str]
    extracted_experience: Dict[str, Any]
    extracted_education: Dict[str, Any]
    extracted_contact: Dict[str, Any]
    is_processed: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ResumeListResponse(BaseModel):
    id: int
    original_filename: str
    file_type: str
    is_processed: bool
    created_at: datetime
    analyses_count: int
    
    class Config:
        from_attributes = True