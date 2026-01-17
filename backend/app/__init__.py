from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from config import Config

mongo = PyMongo()
bcrypt = Bcrypt()
jwt = JWTManager()
socketio = SocketIO(cors_allowed_origins="*")

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app)
    
    mongo.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    socketio.init_app(app)

    # Verify DB connection
    with app.app_context():
        try:
            mongo.db.command('ping')
            print("✅ MongoDB connected successfully!")
        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            print(f"   Using URI: {app.config['MONGO_URI']}")

    from app.routes import bp as main_bp
    app.register_blueprint(main_bp)
    
    from app.auth_oauth import oauth_bp
    app.register_blueprint(oauth_bp)

    # Import events to register them with socketio
    from app import events

    return app
