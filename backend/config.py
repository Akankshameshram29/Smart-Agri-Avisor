import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Flask application configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'smart-agri-advisor-dev-secret-key-2025')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///smart_agri_advisor.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    GEMINI_API_KEY = os.environ.get('API_KEY', '')
    
    # CORS settings
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173').split(',')
