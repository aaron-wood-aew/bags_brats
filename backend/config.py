import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    MONGO_URI = os.environ.get('MONGO_URI')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    
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
