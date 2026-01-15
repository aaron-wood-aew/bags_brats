import os
from app import create_app, socketio

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    
    # Use eventlet for production Socket.IO support
    socketio.run(app, debug=debug, port=port, host='0.0.0.0', allow_unsafe_werkzeug=True)
