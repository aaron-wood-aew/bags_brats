from flask_socketio import emit, join_room
from app import socketio

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('join_tournament')
def handle_join_tournament(data):
    room = data.get('tournament_id')
    join_room(room)
    print(f'Client joined tournament room: {room}')

@socketio.on('reveal_pairings')
def handle_reveal_pairings(data):
    # This event is triggered by the backend route or admin manually
    # But usually, it's safer to have the route broadcast via socket_io
    pass

def broadcast_pairings(tournament_id, pairings):
    socketio.emit('pairings_revealed', pairings, room=tournament_id)

def broadcast_blackout(tournament_id, is_blackout):
    socketio.emit('blackout_status', {"is_blackout": is_blackout}, room=tournament_id)

def broadcast_standings_update(tournament_id):
    socketio.emit('standings_updated', {}, room=tournament_id)
