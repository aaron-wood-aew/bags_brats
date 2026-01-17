import random
from datetime import datetime, timedelta
from app.models import Game, User, Tournament, Team
from bson import ObjectId


def calculate_game_distribution(n):
    """Calculate how many normal (2v2) and power (1v2) games needed for n players.
    
    Returns (normal_games, power_games) or None if impossible.
    """
    if n < 3:
        return None
    
    remainder = n % 4
    if remainder == 0:
        return (n // 4, 0)
    elif remainder == 1:
        # Need 3 power games (9 players in power games)
        if n >= 9:
            return ((n - 9) // 4, 3)
        else:
            return None  # Can't handle n=5
    elif remainder == 2:
        # Need 2 power games (6 players in power games)
        if n >= 6:
            return ((n - 6) // 4, 2)
        else:
            return None
    else:  # remainder == 3
        # Need 1 power game (3 players in power games)
        return ((n - 3) // 4, 1)


def select_power_players(mongo, count):
    """Select 'count' Power Players, preferring those who haven't been used recently.
    
    Returns list of player dicts, or None if not enough Power Players.
    """
    # Get all checked-in power players
    power_players = list(mongo.db.users.find({
        "checked_in": True,
        "is_power_player": True
    }))
    
    if len(power_players) < count:
        return None
    
    # Sort by power_player_used (prefer unused)
    unused = [p for p in power_players if not p.get('power_player_used', False)]
    used = [p for p in power_players if p.get('power_player_used', False)]
    
    # If not enough unused, reset all and try again
    if len(unused) < count:
        # Reset all power_player_used flags
        mongo.db.users.update_many(
            {"is_power_player": True},
            {"$set": {"power_player_used": False}}
        )
        # Shuffle and select
        random.shuffle(power_players)
        selected = power_players[:count]
    else:
        # Select from unused, randomized
        random.shuffle(unused)
        selected = unused[:count]
    
    # Mark selected as used
    for p in selected:
        mongo.db.users.update_one(
            {"_id": p['_id']},
            {"$set": {"power_player_used": True}}
        )
    
    return selected


def create_teams_for_day(mongo, tournament_id, day_index):
    """Create persistent teams for a tournament day from checked-in players.
    
    Uses Power Players strategically so ALL players get to play.
    Returns list of Team objects or error dict.
    """
    # Delete any existing teams for this day (in case of re-generation)
    Team.delete_for_day(mongo, tournament_id, day_index)
    
    # Get checked-in players
    players = list(mongo.db.users.find({"checked_in": True}))
    n = len(players)
    
    if n < 3:
        return {"error": f"Cannot create teams: Only {n} player(s) checked in. Need at least 3 players."}
    
    # Calculate game distribution
    distribution = calculate_game_distribution(n)
    if distribution is None:
        return {"error": f"Cannot create valid game pairings with {n} players."}
    
    normal_games, power_games = distribution
    
    # Select Power Players if needed
    selected_power_players = []
    if power_games > 0:
        selected_power_players = select_power_players(mongo, power_games)
        if selected_power_players is None:
            return {"error": f"Need {power_games} Power Player(s) but not enough available. Ask for volunteers!"}
    
    power_player_ids = {str(p['_id']) for p in selected_power_players}
    
    # Build player lists
    all_player_ids = [str(p['_id']) for p in players]
    regular_ids = [pid for pid in all_player_ids if pid not in power_player_ids]
    random.shuffle(regular_ids)
    
    teams = []
    team_number = 1
    
    # Create Power Teams (solo)
    for pp in selected_power_players:
        team = Team({
            "tournament_id": str(tournament_id),
            "day_index": day_index,
            "player_ids": [str(pp['_id'])],
            "is_power_team": True,
            "team_number": team_number
        })
        team.save(mongo)
        teams.append(team)
        team_number += 1
    
    # Create Normal Teams (pairs)
    while len(regular_ids) >= 2:
        p1, p2 = regular_ids.pop(), regular_ids.pop()
        team = Team({
            "tournament_id": str(tournament_id),
            "day_index": day_index,
            "player_ids": [p1, p2],
            "is_power_team": False,
            "team_number": team_number
        })
        team.save(mongo)
        teams.append(team)
        team_number += 1
    
    # There should be no remaining players if algorithm is correct
    if regular_ids:
        return {"error": f"Algorithm error: {len(regular_ids)} player(s) left unassigned."}
    
    return teams


def get_previous_matchups(mongo, tournament_id, day_index):
    """Get set of team matchups that have already occurred today."""
    games = list(mongo.db.games.find({
        "tournament_id": str(tournament_id),
        "day_index": day_index
    }))
    
    matchups = set()
    for g in games:
        t1 = tuple(sorted(g.get('team1_player_ids', [])))
        t2 = tuple(sorted(g.get('team2_player_ids', [])))
        matchups.add((t1, t2) if t1 < t2 else (t2, t1))
    
    return matchups


def generate_round_pairings(mongo, tournament_id, day_index, round_number):
    """Generate game pairings for a specific round.
    
    Power teams (1 player) play against normal teams (2 players) = Power Game
    Normal teams play against normal teams = Normal Game
    """
    tournament = Tournament.find_active(mongo)
    if not tournament:
        return {"error": "No active tournament"}
    
    # Get or create teams
    teams = Team.find_for_day(mongo, tournament_id, day_index)
    
    if len(teams) == 0:
        if round_number == 1:
            result = create_teams_for_day(mongo, tournament_id, day_index)
            if isinstance(result, dict) and "error" in result:
                return result
            teams = result
        else:
            return {"error": f"No teams found for day {day_index + 1}. Generate Round 1 pairings first."}
    
    if len(teams) < 2:
        return {"error": f"Need at least 2 teams to create games. Found {len(teams)} team(s)."}
    
    # Separate power and normal teams
    power_teams = [t for t in teams if t.is_power_team]
    normal_teams = [t for t in teams if not t.is_power_team]
    
    # Get previous matchups to avoid repeats
    previous_matchups = get_previous_matchups(mongo, tournament_id, day_index)
    
    # Shuffle teams
    random.shuffle(power_teams)
    random.shuffle(normal_teams)
    
    pairings = []
    game_number = 1
    used_teams = set()
    
    # First, pair power teams with normal teams (Power Games)
    for power_team in power_teams:
        for normal_team in normal_teams:
            if normal_team.team_number in used_teams:
                continue
            
            # Check if matchup already happened
            t1_key = tuple(sorted(power_team.player_ids))
            t2_key = tuple(sorted(normal_team.player_ids))
            matchup_key = (t1_key, t2_key) if t1_key < t2_key else (t2_key, t1_key)
            
            if matchup_key in previous_matchups:
                continue
            
            # Create Power Game (1v2)
            game = Game({
                "tournament_id": str(tournament_id),
                "date": datetime.utcnow().isoformat(),
                "game_number": game_number,
                "day_index": day_index,
                "round_number": round_number,
                "team1_player_ids": power_team.player_ids,
                "team2_player_ids": normal_team.player_ids,
                "status": "upcoming",
                "is_power_game": True
            })
            game.save(mongo)
            
            # Enrich with names
            game_dict = game.to_dict()
            game_dict['team1_player_names'] = [
                mongo.db.users.find_one({"_id": ObjectId(pid)})['name'] + " ⚡"
                for pid in power_team.player_ids
            ]
            game_dict['team2_player_names'] = [
                mongo.db.users.find_one({"_id": ObjectId(pid)})['name']
                for pid in normal_team.player_ids
            ]
            pairings.append(game_dict)
            
            used_teams.add(power_team.team_number)
            used_teams.add(normal_team.team_number)
            game_number += 1
            break
    
    # Then, pair remaining normal teams together (Normal Games)
    remaining_normal = [t for t in normal_teams if t.team_number not in used_teams]
    
    for i, team1 in enumerate(remaining_normal):
        if team1.team_number in used_teams:
            continue
            
        for team2 in remaining_normal[i+1:]:
            if team2.team_number in used_teams:
                continue
            
            t1_key = tuple(sorted(team1.player_ids))
            t2_key = tuple(sorted(team2.player_ids))
            matchup_key = (t1_key, t2_key) if t1_key < t2_key else (t2_key, t1_key)
            
            if matchup_key in previous_matchups:
                continue
            
            # Create Normal Game (2v2)
            game = Game({
                "tournament_id": str(tournament_id),
                "date": datetime.utcnow().isoformat(),
                "game_number": game_number,
                "day_index": day_index,
                "round_number": round_number,
                "team1_player_ids": team1.player_ids,
                "team2_player_ids": team2.player_ids,
                "status": "upcoming",
                "is_power_game": False
            })
            game.save(mongo)
            
            game_dict = game.to_dict()
            game_dict['team1_player_names'] = [
                mongo.db.users.find_one({"_id": ObjectId(pid)})['name']
                for pid in team1.player_ids
            ]
            game_dict['team2_player_names'] = [
                mongo.db.users.find_one({"_id": ObjectId(pid)})['name']
                for pid in team2.player_ids
            ]
            pairings.append(game_dict)
            
            used_teams.add(team1.team_number)
            used_teams.add(team2.team_number)
            game_number += 1
            break
    
    return pairings


# Keep backward compatibility
def generate_daily_pairings(mongo, tournament_id):
    """Legacy function - generates Round 1 pairings."""
    tournament = Tournament.find_active(mongo)
    day_index = tournament.current_day_index if tournament else 0
    return generate_round_pairings(mongo, tournament_id, day_index, 1)
