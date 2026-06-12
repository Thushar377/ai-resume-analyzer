# 🤖 AI Resume Analyzer & Job Matcher

A full-stack AI-powered web application that analyzes resumes and matches them against job descriptions using OpenAI GPT.

## 🌐 Live Demo

**Live URL:** https://ai-resume-analyzer-f1y0.onrender.com

> Note: Free tier may take 30-60 seconds to wake up on first visit.

## 📸 Screenshots

### Dashboard
Beautiful dashboard showing user stats, top skills, and recent analyses.

### Resume Upload
Drag-and-drop interface for PDF/DOCX files with real-time AI skill extraction.

### Job Match Analysis
AI-powered analysis showing match score, strengths, weaknesses, and recommendations.

## ✨ Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 📄 **Resume Upload** - Support for PDF and DOCX files (max 5MB)
- 🤖 **AI Skill Extraction** - Automatically detect technical skills
- 🎯 **Job Match Scoring** - AI-powered compatibility analysis (0-100%)
- 📊 **Dashboard** - View stats, top skills, and analysis history
- 💡 **AI Recommendations** - Personalized improvement suggestions
- 📋 **Analysis History** - Track all previous job matches
- 🚀 **REST API** - Full Swagger documentation

## 🛠️ Tech Stack

### Backend
- **Framework:** FastAPI (Python 3.12)
- **Database:** PostgreSQL with SQLAlchemy ORM
- **Authentication:** JWT (python-jose + bcrypt)
- **AI:** OpenAI GPT-3.5 Turbo
- **File Processing:** PyPDF2, python-docx

### Frontend
- **Templates:** Jinja2
- **Styling:** Tailwind CSS (via CDN)
- **JavaScript:** Vanilla JS with Fetch API

### Deployment
- **Platform:** Render.com
- **Database:** Render PostgreSQL
- **Repository:** GitHub

## 🚀 API Documentation

Interactive Swagger UI available at:
- **Live:** https://ai-resume-analyzer-f1y0.onrender.com/api/docs
- **Local:** http://127.0.0.1:8000/api/docs

### Main Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Create new user account |
| POST | `/api/v1/auth/login` | Login and get JWT token |
| GET | `/api/v1/auth/me` | Get current user info |
| POST | `/api/v1/resumes/upload` | Upload resume file |
| GET | `/api/v1/resumes/` | List all user resumes |
| POST | `/api/v1/analyses/` | Create AI analysis |
| GET | `/api/v1/analyses/` | List all analyses |
| GET | `/api/v1/dashboard/stats` | Get dashboard statistics |

## 📦 Local Setup

### Prerequisites
- Python 3.12+
- PostgreSQL 16+
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/Thushar377/ai-resume-analyzer.git
cd ai-resume-analyzer/backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create database
psql -U postgres -c "CREATE DATABASE resume_analyzer;"

# Create .env file (see below)

# Run the application
uvicorn app.main:app --reload