# 🤖 AI Resume Analyzer & Job Matcher

An AI-powered web application that analyzes resumes and matches them 
against job descriptions using OpenAI GPT.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- OpenAI API Key
- Node.js 18+ (for local dev)
- Python 3.11+ (for local dev)

### Using Docker (Recommended)
```bash
# Clone the repository
git clone https://github.com/yourusername/ai-resume-analyzer.git
cd ai-resume-analyzer

# Set environment variables
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Start all services
docker-compose up --build

# Access the app
# Frontend: http://localhost:80
# API Docs: http://localhost:8000/api/docs