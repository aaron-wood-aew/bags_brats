import random
from datetime import datetime, timedelta
from app.models import Game, User, Tournament, Team
from bson import ObjectId


def create_teams_for_day(mongo, tournament_id, day_index):
    """Create persistent teams for a tournament day from checked-in players.
    
    Teams persist for all rounds in the day. Power Players get solo teams.
    Returns list of Team objects.
    """
    # Delete any existing teams for this day (in case of re-generation)
    Team.delete_for_day(mongo, tournament_id, day_index)
    
    # Get checked-in players
    players = list(mongo.db.users.find({"checked_in": True}))
    
    if len(players) < 3:
        return {"error": f"Cannot create teams: Only {len(players)} player(s) checked in. Need at least 3 players."}
    
    player_ids = [str(p['_id']) for p in players]
    random.shuffle(player_ids)
    
    teams = []
    team_number = 1
    
    # Create 2-player teams from groups of 2
    while len(player_ids) >= 2:
        p1, p2 = player_ids.pop(), player_ids.pop()
        
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
    
    # Handle remaining player (if odd number)
    if len(player_ids) == 1:
        remaining_id = player_ids[0]
        remaining_player = mongo.db.users.find_one({"_id": ObjectId(remaining_id)})
        
        if remaining_player.get('is_power_player', False):
            # Create solo Power Team
            team = Team({
                "tournament_id": str(tournament_id),
                "day_index": day_index,
                "player_ids": [remaining_id],
                "is_power_team": True,
                "team_number": team_number
            })
            team.save(mongo)
            teams.append(team)
        else:
            # Try to find a Power Player among already-teamed players to swap
            power_players = list(mongo.db.users.find({
                "checked_in": True,
                "is_power_player": True
            }))
            
            if len(power_players) == 0:
                return {"error": "Odd number of players but no Power Players available. Need at least 1 Power Player."}
            
            # Find a team containing a Power Player and swap
            power_ids = [str(p['_id']) for p in power_players]
            swapped = False
            
            for team in teams:
                for pid in team.player_ids:
                    if pid in power_ids:
                        # Swap: Power Player becomes solo, remaining player joins team
                        team.player_ids.remove(pid)
                        team.player_ids.append(remaining_id)
                        team.save(mongo)
                        
                        # Create Power Team
                        power_team = Team({
                            "tournament_id": str(tournament_id),
                            "day_index": day_index,
                            "player_ids": [pid],
                            "is_power_team": True,
                            "team_number": team_number
                        })
                        power_team.save(mongo)
                        teams.append(power_team)
                        swapped = True
                        break
                if swapped:
                    break
            
            if not swapped:
                return {"error": "Could not form teams: Power Player swap failed."}
    
    return teams


def get_previous_matchups(mongo, tournament_id, day_index):
    """Get set of team matchups that have already occurred today."""
    games = list(mongo.db.games.find({
        "tournament_id": str(tournament_id),
        "day_index": day_index
    }))
    
    matchups = set()
    for g in games:
        # Create a frozen set of team player IDs for comparison
        t1 = tuple(sorted(g.get('team1_player_ids', [])))
        t2 = tuple(sorted(g.get('team2_player_ids', [])))
        matchups.add((t1, t2) if t1 < t2 else (t2, t1))
    
    return matchups


def generate_round_pairings(mongo, tournament_id, day_index, round_number):
    """Generate game pairings for a specific round.
    
    Round 1: Creates new teams and pairs them
    Round 2+: Uses existing teams, matches against different opponents
    """
    tournament = Tournament.find_active(mongo)
    if not tournament:
        return {"error": "No active tournament"}
    
    # Get or create teams
    teams = Team.find_for_day(mongo, tournament_id, day_index)
    
    if len(teams) == 0:
        if round_number == 1:
            # Create teams for the first round
            result = create_teams_for_day(mongo, tournament_id, day_index)
            if isinstance(result, dict) and "error" in result:
                return result
            teams = result
        else:
            return {"error": f"No teams found for day {day_index + 1}. Generate Round 1 pairings first."}
    
    if len(teams) < 2:
        return {"error": f"Need at least 2 teams to create games. Found {len(teams)} team(s)."}
    
    # Get previous matchups to avoid repeats
    previous_matchups = get_previous_matchups(mongo, tournament_id, day_index)
    
    # Shuffle teams and pair them
    team_list = list(teams)
    random.shuffle(team_list)
    
    pairings = []
    game_number = 1
    used_teams = set()
    
    for i, team1 in enumerate(team_list):
        if team1.team_number in used_teams:
            continue
            
        for team2 in team_list[i+1:]:
            if team2.team_number in used_teams:
                continue
            
            # Check if this matchup already happened
            t1_key = tuple(sorted(team1.player_ids))
            t2_key = tuple(sorted(team2.player_ids))
            matchup_key = (t1_key, t2_key) if t1_key < t2_key else (t2_key, t1_key)
            
            if matchup_key in previous_matchups:
                continue  # Skip - already played
            
            # Create game
            is_power = team1.is_power_team or team2.is_power_team
            
            game = Game({
                "tournament_id": str(tournament_id),
                "date": datetime.utcnow().isoformat(),
                "game_number": game_number,
                "day_index": day_index,
                "round_number": round_number,
                "team1_player_ids": team1.player_ids,
                "team2_player_ids": team2.player_ids,
                "status": "upcoming",
                "is_power_game": is_power
            })
            game.save(mongo)
            
            # Enrich with names
            game_dict = game.to_dict()
            game_dict['team1_player_names'] = [
                mongo.db.users.find_one({"_id": ObjectId(pid)})['name'] + (" ⚡" if team1.is_power_team else "")
                for pid in team1.player_ids
            ]
            game_dict['team2_player_names'] = [
                mongo.db.users.find_one({"_id": ObjectId(pid)})['name'] + (" ⚡" if team2.is_power_team else "")
                for pid in team2.player_ids
            ]
            pairings.append(game_dict)
            
            used_teams.add(team1.team_number)
            used_teams.add(team2.team_number)
            game_number += 1
            break
    
    # Check for unmatched teams (odd number of teams)
    unmatched = [t for t in team_list if t.team_number not in used_teams]
    if unmatched:
        # These teams sit out this round
        pass
    
    return pairings


# Keep backward compatibility
def generate_daily_pairings(mongo, tournament_id):
    """Legacy function - generates Round 1 pairings."""
    tournament = Tournament.find_active(mongo)
    day_index = tournament.current_day_index if tournament else 0
    return generate_round_pairings(mongo, tournament_id, day_index, 1)
