from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from werkzeug.middleware.proxy_fix import ProxyFix
from config import Config
import os

mongo = PyMongo()
bcrypt = Bcrypt()
jwt = JWTManager()
socketio = SocketIO(cors_allowed_origins="*")

# Global scheduler reference
scheduler = None

def create_app(config_class=Config):
    global scheduler
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Trust reverse proxy headers (Railway load balancer)
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

    CORS(app)
    
    # Debug print MONGO_URI (masking password)
    raw_uri = app.config.get('MONGO_URI', '')
    masked_uri = 'None'
    if raw_uri:
        if '@' in raw_uri:
            try:
                parts = raw_uri.split('@')
                prefix = parts[0]
                if ':' in prefix:
                    subparts = prefix.split(':')
                    # mongodb://user:pass -> mongodb://user:****
                    prefix = f"{subparts[0]}:{subparts[1]}:****"
                masked_uri = f"{prefix}@{parts[1]}"
            except Exception:
                masked_uri = "[Unparseable URI]"
        else:
            masked_uri = raw_uri
    print(f"📢 [DIAGNOSTIC] App starting. MONGO_URI = {masked_uri}")
    
    mongo.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    socketio.init_app(app)

    # Verify DB connection
    with app.app_context():
        try:
            mongo.db.command('ping')
            print("✅ MongoDB connected successfully!")
            
            # Automatic Admin Bootstrap if admin@example.com doesn't exist
            from app.models import User
            if not User.find_by_email(mongo, "admin@example.com"):
                new_user = User({
                    "name": "Tournament Admin",
                    "email": "admin@example.com",
                    "role": "admin",
                    "is_proxy": False,
                    "is_power_player": False,
                    "checked_in": False
                })
                new_user.set_password("bags2026")
                new_user.save(mongo)
                print("🚀 Seeded default admin account: admin@example.com / bags2026")
        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            print(f"   Using URI: {app.config['MONGO_URI']}")
        
        # Start scheduler (only in main process, not reloader)
        if os.environ.get('WERKZEUG_RUN_MAIN') == 'true' or not app.debug:
            from app.scheduler import create_scheduler
            scheduler = create_scheduler(mongo)
            scheduler.start()
            print(f"✅ Scheduler started (timezone: {config_class.TOURNAMENT_TIMEZONE})")

    from app.routes import bp as main_bp
    app.register_blueprint(main_bp)
    
    from app.auth_oauth import oauth_bp
    app.register_blueprint(oauth_bp)

    # Import events to register them with socketio
    from app import events

    return app
