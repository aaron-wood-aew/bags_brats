import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    MONGO_URI = os.environ.get('MONGO_URI')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    
    # Tournament timezone for scheduled tasks and check-in windows
    TOURNAMENT_TIMEZONE = os.environ.get('TOURNAMENT_TIMEZONE', 'America/Chicago')
    CHECK_IN_HOUR = int(os.environ.get('CHECK_IN_HOUR', 17))  # 5pm default
    
    # Validate required secrets at startup
    @classmethod
    def validate(cls):
        missing = []
        if not cls.SECRET_KEY:
            missing.append('SECRET_KEY')
        if not cls.MONGO_URI:
            missing.append('MONGO_URI')
        if not cls.JWT_SECRET_KEY:
            missing.append('JWT_SECRET_KEY')
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
    
    # JWT token expires in 8 hours (for tournament-day sessions)
    from datetime import timedelta
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)
    
    # Mail Config (Future scope)
    MAIL_SERVER = os.environ.get('MAIL_SERVER')
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS') is not None
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    
    # Google OAuth Config
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
    GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI', 'https://bagsbrats-production.up.railway.app/auth/google/callback')
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://efficient-insight-production.up.railway.app')
