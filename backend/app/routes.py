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

@bp.route('/player/day-summary', methods=['GET'])
@jwt_required()
def get_day_summary():
    """Get player's session state and completed games for the day."""
    user_id = get_jwt_identity()
    tournament = Tournament.find_active(mongo)
    
    if not tournament:
        return jsonify({"state": "no_tournament", "games": [], "rounds_total": 0, "rounds_completed": 0}), 200
    
    day_index = tournament.current_day_index
    rounds_total = tournament.rounds_per_day
    
    # Get all player's games for today
    player_games = list(mongo.db.games.find({
        "tournament_id": str(tournament._id),
        "day_index": day_index,
        "$or": [
            {"team1_player_ids": user_id},
            {"team2_player_ids": user_id}
        ]
    }).sort("round_number", 1))
    
    # Count completed rounds
    rounds_with_games = set(g.get('round_number') for g in player_games)
    finalized_rounds = set(g.get('round_number') for g in player_games if g.get('status') == 'finalized')
    
    # Determine state
    active_game = next((g for g in player_games if g.get('status') in ['upcoming', 'active']), None)
    
    if active_game:
        state = "active"
    elif len(finalized_rounds) >= rounds_total:
        state = "day_complete"
    elif len(finalized_rounds) > 0:
        state = "between_rounds"
    else:
        state = "waiting"
    
    # Build game summaries (for completed games only, to show between rounds)
    game_summaries = []
    for g in player_games:
        if g.get('status') == 'finalized':
            is_team1 = user_id in g.get('team1_player_ids', [])
            my_score = g.get('score1') if is_team1 else g.get('score2')
            opp_score = g.get('score2') if is_team1 else g.get('score1')
            won = my_score > opp_score if my_score is not None and opp_score is not None else None
            
            game_summaries.append({
                "round": g.get('round_number'),
                "my_score": my_score,
                "opponent_score": opp_score,
                "won": won
            })
    
    return jsonify({
        "state": state,
        "games": game_summaries,
        "rounds_total": rounds_total,
        "rounds_completed": len(finalized_rounds),
        "current_round": max(rounds_with_games) if rounds_with_games else 0
    }), 200

@bp.route('/auth/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = User.find_by_id(mongo, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict()), 200

@bp.route('/user/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile (name, phone)"""
    user_id = get_jwt_identity()
    user = User.find_by_id(mongo, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.json
    
    # Update allowed fields
    if 'name' in data and data['name']:
        user.name = data['name'].strip()
    if 'phone' in data:
        user.phone = data['phone'].strip() if data['phone'] else None
    
    user.save(mongo)
    return jsonify({"msg": "Profile updated successfully", "user": user.to_dict()}), 200

@bp.route('/user/password', methods=['PUT'])
@jwt_required()
def change_password():
    """Change user password (requires current password)"""
    user_id = get_jwt_identity()
    user = User.find_by_id(mongo, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # OAuth users don't have passwords
    if user.google_id and not user.password_hash:
        return jsonify({"error": "Google users cannot set a password here. Use Google sign-in."}), 400
    
    data = request.json
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not current_password or not new_password:
        return jsonify({"error": "Current and new password required"}), 400
    
    if len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    
    if not user.check_password(current_password):
        return jsonify({"error": "Current password is incorrect"}), 401
    
    user.set_password(new_password)
    user.save(mongo)
    return jsonify({"msg": "Password changed successfully"}), 200

@bp.route('/user/power-player', methods=['PUT'])
@jwt_required()
def opt_in_power_player():
    """Permanently opt-in as a Power Player."""
    user_id = get_jwt_identity()
    user = User.find_by_id(mongo, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Already a power player
    if user.is_power_player:
        return jsonify({"msg": "You are already a Power Player"}), 200
    
    user.is_power_player = True
    user.save(mongo)
    return jsonify({"msg": "Welcome to the Power Player club! ⚡"}), 200

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
    
    # Input validation
    try:
        score1 = int(data.get('score1', 0))
        score2 = int(data.get('score2', 0))
    except (ValueError, TypeError):
        return jsonify({"error": "Scores must be valid numbers"}), 400
    
    if score1 < 0 or score2 < 0:
        return jsonify({"error": "Scores cannot be negative"}), 400
    
    if score1 > 50 or score2 > 50:
        return jsonify({"error": "Scores cannot exceed 50"}), 400
    
    game_data = mongo.db.games.find_one({"_id": ObjectId(game_id)})
    if not game_data:
        return jsonify({"error": "Game not found"}), 404
    
    # Check if user is a participant in this game
    all_players = game_data.get('team1_player_ids', []) + game_data.get('team2_player_ids', [])
    if current_user_id not in all_players:
        # Check if user is admin
        current_user = User.find_by_id(mongo, current_user_id)
        if not current_user or current_user.role != 'admin':
            return jsonify({"error": "You are not a participant in this game"}), 403
        
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
    """Generate pairings for the current/next round."""
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
        
    tournament = Tournament.find_active(mongo)
    if not tournament:
        return jsonify({"error": "No active tournament"}), 400
    
    data = request.json or {}
    day_index = data.get('day_index', tournament.current_day_index)
    round_number = data.get('round_number', tournament.current_round + 1)
    
    from app.utils import generate_round_pairings
    pairings = generate_round_pairings(mongo, str(tournament._id), day_index, round_number)
    
    if isinstance(pairings, dict) and "error" in pairings:
        return jsonify(pairings), 400
    
    # Update tournament's current round
    tournament.current_round = round_number
    tournament.save(mongo)
    
    # Broadcast to all players in this tournament
    from app.events import broadcast_pairings
    broadcast_pairings(str(tournament._id), pairings)
        
    return jsonify({
        "msg": f"Round {round_number} pairings generated",
        "round": round_number,
        "day": day_index + 1,
        "games_count": len(pairings),
        "pairings": pairings
    }), 201


@bp.route('/admin/round/start', methods=['POST'])
@jwt_required()
def start_round():
    """Start all upcoming games for the current round."""
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
        
    tournament = Tournament.find_active(mongo)
    if not tournament:
        return jsonify({"error": "No active tournament"}), 400
    
    data = request.json or {}
    day_index = data.get('day_index', tournament.current_day_index)
    round_number = data.get('round_number', tournament.current_round)
    
    if round_number == 0:
        return jsonify({"error": "No round has been generated yet. Generate pairings first."}), 400
    
    # Find upcoming games for this round
    games = list(mongo.db.games.find({
        "tournament_id": str(tournament._id),
        "day_index": day_index,
        "round_number": round_number,
        "status": "upcoming"
    }))
    
    if len(games) == 0:
        return jsonify({"error": f"No upcoming games found for Round {round_number}"}), 400
    
    now = datetime.utcnow()
    start_time = now.strftime('%Y-%m-%dT%H:%M:%SZ')
    end_time = (now + timedelta(minutes=20)).strftime('%Y-%m-%dT%H:%M:%SZ')
    
    for g in games:
        mongo.db.games.update_one(
            {"_id": g["_id"]},
            {"$set": {
                "status": "active",
                "start_time": start_time,
                "end_time": end_time
            }}
        )
    
    try:
        from app.events import broadcast_standings_update
        broadcast_standings_update(str(tournament._id))
    except Exception as e:
        print(f"Start round broadcast failed: {e}")
    
    return jsonify({
        "msg": f"Round {round_number} started",
        "games_started": len(games),
        "end_time": end_time
    }), 200


@bp.route('/admin/round/stop', methods=['POST'])
@jwt_required()
def stop_round():
    """Finalize all active games for the current round."""
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
        
    tournament = Tournament.find_active(mongo)
    if not tournament:
        return jsonify({"error": "No active tournament"}), 400
    
    data = request.json or {}
    day_index = data.get('day_index', tournament.current_day_index)
    round_number = data.get('round_number', tournament.current_round)
    
    # Find active games for this round
    games = list(mongo.db.games.find({
        "tournament_id": str(tournament._id),
        "day_index": day_index,
        "round_number": round_number,
        "status": "active"
    }))
    
    for g in games:
        mongo.db.games.update_one(
            {"_id": g["_id"]},
            {"$set": {
                "status": "finalized",
                "end_time": datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
            }}
        )
    
    try:
        from app.events import broadcast_standings_update
        broadcast_standings_update(str(tournament._id))
    except Exception as e:
        print(f"Stop round broadcast failed: {e}")
    
    return jsonify({
        "msg": f"Round {round_number} finalized",
        "games_finalized": len(games)
    }), 200


@bp.route('/admin/round/status', methods=['GET'])
@jwt_required()
def get_round_status():
    """Get status of all rounds for current day."""
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
    
    tournament = Tournament.find_active(mongo)
    if not tournament:
        return jsonify({"error": "No active tournament"}), 400
    
    day_index = request.args.get('day_index', tournament.current_day_index, type=int)
    
    rounds = []
    for r in range(1, tournament.rounds_per_day + 1):
        games = list(mongo.db.games.find({
            "tournament_id": str(tournament._id),
            "day_index": day_index,
            "round_number": r
        }))
        
        if len(games) == 0:
            status = "pending"
        elif all(g['status'] == 'finalized' for g in games):
            status = "complete"
        elif any(g['status'] == 'active' for g in games):
            status = "active"
        else:
            status = "ready"  # Pairings generated but not started
        
        rounds.append({
            "round_number": r,
            "status": status,
            "total_games": len(games),
            "finalized_games": sum(1 for g in games if g['status'] == 'finalized'),
            "active_games": sum(1 for g in games if g['status'] == 'active')
        })
    
    return jsonify({
        "tournament_id": str(tournament._id),
        "day_index": day_index,
        "day_number": day_index + 1,
        "current_round": tournament.current_round,
        "rounds_per_day": tournament.rounds_per_day,
        "rounds": rounds
    }), 200



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

@bp.route('/admin/tournament/stop-all', methods=['POST'])
@jwt_required()
def stop_all_games():
    """Finalize all active games in the current tournament."""
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
        
    tournament = Tournament.find_active(mongo)
    if not tournament:
        return jsonify({"error": "No active tournament"}), 400
        
    # Find all active games for this tournament
    games = list(mongo.db.games.find({
        "tournament_id": str(tournament._id),
        "status": "active"
    }))
    
    count = 0
    for g in games:
        mongo.db.games.update_one(
            {"_id": g["_id"]},
            {"$set": {
                "status": "finalized",
                "end_time": datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
            }}
        )
        count += 1
        
    if count > 0:
        try:
            from app.events import broadcast_standings_update
            broadcast_standings_update(str(tournament._id))
        except Exception as e:
            print(f"Stop all broadcast failed: {e}")
            
    return jsonify({"msg": f"Finalized {count} games"}), 200


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

@bp.route('/admin/tournament/top-teams', methods=['GET'])
@jwt_required()
def get_top_teams():
    """Get top 3 teams for the current tournament day (for Big Reveal)."""
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
    
    tournament = Tournament.find_active(mongo)
    if not tournament:
        return jsonify({"error": "No active tournament"}), 400
    
    day_index = tournament.current_day_index
    
    # Get all finalized games for today
    games = list(mongo.db.games.find({
        "tournament_id": str(tournament._id),
        "day_index": day_index,
        "status": "finalized"
    }))
    
    # Calculate team scores (sum of points across all games)
    team_scores = {}  # key = tuple of sorted player_ids
    
    for g in games:
        t1_ids = tuple(sorted(g.get('team1_player_ids', [])))
        t2_ids = tuple(sorted(g.get('team2_player_ids', [])))
        score1 = g.get('score1', 0) or 0
        score2 = g.get('score2', 0) or 0
        
        team_scores[t1_ids] = team_scores.get(t1_ids, 0) + score1
        team_scores[t2_ids] = team_scores.get(t2_ids, 0) + score2
    
    # Sort by total points
    sorted_teams = sorted(team_scores.items(), key=lambda x: x[1], reverse=True)
    
    # Build top 3
    top_teams = []
    for rank, (player_ids, total_points) in enumerate(sorted_teams[:3], 1):
        player_names = []
        for pid in player_ids:
            u = User.find_by_id(mongo, pid)
            if u:
                player_names.append(u.name)
        
        top_teams.append({
            "rank": rank,
            "player_ids": list(player_ids),
            "player_names": player_names,
            "total_points": total_points
        })
    
    return jsonify(top_teams), 200

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

@bp.route('/admin/users/<user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """Update player details including name, phone, and Power Player status."""
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
    
    user = User.find_by_id(mongo, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.json
    update_fields = {}
    
    # Allowed editable fields
    if 'name' in data:
        update_fields['name'] = data['name']
    if 'phone' in data:
        update_fields['phone'] = data['phone']
    if 'is_power_player' in data:
        update_fields['is_power_player'] = bool(data['is_power_player'])
    if 'power_player_used' in data:
        update_fields['power_player_used'] = bool(data['power_player_used'])
    
    if update_fields:
        mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_fields})
    
    return jsonify({"msg": "User updated successfully", "updated_fields": list(update_fields.keys())}), 200

@bp.route('/admin/users/<user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
        
    mongo.db.users.delete_one({"_id": ObjectId(user_id)})
    return jsonify({"msg": "User deleted"}), 200

@bp.route('/admin/users/<user_id>/reset-password', methods=['PUT'])
@jwt_required()
def admin_reset_password(user_id):
    """Admin resets a user's password (for locked-out users)."""
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
    
    data = request.json
    new_password = data.get('new_password')
    
    if not new_password or len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    
    user = User.find_by_id(mongo, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    user.set_password(new_password)
    user.save(mongo)
    
    return jsonify({"msg": f"Password reset for {user.name}"}), 200

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
    from werkzeug.security import generate_password_hash
    
    # Realistic names for A-X
    SEED_NAMES = {
        'a': 'Alice Anderson', 'b': 'Bob Baker', 'c': 'Carol Carter',
        'd': 'David Davis', 'e': 'Emma Edwards', 'f': 'Frank Foster',
        'g': 'Grace Garcia', 'h': 'Henry Harris', 'i': 'Iris Ingram',
        'j': 'Jack Johnson', 'k': 'Karen King', 'l': 'Leo Lewis',
        'm': 'Maria Martinez', 'n': 'Noah Nelson', 'o': 'Olivia Owens',
        'p': 'Paul Parker', 'q': 'Quinn Quigley', 'r': 'Rachel Roberts',
        's': 'Sam Smith', 't': 'Tina Taylor', 'u': 'Uma Underwood',
        'v': 'Victor Valdez', 'w': 'Wendy Wilson', 'x': 'Xavier Xu'
    }
    POWER_PLAYERS = ['e', 'j', 'o', 't']
    
    letters = string.ascii_lowercase[:24]
    created = 0
    updated = 0
    
    for char in letters:
        email = f"{char}@{char}.com"
        is_power = char in POWER_PLAYERS
        
        existing = mongo.db.users.find_one({"email": email})
        if existing:
            # Update existing player with full name and power player status
            mongo.db.users.update_one(
                {"email": email},
                {"$set": {
                    "name": SEED_NAMES[char],
                    "is_power_player": is_power,
                    "power_player_used": False
                }}
            )
            updated += 1
        else:
            # Create new player
            user = User({
                "name": SEED_NAMES[char],
                "email": email,
                "phone": "1231231234",
                "role": "player",
                "is_power_player": is_power,
                "power_player_used": False
            })
            user.set_password(char)
            user.save(mongo)
            created += 1
    
    power_names = ', '.join([SEED_NAMES[c] for c in POWER_PLAYERS])
    return jsonify({"msg": f"Created {created}, updated {updated} players. ⚡ Power Players: {power_names}"}), 201

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
