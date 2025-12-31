from app import create_app, socketio

app = create_app()

if __name__ == '__main__':
    # Use allow_unsafe_werkzeug=True for running Flask-SocketIO in a dev container
    socketio.run(app, debug=True, port=5001, host='0.0.0.0', allow_unsafe_werkzeug=True)
