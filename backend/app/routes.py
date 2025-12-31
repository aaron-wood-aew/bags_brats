from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import User, Tournament, Game
from app import mongo, bcrypt
from bson import ObjectId
from datetime import datetime, timedelta

bp = Blueprint('main', __name__)

@bp.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "bags_brats_api"}), 200

@bp.route('/auth/register', methods=['POST'])
def register():
    data = request.json
    print(f"Registering user: {data}")
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password required"}), 400
    
    if User.find_by_email(mongo, data['email']):
        return jsonify({"error": "User already exists"}), 400
    
    user = User(data)
    user.set_password(data['password'])
    user.save(mongo)
    
    return jsonify({"msg": "User registered successfully", "user_id": str(user._id)}), 201

@bp.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password required"}), 400
    
    user = User.find_by_email(mongo, data['email'])
    if not user or not user.check_password(data['password']):
        return jsonify({"error": "Invalid credentials"}), 401
    
    access_token = create_access_token(identity=str(user._id))
    return jsonify({
        "access_token": access_token,
        "user": {
            "id": str(user._id),
            "name": user.name,
            "role": user.role,
            "is_proxy": user.is_proxy,
            "checked_in": getattr(user, 'checked_in', False)
        }
    }), 200

@bp.route('/player/check-in', methods=['POST'])
@jwt_required()
def player_check_in():
    user_id = get_jwt_identity()
    user = User.find_by_id(mongo, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    user.checked_in = True
    user.checked_in_at = datetime.utcnow()
    user.save(mongo)
    
    return jsonify({"msg": "Checked in successfully"}), 200

@bp.route('/player/current-game', methods=['GET'])
@jwt_required()
def get_current_game():
    user_id = get_jwt_identity()
    tournament = Tournament.find_active(mongo)
    if not tournament:
        return jsonify(None), 200
        
    game_data = mongo.db.games.find_one({
        "tournament_id": str(tournament._id),
        "status": {"$in": ["upcoming", "active"]},
        "$or": [
            {"team1_player_ids": user_id},
            {"team2_player_ids": user_id}
        ]
    })
    
    if not game_data:
        return jsonify(None), 200
        
    # Enrich with player names
    game_obj = Game(game_data).to_dict()
    game_obj['team1_player_names'] = [User.find_by_id(mongo, pid).name for pid in game_data.get('team1_player_ids', [])]
    game_obj['team2_player_names'] = [User.find_by_id(mongo, pid).name for pid in game_data.get('team2_player_ids', [])]
    
    return jsonify(game_obj), 200

@bp.route('/auth/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = User.find_by_id(mongo, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict()), 200

@bp.route('/admin/proxy-register', methods=['POST'])
@jwt_required()
def proxy_register():
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
        
    data = request.json
    if not data or not data.get('name'):
        return jsonify({"error": "Player name required"}), 400
        
    # Proxy users don't need email/password
    user = User({
        "name": data.get('name'),
        "email": data.get('email'), # Optional for proxy
        "phone": data.get('phone'), # Optional for proxy
        "is_proxy": True,
        "role": 'player'
    })
    user.save(mongo)
    
    return jsonify({"msg": "Proxy player registered", "user_id": str(user._id)}), 201

@bp.route('/tournaments', methods=['POST'])
@jwt_required()
def create_tournament():
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
        
    data = request.json
    print(f"Tournament creation request: {data}")
    if not data or not data.get('name') or not data.get('dates'):
        print("Missing name or dates")
        return jsonify({"error": "Tournament name and dates required"}), 400
        
    # Check for existing active tournament
    if Tournament.find_active(mongo):
         return jsonify({"error": "An active tournament already exists"}), 400

    tournament = Tournament(data)
    tournament.save(mongo)
    
    return jsonify({"msg": "Tournament created successfully", "tournament_id": str(tournament._id)}), 201

@bp.route('/games/<game_id>/submit', methods=['POST'])
@jwt_required()
def submit_score(game_id):
    current_user_id = get_jwt_identity()
    data = request.json
    
    score1 = data.get('score1', 0)
    score2 = data.get('score2', 0)
    
    game_data = mongo.db.games.find_one({"_id": ObjectId(game_id)})
    if not game_data:
        return jsonify({"error": "Game not found"}), 404
        
    if game_data.get('status') == 'finalized':
        return jsonify({"error": "Game already finalized"}), 400
        
    game = Game(game_data)
    game.score1 = score1
    game.score2 = score2
    game.status = 'finalized'
    game.submitted_by = current_user_id
    game.end_time = datetime.utcnow().isoformat()
    game.save(mongo)
    
    # Broadcast standings update
    try:
        from app.events import broadcast_standings_update
        broadcast_standings_update(str(game.tournament_id))
    except Exception as e:
        print(f"Standings broadcast failed: {e}")
    
    return jsonify({"msg": "Score submitted successfully"}), 200

@bp.route('/tournaments/active/games', methods=['GET'])
def get_active_tournament_games():
    tournament = Tournament.find_active(mongo)
    if not tournament:
        return jsonify([]), 200
        
    games = list(mongo.db.games.find({"tournament_id": str(tournament._id)}))
    
    # Enrich with player names
    enriched_games = []
    for g in games:
        game_obj = Game(g).to_dict()
        game_obj['team1_player_names'] = []
        for pid in g.get('team1_player_ids', []):
            u = User.find_by_id(mongo, pid)
            game_obj['team1_player_names'].append(u.name if u else "Unknown")
            
        game_obj['team2_player_names'] = []
        for pid in g.get('team2_player_ids', []):
            u = User.find_by_id(mongo, pid)
            game_obj['team2_player_names'].append(u.name if u else "Unknown")
        enriched_games.append(game_obj)
        
    return jsonify(enriched_games), 200

@bp.route('/tournaments/active', methods=['GET'])
def get_active_tournament():
    tournament = Tournament.find_active(mongo)
    if not tournament:
        return jsonify(None), 200
    return jsonify(tournament.to_dict()), 200

@bp.route('/tournaments/standings', methods=['GET'])
def get_standings():
    tournament = Tournament.find_active(mongo)
    if not tournament:
        return jsonify([]), 200
        
    games = list(mongo.db.games.find({
        "tournament_id": str(tournament._id),
        "status": "finalized"
    }))
    
    standings = {} # {user_id: {name: "", wins: 0, games: 0}}
    
    for game in games:
        # Determine winning team
        win_ids = []
        if game['score1'] > game['score2']:
            win_ids = game['team1_player_ids']
        elif game['score2'] > game['score1']:
            win_ids = game['team2_player_ids']
            
        all_players = [str(pid) for pid in game['team1_player_ids'] + game['team2_player_ids']]
        win_ids = [str(pid) for pid in win_ids]
        
        for pid in all_players:
            if pid not in standings:
                user = User.find_by_id(mongo, pid)
                standings[pid] = {"name": user.name if user else "Unknown", "wins": 0, "games_played": 0, "total_points": 0}
            
            standings[pid]["games_played"] += 1
            if pid in [str(pid) for pid in game['team1_player_ids']]:
                standings[pid]["total_points"] += game['score1']
            else:
                standings[pid]["total_points"] += game['score2']

            if pid in win_ids:
                standings[pid]["wins"] += 1
                
    # Convert to list and sort
    sorted_standings = sorted(
        [{"user_id": str(k), **v} for k, v in standings.items()],
        key=lambda x: (x['wins'], -x['games_played']),
        reverse=True
    )
    
    return jsonify(sorted_standings), 200

@bp.route('/admin/generate-pairings', methods=['POST'])
@jwt_required()
def generate_pairings_route():
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
        
    tournament = Tournament.find_active(mongo)
    if not tournament:
        return jsonify({"error": "No active tournament"}), 400
        
    from app.utils import generate_daily_pairings
    pairings = generate_daily_pairings(mongo, str(tournament._id))
    
    if "error" in pairings:
        return jsonify(pairings), 400
    
    # Broadcast to all players in this tournament
    from app.events import broadcast_pairings
    broadcast_pairings(str(tournament._id), pairings)
        
    return jsonify({"msg": "Pairings generated and revealed", "pairings": pairings}), 201

@bp.route('/games/<game_id>/start', methods=['POST'])
@jwt_required()
def start_game(game_id):
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403

    game_data = mongo.db.games.find_one({"_id": ObjectId(game_id)})
    if not game_data:
        return jsonify({"error": "Game not found"}), 404
    
    game = Game(game_data)
    game.status = 'active'
    game.start_time = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
    # 20 minutes duration
    game.end_time = (datetime.utcnow() + timedelta(minutes=20)).strftime('%Y-%m-%dT%H:%M:%SZ')
    game.save(mongo)
    
    # Broadcast game start
    try:
        from app.events import broadcast_standings_update
        broadcast_standings_update(str(game.tournament_id))
    except Exception as e:
        print(f"Start game broadcast failed: {e}")
    
    return jsonify({"msg": "Game started", "end_time": game.end_time}), 200

@bp.route('/admin/tournament/start-all', methods=['POST'])
@jwt_required()
def start_all_games():
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
        
    tournament = Tournament.find_active(mongo)
    if not tournament:
        return jsonify({"error": "No active tournament"}), 400
        
    # Find all upcoming games for this tournament
    games = list(mongo.db.games.find({
        "tournament_id": str(tournament._id),
        "status": "upcoming"
    }))
    
    now = datetime.utcnow()
    start_time = now.strftime('%Y-%m-%dT%H:%M:%SZ')
    end_time = (now + timedelta(minutes=20)).strftime('%Y-%m-%dT%H:%M:%SZ')
    
    count = 0
    for g in games:
        mongo.db.games.update_one(
            {"_id": g["_id"]},
            {"$set": {
                "status": "active",
                "start_time": start_time,
                "end_time": end_time
            }}
        )
        count += 1
        
    if count > 0:
        try:
            from app.events import broadcast_standings_update
            broadcast_standings_update(str(tournament._id))
        except Exception as e:
            print(f"Start all broadcast failed: {e}")
            
    return jsonify({"msg": f"Started {count} games", "end_time": end_time}), 200


@bp.route('/admin/tournament/blackout', methods=['POST'])
@jwt_required()
def toggle_blackout():
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
        
    tournament = Tournament.find_active(mongo)
    if not tournament:
        return jsonify({"error": "No active tournament"}), 400
        
    data = request.json
    is_blackout = data.get('blackout', False)
    
    tournament.status = 'blackout' if is_blackout else 'active'
    tournament.save(mongo)
    
    from app.events import broadcast_blackout
    broadcast_blackout(str(tournament._id), is_blackout)
    
    return jsonify({"msg": "Blackout status updated", "blackout": is_blackout}), 200

@bp.route('/admin/users', methods=['GET'])
@jwt_required()
def list_users():
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
        
    users = list(mongo.db.users.find())
    return jsonify([User(u).to_dict() for u in users]), 200

@bp.route('/admin/users/<user_id>/role', methods=['POST'])
@jwt_required()
def update_user_role(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
        
    data = request.json
    role = data.get('role')
    if role not in ['admin', 'player']:
        return jsonify({"error": "Invalid role"}), 400
        
    mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"role": role}})
    return jsonify({"msg": "User role updated"}), 200

@bp.route('/admin/users/<user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
        
    mongo.db.users.delete_one({"_id": ObjectId(user_id)})
    return jsonify({"msg": "User deleted"}), 200

@bp.route('/admin/games', methods=['GET'])
@jwt_required()
def list_active_games():
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
        
    tournament = Tournament.find_active(mongo)
    if not tournament:
        return jsonify([]), 200
        
    games = list(mongo.db.games.find({"tournament_id": str(tournament._id)}))
    
    # Enrich with player names (Import models to avoid circular dependency if needed)
    from app.models import Game
    enriched_games = []
    for g in games:
        game_obj = Game(g).to_dict()
        game_obj['team1_player_names'] = []
        for pid in g.get('team1_player_ids', []):
            u = User.find_by_id(mongo, pid)
            game_obj['team1_player_names'].append(u.name if u else "Unknown")
            
        game_obj['team2_player_names'] = []
        for pid in g.get('team2_player_ids', []):
            u = User.find_by_id(mongo, pid)
            game_obj['team2_player_names'].append(u.name if u else "Unknown")
        enriched_games.append(game_obj)
        
    return jsonify(enriched_games), 200

@bp.route('/admin/games/<game_id>', methods=['POST'])
@jwt_required()
def update_game(game_id):
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
        
    data = request.json
    update_fields = {}
    if 'score1' in data: update_fields['score1'] = int(data['score1'])
    if 'score2' in data: update_fields['score2'] = int(data['score2'])
    
    # If admin enters scores, consider it finalized unless specified otherwise
    if ('score1' in data or 'score2' in data) and 'status' not in data:
        update_fields['status'] = 'finalized'
    elif 'status' in data:
        update_fields['status'] = data['status']
    
    if update_fields:
        mongo.db.games.update_one({"_id": ObjectId(game_id)}, {"$set": update_fields})
        
        # Broadcast standings update
        try:
            game_data = mongo.db.games.find_one({"_id": ObjectId(game_id)})
            if game_data:
                from app.events import broadcast_standings_update
                broadcast_standings_update(str(game_data['tournament_id']))
        except Exception as e:
            print(f"Standings broadcast failed: {e}")
        
    return jsonify({"msg": "Game updated successfully"}), 200

@bp.route('/admin/users/bulk-delete', methods=['DELETE'])
@jwt_required()
def delete_all_players():
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
    
    # Delete everyone EXCEPT the current admin
    res = mongo.db.users.delete_many({"_id": {"$ne": ObjectId(current_user_id)}})
    return jsonify({"msg": f"Deleted {res.deleted_count} players. Your account was preserved."}), 200

@bp.route('/admin/users/seed', methods=['POST'])
@jwt_required()
def seed_players_ui():
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
    
    import string
    letters = string.ascii_lowercase[:24]
    count = 0
    for char in letters:
        email = f"{char}@{char}.com"
        if not mongo.db.users.find_one({"email": email}):
            user = User({"name": char, "email": email, "phone": "1231231234", "role": "player"})
            user.set_password(char)
            user.save(mongo)
            count += 1
            
    return jsonify({"msg": f"Seeded {count} players."}), 201

@bp.route('/admin/users/<user_id>/check-in', methods=['POST'])
@jwt_required()
def admin_check_in(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
        
    user = User.find_by_id(mongo, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    data = request.json
    is_checked_in = data.get('checked_in', True)
    
    user.checked_in = is_checked_in
    from datetime import datetime
    user.checked_in_at = datetime.utcnow() if is_checked_in else None
    user.save(mongo)
    
    return jsonify({"msg": "Check-in status updated", "checked_in": is_checked_in}), 200
@bp.route('/admin/tournaments/bulk-delete', methods=['DELETE'])
@jwt_required()
def delete_all_tournaments():
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
    
    mongo.db.tournaments.delete_many({})
    mongo.db.games.delete_many({})
    return jsonify({"msg": "All tournaments and games cleared."}), 200
