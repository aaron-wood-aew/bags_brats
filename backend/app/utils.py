import random
from datetime import datetime, timedelta
from app.models import Game, User, Tournament
from bson import ObjectId

def get_pairing_weights(mongo, player_ids):
    # Weights based on how many times players have been paired together
    # This is a simplified version; in a real app, we'd query the 'teams' collection
    weights = {}
    for p1 in player_ids:
        for p2 in player_ids:
            if p1 == p2: continue
            pair = tuple(sorted([str(p1), str(p2)]))
            # Mock weight lookup - replace with actual DB query in production
            # weights[pair] = mongo.db.teams.count_documents({"player_ids": {"$all": [ObjectId(p1), ObjectId(p2)]}})
            weights[pair] = 0 
    return weights

def generate_daily_pairings(mongo, tournament_id):
    # 1. Get checked-in players
    players = list(mongo.db.users.find({"checked_in": True}))
    if len(players) < 4:
        return {"error": "Not enough players checked in (min 4)"}
    
    # Needs to be multiple of 4 for even teams/games
    # If not, some might sit out (future logic)
    player_ids = [str(p['_id']) for p in players]
    random.shuffle(player_ids)
    
    pairings = []
    # Simplified pairing for now: just random
    # TODO: Add weighting logic to avoid repeat pairings
    while len(player_ids) >= 4:
        p1, p2 = player_ids.pop(), player_ids.pop()
        p3, p4 = player_ids.pop(), player_ids.pop()
        
        # Create a game for this court
        game = Game({
            "tournament_id": tournament_id,
            "date": datetime.utcnow().isoformat(),
            "game_number": 1,
            "team1_player_ids": [p1, p2],
            "team2_player_ids": [p3, p4],
            "status": "upcoming"
        })
        game.save(mongo)
        game_dict = game.to_dict()
        game_dict['team1_player_names'] = [mongo.db.users.find_one({"_id": ObjectId(pid)})['name'] for pid in [p1, p2]]
        game_dict['team2_player_names'] = [mongo.db.users.find_one({"_id": ObjectId(pid)})['name'] for pid in [p3, p4]]
        
        pairings.append(game_dict)
        
    return pairings
