from flask_socketio import emit, join_room
from app import socketio
from datetime import datetime
from bson import ObjectId

def serialize_for_json(data):
    if isinstance(data, dict):
        return {k: serialize_for_json(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [serialize_for_json(v) for v in data]
    elif isinstance(data, datetime):
        return data.isoformat() + 'Z'
    elif isinstance(data, ObjectId):
        return str(data)
    else:
        return data

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
    safe_pairings = serialize_for_json(pairings)
    socketio.emit('pairings_revealed', safe_pairings, room=tournament_id)

def broadcast_blackout(tournament_id, is_blackout):
    socketio.emit('blackout_status', {"is_blackout": is_blackout}, room=tournament_id)

def broadcast_standings_update(tournament_id):
    socketio.emit('standings_updated', {}, room=tournament_id)

def broadcast_live_score(tournament_id, game_id, score1, score2):
    socketio.emit('live_score_updated', {
        "game_id": str(game_id),
        "score1": score1,
        "score2": score2
    }, room=tournament_id)

