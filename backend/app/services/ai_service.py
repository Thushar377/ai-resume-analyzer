# app/services/ai_service.py
import openai
import json
import re
from typing import Dict, List, Any, Optional
from app.config import settings

class AIService:
    
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    
    def _call_openai(self, messages: list, max_tokens: int = 1500) -> str:
        """Make API call to OpenAI."""
        response = self.client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            max_tokens=max_tokens,
            temperature=0.3
        )
        return response.choices[0].message.content
    
    def extract_skills_ai(self, resume_text: str) -> Dict[str, Any]:
        """Use AI to extract and categorize skills from resume."""
        messages = [
            {
                "role": "system",
                "content": """You are an expert HR professional and resume analyzer. 
                Extract skills from the resume and return ONLY valid JSON."""
            },
            {
                "role": "user",
                "content": f"""Analyze this resume and extract skills. 
                Return ONLY this JSON format (no markdown, no extra text):
                {{
                    "technical_skills": ["skill1", "skill2"],
                    "soft_skills": ["skill1", "skill2"],
                    "tools": ["tool1", "tool2"],
                    "languages": ["lang1", "lang2"],
                    "frameworks": ["fw1", "fw2"],
                    "certifications": ["cert1", "cert2"],
                    "experience_level": "junior|mid|senior|lead",
                    "summary": "brief 2-3 sentence professional summary"
                }}
                
                Resume text:
                {resume_text[:3000]}"""
            }
        ]
        
        try:
            response = self._call_openai(messages)
            # Clean response to ensure valid JSON
            cleaned = self._extract_json(response)
            return json.loads(cleaned)
        except Exception as e:
            return {
                "technical_skills": [],
                "soft_skills": [],
                "tools": [],
                "languages": [],
                "frameworks": [],
                "certifications": [],
                "experience_level": "unknown",
                "summary": "Could not generate summary",
                "error": str(e)
            }
    
    def analyze_job_match(
        self, 
        resume_text: str, 
        job_description: str,
        extracted_skills: List[str]
    ) -> Dict[str, Any]:
        """Analyze how well a resume matches a job description."""
        messages = [
            {
                "role": "system",
                "content": """You are an expert ATS (Applicant Tracking System) and 
                career coach. Analyze resume-job compatibility and provide detailed feedback.
                Return ONLY valid JSON without any markdown formatting."""
            },
            {
                "role": "user", 
                "content": f"""Analyze the match between this resume and job description.
                
                RESUME SKILLS: {', '.join(extracted_skills[:30])}
                
                RESUME TEXT (excerpt):
                {resume_text[:2000]}
                
                JOB DESCRIPTION:
                {job_description[:2000]}
                
                Return ONLY this JSON (no markdown):
                {{
                    "match_score": 75,
                    "matched_skills": ["skill1", "skill2"],
                    "missing_skills": ["skill1", "skill2"],
                    "strengths": ["strength1", "strength2", "strength3"],
                    "weaknesses": ["weakness1", "weakness2"],
                    "recommendations": [
                        "Specific action 1",
                        "Specific action 2",
                        "Specific action 3",
                        "Specific action 4"
                    ],
                    "ai_feedback": "Detailed 3-4 paragraph professional feedback...",
                    "ats_compatibility": "high|medium|low",
                    "interview_probability": "high|medium|low",
                    "suggested_roles": ["role1", "role2"]
                }}
                
                match_score should be 0-100 based on actual skill match percentage."""
            }
        ]
        
        try:
            response = self._call_openai(messages, max_tokens=2000)
            cleaned = self._extract_json(response)
            result = json.loads(cleaned)
            
            # Ensure score is within bounds
            result['match_score'] = max(0, min(100, float(result.get('match_score', 0))))
            return result
        except Exception as e:
            return {
                "match_score": 0.0,
                "matched_skills": [],
                "missing_skills": [],
                "strengths": ["Unable to analyze - please try again"],
                "weaknesses": [],
                "recommendations": ["Please re-submit for analysis"],
                "ai_feedback": f"Analysis failed: {str(e)}",
                "ats_compatibility": "unknown",
                "interview_probability": "unknown",
                "suggested_roles": []
            }
    
    def generate_resume_feedback(self, resume_text: str) -> str:
        """Generate general resume improvement feedback."""
        messages = [
            {
                "role": "system",
                "content": "You are a professional resume coach with 10+ years of experience."
            },
            {
                "role": "user",
                "content": f"""Review this resume and provide actionable improvement suggestions.
                Focus on:
                1. Format and structure
                2. Content quality  
                3. Quantifiable achievements
                4. Keywords optimization
                5. Overall presentation
                
                Keep feedback concise and actionable (under 300 words).
                
                Resume:
                {resume_text[:2500]}"""
            }
        ]
        
        try:
            return self._call_openai(messages)
        except Exception as e:
            return f"Feedback generation failed: {str(e)}"
    
    def _extract_json(self, text: str) -> str:
        """Extract JSON from potentially markdown-wrapped response."""
        # Remove markdown code blocks
        text = re.sub(r'```json\s*', '', text)
        text = re.sub(r'```\s*', '', text)
        
        # Find JSON object
        start = text.find('{')
        end = text.rfind('}') + 1
        
        if start != -1 and end > start:
            return text[start:end]
        return text.strip()

ai_service = AIService()