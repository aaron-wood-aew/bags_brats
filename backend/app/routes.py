from flask import Blueprint, jsonify, request, Response
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import User, Tournament, Game
from app import mongo, bcrypt
from config import Config
from bson import ObjectId
from datetime import datetime, timedelta
import json
import pytz

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
    
    first_name = (data.get('first_name') or '').strip().title()
    last_name = (data.get('last_name') or '').strip().title()
    
    if not first_name or not last_name:
        return jsonify({"error": "First name and last name required"}), 400
    
    if User.find_by_email(mongo, data['email']):
        return jsonify({"error": "User already exists"}), 400
    
    data['first_name'] = first_name
    data['last_name'] = last_name
    data['name'] = f"{first_name} {last_name}"
    
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
    
    # Check if check-in window is open
    from app.scheduler import is_checkin_window_open
    is_open, message = is_checkin_window_open(mongo)
    if not is_open:
        return jsonify({"error": message, "check_in_closed": True}), 403
        
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
    """Update user profile (first_name, last_name, phone)"""
    user_id = get_jwt_identity()
    user = User.find_by_id(mongo, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.json
    
    # Update allowed fields
    if 'first_name' in data or 'last_name' in data:
        user.first_name = (data.get('first_name') or user.first_name or '').strip().title()
        user.last_name = (data.get('last_name') or user.last_name or '').strip().title()
        user.name = f"{user.first_name} {user.last_name}".strip()
    elif 'name' in data and data['name']:
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

@bp.route('/user/schedule', methods=['PUT'])
@jwt_required()
def update_schedule():
    """Update player's planned attendance schedule"""
    user_id = get_jwt_identity()
    user = User.find_by_id(mongo, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    data = request.json
    date = data.get('date')
    status = data.get('status') # True (present), False (absent), None (undecided)
    
    if not date:
        return jsonify({"error": "Date required"}), 400
        
    if not hasattr(user, 'attendance_schedule') or user.attendance_schedule is None:
        user.attendance_schedule = {}
        
    if status is None:
        user.attendance_schedule.pop(date, None)
    else:
        user.attendance_schedule[date] = bool(status)
        
    user.save(mongo)
    return jsonify({"msg": "Schedule updated successfully", "attendance_schedule": user.attendance_schedule}), 200


@bp.route('/admin/proxy-register', methods=['POST'])
@jwt_required()
def proxy_register():
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
        
    data = request.json
    
    # Accept first_name/last_name or legacy 'name' field
    first_name = (data.get('first_name') or '').strip().title()
    last_name = (data.get('last_name') or '').strip().title()
    
    if not first_name and not last_name and data.get('name'):
        # Legacy: split a single name field
        parts = data['name'].strip().split(' ', 1)
        first_name = parts[0].title()
        last_name = parts[1].title() if len(parts) > 1 else ''
    
    if not first_name:
        return jsonify({"error": "Player first name required"}), 400
    
    full_name = f"{first_name} {last_name}".strip()
        
    # Proxy users don't need email/password
    user = User({
        "first_name": first_name,
        "last_name": last_name,
        "name": full_name,
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
    
    data = tournament.to_dict()
    
    # Add is_tournament_day flag so frontend knows whether to show check-in
    tz = pytz.timezone(Config.TOURNAMENT_TIMEZONE)
    today = datetime.now(tz).strftime('%Y-%m-%d')
    data['is_tournament_day'] = today in (tournament.dates or [])
    data['today'] = today
    
    return jsonify(data), 200

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
                
    # Convert to list and sort by points (highest first), then wins, then fewest games
    sorted_standings = sorted(
        [{"user_id": str(k), **v} for k, v in standings.items()],
        key=lambda x: (x['total_points'], x['wins'], -x['games_played']),
        reverse=True
    )
    
    return jsonify(sorted_standings), 200


@bp.route('/admin/tournament/daily-backup', methods=['GET'])
@jwt_required()
def get_daily_backup():
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403

    tournament = Tournament.find_active(mongo)
    if not tournament:
        return jsonify({"error": "No active tournament"}), 404

    day_index = request.args.get('day_index', tournament.current_day_index, type=int)

    # 1. Fetch all finalized games in this tournament to compute aggregate standings
    all_finalized_games = list(mongo.db.games.find({
        "tournament_id": str(tournament._id),
        "status": "finalized"
    }))

    # 2. Get all players (users with role 'player')
    all_users = list(mongo.db.users.find())
    users_dict = {str(u['_id']): User(u) for u in all_users}

    # Initialize players backup records
    players_data = {}
    for uid, user in users_dict.items():
        if user.role == 'player':
            players_data[uid] = {
                "user_id": uid,
                "name": user.name,
                "daily_scores": [],
                "daily_wins": 0,
                "daily_points": 0,
                "aggregate_wins": 0,
                "aggregate_games_played": 0,
                "aggregate_points": 0
            }

    # Calculate aggregate stats from all finalized games
    for game in all_finalized_games:
        win_ids = []
        if game['score1'] > game['score2']:
            win_ids = [str(pid) for pid in game['team1_player_ids']]
        elif game['score2'] > game['score1']:
            win_ids = [str(pid) for pid in game['team2_player_ids']]

        team1_pids = [str(pid) for pid in game['team1_player_ids']]
        team2_pids = [str(pid) for pid in game['team2_player_ids']]

        for pid in team1_pids + team2_pids:
            if pid in players_data:
                players_data[pid]["aggregate_games_played"] += 1
                if pid in team1_pids:
                    players_data[pid]["aggregate_points"] += game['score1']
                else:
                    players_data[pid]["aggregate_points"] += game['score2']

                if pid in win_ids:
                    players_data[pid]["aggregate_wins"] += 1

    # Calculate daily scores round-by-round for the selected day_index
    rounds_count = tournament.rounds_per_day or 2

    # Fetch finalized games specifically for this day_index
    daily_games = list(mongo.db.games.find({
        "tournament_id": str(tournament._id),
        "day_index": day_index,
        "status": "finalized"
    }))

    for uid, player in players_data.items():
        daily_scores = []
        for r in range(1, rounds_count + 1):
            # Find the game for this player in round r on this day
            game = None
            for g in daily_games:
                if g['round_number'] == r:
                    team1_pids = [str(pid) for pid in g['team1_player_ids']]
                    team2_pids = [str(pid) for pid in g['team2_player_ids']]
                    if uid in team1_pids or uid in team2_pids:
                        game = g
                        break

            if game:
                team1_pids = [str(pid) for pid in game['team1_player_ids']]
                if uid in team1_pids:
                    own_score = game['score1']
                    opp_score = game['score2']
                else:
                    own_score = game['score2']
                    opp_score = game['score1']

                won = own_score > opp_score
                score_str = f"{own_score}-{opp_score}"
                if won:
                    player["daily_wins"] += 1
                player["daily_points"] += own_score

                daily_scores.append({
                    "round": r,
                    "score": score_str,
                    "win": won,
                    "played": True
                })
            else:
                daily_scores.append({
                    "round": r,
                    "score": "-",
                    "win": False,
                    "played": False
                })
        player["daily_scores"] = daily_scores

    # Filter out users who have not played at all in the tournament AND didn't check in or play on this day
    active_players = []
    for uid, player in players_data.items():
        user_obj = users_dict[uid]
        is_checked_in = getattr(user_obj, 'checked_in', False)
        played_today = any(s['played'] for s in player['daily_scores'])
        
        if player["aggregate_games_played"] > 0 or played_today or is_checked_in:
            active_players.append(player)

    # Sort players by aggregate standings: Wins descending, then Games Played ascending, then Points descending
    sorted_players = sorted(
        active_players,
        key=lambda x: (x['aggregate_wins'], -x['aggregate_games_played'], x['aggregate_points']),
        reverse=True
    )

    # Get tournament day date
    date_str = "Unknown Date"
    if day_index < len(tournament.dates):
        date_str = tournament.dates[day_index]
        try:
            dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            date_str = dt.strftime("%B %d, %Y")
        except Exception:
            pass

    return jsonify({
        "tournament_name": tournament.name or "Bags & Brats Tournament",
        "day_number": day_index + 1,
        "date": date_str,
        "rounds_per_day": rounds_count,
        "players": sorted_players
    }), 200


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


@bp.route('/admin/generate-sudden-death', methods=['POST'])
@jwt_required()
def generate_sudden_death_route():
    """Generate a 1v1 Sudden Death Championship Match for tied 1st-place players."""
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
        
    tournament = Tournament.find_active(mongo)
    if not tournament:
        return jsonify({"error": "No active tournament"}), 400

    # Sudden death only allowed on the last day of the tournament
    total_days = len(tournament.dates or [])
    if tournament.current_day_index != total_days - 1:
        return jsonify({"error": "Sudden Death Championship Match can only be generated on the final tournament day."}), 400

    # Check if a sudden death game already exists for today
    existing_sd = mongo.db.games.find_one({
        "tournament_id": str(tournament._id),
        "day_index": tournament.current_day_index,
        "is_sudden_death": True
    })
    if existing_sd:
        return jsonify({"error": "Sudden Death match has already been created for today."}), 400

    # Calculate standings
    games = list(mongo.db.games.find({
        "tournament_id": str(tournament._id),
        "status": "finalized"
    }))
    
    standings = {}
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
                
    sorted_standings = sorted(
        [{"user_id": str(k), **v} for k, v in standings.items()],
        key=lambda x: (x['total_points'], x['wins'], -x['games_played']),
        reverse=True
    )

    if len(sorted_standings) < 2:
        return jsonify({"error": "Need at least 2 players in standings to generate sudden death."}), 400

    # Check if top two are tied on wins and points
    p1 = sorted_standings[0]
    p2 = sorted_standings[1]
    if p1['wins'] != p2['wins'] or p1['total_points'] != p2['total_points']:
        return jsonify({"error": "Top two players are not tied. No Sudden Death needed."}), 400

    # Generate the Sudden Death match
    sd_round = tournament.current_round + 1
    
    game = Game({
        "tournament_id": str(tournament._id),
        "date": datetime.utcnow().isoformat(),
        "game_number": 1,
        "court": 1,
        "team1_player_ids": [p1['user_id']],
        "team2_player_ids": [p2['user_id']],
        "status": "upcoming",
        "is_power_game": False,
        "is_sudden_death": True,
        "day_index": tournament.current_day_index,
        "round_number": sd_round
    })
    game.save(mongo)

    # Increment current_round so the tournament advances
    tournament.current_round = sd_round
    tournament.save(mongo)

    # Prepare socket broadcast data
    game_dict = game.to_dict()
    game_dict['team1_player_names'] = [p1['name']]
    game_dict['team2_player_names'] = [p2['name']]

    # Broadcast updated pairings / standings via socket
    from app.events import broadcast_pairings
    broadcast_pairings(str(tournament._id), [game_dict])

    return jsonify({
        "msg": "Sudden Death Championship Match generated successfully! ⚔️",
        "game": game_dict
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

@bp.route('/admin/tournament/toggle-checkin', methods=['POST'])
@jwt_required()
def toggle_checkin():
    """Admin can open or close check-in early."""
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
        
    tournament = Tournament.find_active(mongo)
    if not tournament:
        return jsonify({"error": "No active tournament"}), 400
        
    data = request.json
    check_in_open = data.get('check_in_open', False)
    
    # Update tournament check_in_open flag
    mongo.db.tournaments.update_one(
        {"_id": tournament._id},
        {"$set": {"check_in_open": check_in_open}}
    )
    
    return jsonify({"msg": f"Check-in {'opened' if check_in_open else 'closed'}", "check_in_open": check_in_open}), 200

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
    
    # Calculate team stats (points, wins, margin of victory)
    team_stats = {}  # key = tuple of sorted player_ids, value = dict
    
    for g in games:
        t1_ids = tuple(sorted(g.get('team1_player_ids', [])))
        t2_ids = tuple(sorted(g.get('team2_player_ids', [])))
        score1 = int(g.get('score1', 0) or 0)
        score2 = int(g.get('score2', 0) or 0)
        
        if t1_ids not in team_stats:
            team_stats[t1_ids] = {"total_points": 0, "wins": 0, "margin_of_victory": 0}
        if t2_ids not in team_stats:
            team_stats[t2_ids] = {"total_points": 0, "wins": 0, "margin_of_victory": 0}
            
        # Sum points
        team_stats[t1_ids]["total_points"] += score1
        team_stats[t2_ids]["total_points"] += score2
        
        # Calculate wins
        if score1 > score2:
            team_stats[t1_ids]["wins"] += 1
        elif score2 > score1:
            team_stats[t2_ids]["wins"] += 1
            
        # Calculate margin of victory (point differential)
        team_stats[t1_ids]["margin_of_victory"] += (score1 - score2)
        team_stats[t2_ids]["margin_of_victory"] += (score2 - score1)
    
    # Sort by total points desc, then wins desc, then margin of victory desc
    sorted_teams = sorted(
        team_stats.items(),
        key=lambda x: (x[1]["total_points"], x[1]["wins"], x[1]["margin_of_victory"]),
        reverse=True
    )
    
    # Build top 3
    top_teams = []
    for rank, (player_ids, stats) in enumerate(sorted_teams[:3], 1):
        player_names = []
        for pid in player_ids:
            u = User.find_by_id(mongo, pid)
            if u:
                player_names.append(u.name)
        
        top_teams.append({
            "rank": rank,
            "player_ids": list(player_ids),
            "player_names": player_names,
            "total_points": stats["total_points"],
            "wins": stats["wins"],
            "margin_of_victory": stats["margin_of_victory"]
        })
    
    return jsonify(top_teams), 200

@bp.route('/admin/users', methods=['GET'])
@jwt_required()
def list_users():
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
        
    active_tournament = Tournament.find_active(mongo)
    users = list(mongo.db.users.find())
    
    user_list = []
    for u in users:
        user_obj = User(u)
        user_dict = user_obj.to_dict()
        
        # Calculate actual attendance for past day indices of the active tournament
        attendance_history = {}
        if active_tournament and active_tournament.dates:
            for idx, dt in enumerate(active_tournament.dates):
                if idx < active_tournament.current_day_index:
                    # Check if player participated in any games on this day index
                    played_game = mongo.db.games.find_one({
                        "tournament_id": str(active_tournament._id),
                        "day_index": idx,
                        "$or": [
                            {"team1_player_ids": str(user_obj._id)},
                            {"team2_player_ids": str(user_obj._id)}
                        ]
                    })
                    attendance_history[dt] = True if played_game else False
        
        user_dict['attendance_history'] = attendance_history
        user_list.append(user_dict)
        
    return jsonify(user_list), 200

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
    """Update player details including name, email, phone, and Power Player status."""
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
    
    user = User.find_by_id(mongo, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.json
    update_fields = {}
    
    # Handle first_name / last_name fields (recompute name)
    if 'first_name' in data or 'last_name' in data:
        first = (data.get('first_name') or getattr(user, 'first_name', '') or '').strip().title()
        last = (data.get('last_name') or getattr(user, 'last_name', '') or '').strip().title()
        update_fields['first_name'] = first
        update_fields['last_name'] = last
        update_fields['name'] = f"{first} {last}".strip()
    elif 'name' in data and data['name']:
        # Legacy: accept a single name and try to split
        full_name = data['name'].strip()
        parts = full_name.split(' ', 1)
        update_fields['first_name'] = parts[0].title()
        update_fields['last_name'] = parts[1].title() if len(parts) > 1 else ''
        update_fields['name'] = full_name
    
    if 'email' in data and data['email']:
        new_email = data['email'].strip().lower()
        # Check for duplicate email (skip if unchanged)
        if new_email != (user.email or '').lower():
            existing = User.find_by_email(mongo, new_email)
            if existing:
                return jsonify({"error": f"Email '{new_email}' is already in use by another account"}), 400
        update_fields['email'] = new_email
    if 'phone' in data:
        update_fields['phone'] = data['phone'].strip() if data['phone'] else None
    if 'is_power_player' in data:
        update_fields['is_power_player'] = bool(data['is_power_player'])
    if 'power_player_used' in data:
        update_fields['power_player_used'] = bool(data['power_player_used'])
    
    if update_fields:
        mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_fields})
    
    return jsonify({"msg": "User updated successfully", "updated_fields": list(update_fields.keys())}), 200

@bp.route('/admin/users/<user_id>/game-history', methods=['GET'])
@jwt_required()
def get_player_game_history(user_id):
    """Get a player's full game history with scores."""
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403

    target_user = User.find_by_id(mongo, user_id)
    if not target_user:
        return jsonify({"error": "User not found"}), 404

    tournament = Tournament.find_active(mongo)
    if not tournament:
        return jsonify({"player": target_user.to_dict(), "games": [], "summary": {}}), 200

    # Find all finalized games this player was in
    games = list(mongo.db.games.find({
        "tournament_id": str(tournament._id),
        "status": "finalized",
        "$or": [
            {"team1_player_ids": user_id},
            {"team2_player_ids": user_id}
        ]
    }))

    # Sort by day_index, then round_number
    games.sort(key=lambda g: (g.get('day_index', 0), g.get('round_number', 0)))

    total_points = 0
    total_wins = 0
    total_losses = 0
    total_ties = 0
    history = []

    for g in games:
        is_team1 = user_id in [str(pid) for pid in g.get('team1_player_ids', [])]
        
        if is_team1:
            player_score = g.get('score1', 0)
            opponent_score = g.get('score2', 0)
            partner_ids = [pid for pid in g.get('team1_player_ids', []) if str(pid) != user_id]
            opponent_ids = g.get('team2_player_ids', [])
        else:
            player_score = g.get('score2', 0)
            opponent_score = g.get('score1', 0)
            partner_ids = [pid for pid in g.get('team2_player_ids', []) if str(pid) != user_id]
            opponent_ids = g.get('team1_player_ids', [])

        # Resolve names
        partner_names = []
        for pid in partner_ids:
            u = User.find_by_id(mongo, str(pid))
            partner_names.append(u.name if u else "Unknown")

        opponent_names = []
        for pid in opponent_ids:
            u = User.find_by_id(mongo, str(pid))
            opponent_names.append(u.name if u else "Unknown")

        # Determine result
        if player_score > opponent_score:
            result = "win"
            total_wins += 1
        elif player_score < opponent_score:
            result = "loss"
            total_losses += 1
        else:
            result = "tie"
            total_ties += 1

        total_points += player_score

        # Get the date for this day
        day_idx = g.get('day_index', 0)
        date_str = tournament.dates[day_idx] if day_idx < len(tournament.dates) else None

        history.append({
            "day_index": day_idx,
            "day_number": day_idx + 1,
            "date": date_str,
            "round_number": g.get('round_number', 0),
            "partner_names": partner_names,
            "opponent_names": opponent_names,
            "player_score": player_score,
            "opponent_score": opponent_score,
            "result": result,
            "court": g.get('court'),
            "running_total": total_points
        })

    summary = {
        "total_points": total_points,
        "total_wins": total_wins,
        "total_losses": total_losses,
        "total_ties": total_ties,
        "games_played": len(history)
    }

    return jsonify({
        "player": target_user.to_dict(),
        "games": history,
        "summary": summary
    }), 200

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

@bp.route('/admin/users/<user_id>/toggle-paid', methods=['POST'])
@jwt_required()
def toggle_paid(user_id):
    """Admin toggles a user's payment status."""
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
    
    data = request.json
    has_paid = data.get('has_paid', False)
    
    user = User.find_by_id(mongo, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    user.has_paid = has_paid
    user.save(mongo)
    
    return jsonify({"msg": f"Payment status updated for {user.name}", "has_paid": has_paid}), 200

@bp.route('/admin/users/<user_id>/unlink-oauth', methods=['POST'])
@jwt_required()
def admin_unlink_oauth(user_id):
    """Admin unlinks a user's Google or Apple OAuth connection."""
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
        
    user = User.find_by_id(mongo, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    data = request.json or {}
    new_password = data.get('new_password')
    
    # If the user does not have a password set, require a new password
    if not user.password_hash:
        if not new_password or len(new_password) < 6:
            return jsonify({"error": "A password of at least 6 characters is required to convert this account."}), 400
            
    if new_password:
        if len(new_password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400
        user.set_password(new_password)
        
    # Clear OAuth fields
    user.google_id = None
    user.apple_id = None
    user.save(mongo)
    
    return jsonify({"msg": f"Social login successfully unlinked for {user.name}."}), 200

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
    
    # Player roster swaps
    for team_key in ['team1_player_ids', 'team2_player_ids']:
        if team_key in data:
            player_ids = data[team_key]
            if not isinstance(player_ids, list):
                return jsonify({"error": f"{team_key} must be a list of player IDs"}), 400
            # Validate all player IDs exist
            for pid in player_ids:
                if not User.find_by_id(mongo, pid):
                    return jsonify({"error": f"Player ID '{pid}' not found"}), 400
            update_fields[team_key] = player_ids
    
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


@bp.route('/admin/tournament/schedule', methods=['PUT'])
@jwt_required()
def update_tournament_schedule():
    """Modify an active tournament's schedule — cancel a future day or add a new day."""
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403

    tournament = Tournament.find_active(mongo)
    if not tournament:
        return jsonify({"error": "No active tournament found"}), 404

    data = request.json or {}
    cancelled_dates = tournament.cancelled_dates or []

    # --- Cancel a day ---
    if 'cancel_day_index' in data:
        cancel_idx = data['cancel_day_index']

        if not isinstance(cancel_idx, int) or cancel_idx < 0 or cancel_idx >= len(tournament.dates):
            return jsonify({"error": "Invalid day index"}), 400

        if cancel_idx <= tournament.current_day_index:
            return jsonify({"error": "Cannot cancel a past or current day"}), 400

        if cancel_idx in cancelled_dates:
            return jsonify({"error": "Day is already cancelled"}), 400

        # Add to cancelled list
        cancelled_dates.append(cancel_idx)

        # Clean up any games/teams for this day
        mongo.db.games.delete_many({
            "tournament_id": str(tournament._id),
            "day_index": cancel_idx
        })
        mongo.db.teams.delete_many({
            "tournament_id": str(tournament._id),
            "day_index": cancel_idx
        })

        # Update tournament
        mongo.db.tournaments.update_one(
            {"_id": tournament._id},
            {"$set": {"cancelled_dates": cancelled_dates}}
        )

        cancelled_date = tournament.dates[cancel_idx] if cancel_idx < len(tournament.dates) else "unknown"
        return jsonify({
            "msg": f"Day {cancel_idx + 1} ({cancelled_date}) has been cancelled",
            "cancelled_dates": cancelled_dates
        }), 200

    # --- Add a new day ---
    if 'add_date' in data:
        new_date = data['add_date']

        # Validate date format
        try:
            datetime.strptime(new_date, '%Y-%m-%d')
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

        if new_date in tournament.dates:
            return jsonify({"error": "This date is already in the tournament"}), 400

        # Add and re-sort chronologically
        dates = tournament.dates + [new_date]
        dates.sort()

        mongo.db.tournaments.update_one(
            {"_id": tournament._id},
            {"$set": {"dates": dates}}
        )

        return jsonify({
            "msg": f"New tournament day added: {new_date}",
            "dates": dates
        }), 200

    return jsonify({"error": "Provide 'cancel_day_index' or 'add_date'"}), 400


@bp.route('/admin/db/backup', methods=['GET'])
@jwt_required()
def full_db_backup():
    """Export the entire database (all 4 collections) as a JSON file download."""
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403

    def serialize_doc(doc):
        """Convert MongoDB document to JSON-serializable dict."""
        d = dict(doc)
        if '_id' in d:
            d['_id'] = str(d['_id'])
        # Handle datetime fields
        for key, val in d.items():
            if isinstance(val, datetime):
                d[key] = val.isoformat()
        return d

    backup = {
        "meta": {
            "version": "1.0",
            "created_at": datetime.utcnow().isoformat(),
            "created_by": current_user.name,
            "source": "bags_brats_db_backup"
        },
        "collections": {
            "users": [serialize_doc(u) for u in mongo.db.users.find()],
            "tournaments": [serialize_doc(t) for t in mongo.db.tournaments.find()],
            "games": [serialize_doc(g) for g in mongo.db.games.find()],
            "teams": [serialize_doc(t) for t in mongo.db.teams.find()]
        }
    }

    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    filename = f"bags_brats_full_backup_{timestamp}.json"

    return Response(
        json.dumps(backup, indent=2, default=str),
        mimetype='application/json',
        headers={
            'Content-Disposition': f'attachment; filename="{filename}"'
        }
    )


@bp.route('/admin/db/restore', methods=['POST'])
@jwt_required()
def full_db_restore():
    """Restore the entire database from a JSON backup file.
    
    The requesting admin's account is always preserved to prevent lockout.
    """
    current_user_id = get_jwt_identity()
    current_user = User.find_by_id(mongo, current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403

    if 'file' not in request.files:
        return jsonify({"error": "No backup file provided"}), 400

    file = request.files['file']
    if not file.filename.endswith('.json'):
        return jsonify({"error": "Backup file must be a .json file"}), 400

    try:
        backup_data = json.loads(file.read().decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError) as e:
        return jsonify({"error": f"Invalid JSON file: {str(e)}"}), 400

    # Validate structure
    if 'collections' not in backup_data:
        return jsonify({"error": "Invalid backup format: missing 'collections' key"}), 400

    meta = backup_data.get('meta', {})
    if meta.get('source') != 'bags_brats_db_backup':
        return jsonify({"error": "Invalid backup format: not a Bags & Brats backup file"}), 400

    collections = backup_data['collections']
    stats = {}

    try:
        # 1. Restore users — preserve the current admin
        if 'users' in collections:
            # Delete all users EXCEPT the requesting admin
            mongo.db.users.delete_many({"_id": {"$ne": ObjectId(current_user_id)}})
            
            users_to_insert = []
            for u in collections['users']:
                uid = u.pop('_id', None)
                # Skip the current admin from the backup — we keep the live one
                if uid == current_user_id:
                    continue
                if uid:
                    u['_id'] = ObjectId(uid)
                users_to_insert.append(u)
            
            if users_to_insert:
                mongo.db.users.insert_many(users_to_insert)
            stats['users'] = len(users_to_insert) + 1  # +1 for preserved admin

        # 2. Restore tournaments
        if 'tournaments' in collections:
            mongo.db.tournaments.delete_many({})
            tournaments_to_insert = []
            for t in collections['tournaments']:
                tid = t.pop('_id', None)
                if tid:
                    t['_id'] = ObjectId(tid)
                tournaments_to_insert.append(t)
            if tournaments_to_insert:
                mongo.db.tournaments.insert_many(tournaments_to_insert)
            stats['tournaments'] = len(tournaments_to_insert)

        # 3. Restore games
        if 'games' in collections:
            mongo.db.games.delete_many({})
            games_to_insert = []
            for g in collections['games']:
                gid = g.pop('_id', None)
                if gid:
                    g['_id'] = ObjectId(gid)
                games_to_insert.append(g)
            if games_to_insert:
                mongo.db.games.insert_many(games_to_insert)
            stats['games'] = len(games_to_insert)

        # 4. Restore teams
        if 'teams' in collections:
            mongo.db.teams.delete_many({})
            teams_to_insert = []
            for t in collections['teams']:
                tid = t.pop('_id', None)
                if tid:
                    t['_id'] = ObjectId(tid)
                teams_to_insert.append(t)
            if teams_to_insert:
                mongo.db.teams.insert_many(teams_to_insert)
            stats['teams'] = len(teams_to_insert)

    except Exception as e:
        return jsonify({"error": f"Restore failed: {str(e)}"}), 500

    backup_date = meta.get('created_at', 'unknown')
    return jsonify({
        "msg": f"Database restored from backup ({backup_date})",
        "stats": stats
    }), 200
