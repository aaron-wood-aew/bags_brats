from bson import ObjectId
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class BaseModel:
    collection_name = None

    def __init__(self, data=None):
        self._id = data.get('_id') if data else None
        self.created_at = data.get('created_at', datetime.utcnow()) if data else datetime.utcnow()

    def to_dict(self):
        data = self.__dict__.copy()
        if data.get('_id'):
            data['_id'] = str(data['_id'])
        return data

class User(BaseModel):
    collection_name = 'users'

    def __init__(self, data=None):
        super().__init__(data)
        data = data or {}
        self.name = data.get('name')
        self.email = data.get('email')
        self.phone = data.get('phone')
        self.password_hash = data.get('password_hash')
        self.google_id = data.get('google_id')
        self.role = data.get('role', 'player') # 'admin' or 'player'
        self.is_proxy = data.get('is_proxy', False) # Created by admin, no device
        self.checked_in = data.get('checked_in', False)
        self.checked_in_at = data.get('checked_in_at')
        self.is_power_player = data.get('is_power_player', False)
        self.power_player_used = data.get('power_player_used', False)  # Reset when all power players used
        self.has_paid = data.get('has_paid', False)  # Entry fee paid for current tournament

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @classmethod
    def find_by_email(cls, mongo, email):
        data = mongo.db.users.find_one({"email": email})
        return cls(data) if data else None

    @classmethod
    def find_by_id(cls, mongo, user_id):
        data = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        return cls(data) if data else None

    @classmethod
    def find_by_google_id(cls, mongo, google_id):
        data = mongo.db.users.find_one({"google_id": google_id})
        return cls(data) if data else None

    def save(self, mongo):
        data = self.to_dict()
        if data.get('_id'):
            _id = ObjectId(data.pop('_id'))
            mongo.db.users.update_one({'_id': _id}, {'$set': data})
            return _id
        else:
            data.pop('_id', None)
            res = mongo.db.users.insert_one(data)
            self._id = res.inserted_id
            return res.inserted_id

class Tournament(BaseModel):
    collection_name = 'tournaments'

    def __init__(self, data=None):
        super().__init__(data)
        data = data or {}
        self.name = data.get('name')
        self.dates = data.get('dates', []) # List of ISO date strings
        self.status = data.get('status', 'upcoming')
        self.current_day_index = data.get('current_day_index', 0)
        self.current_round = data.get('current_round', 0)  # 0 = no rounds started
        self.rounds_per_day = data.get('rounds_per_day', 3)  # Number of rounds per day
        self.start_times = data.get('start_times', []) # List of ISO time strings for each date

    @classmethod
    def find_active(cls, mongo):
        data = mongo.db.tournaments.find_one({"status": {"$in": ["upcoming", "active", "blackout"]}})
        return cls(data) if data else None

    def save(self, mongo):
        data = self.to_dict()
        if data.get('_id'):
            _id = ObjectId(data.pop('_id'))
            mongo.db.tournaments.update_one({'_id': _id}, {'$set': data})
            return _id
        else:
            data.pop('_id', None)
            res = mongo.db.tournaments.insert_one(data)
            self._id = res.inserted_id
            return res.inserted_id

class Game(BaseModel):
    collection_name = 'games'

    def __init__(self, data=None):
        super().__init__(data)
        data = data or {}
        self.tournament_id = data.get('tournament_id')
        self.date = data.get('date')
        self.game_number = data.get('game_number')
        self.court = data.get('court')
        self.team1_player_ids = data.get('team1_player_ids', [])
        self.team2_player_ids = data.get('team2_player_ids', [])
        self.score1 = data.get('score1', 0)
        self.score2 = data.get('score2', 0)
        self.status = data.get('status', 'upcoming')
        self.start_time = data.get('start_time')
        self.end_time = data.get('end_time')
        self.submitted_by = data.get('submitted_by')
        self.is_power_game = data.get('is_power_game', False)  # True if 1v2 game
        self.day_index = data.get('day_index', 0)  # Which tournament day (0-indexed)
        self.round_number = data.get('round_number', 1)  # Which round (1-indexed)

    def save(self, mongo):
        data = self.to_dict()
        if data.get('_id'):
            _id = ObjectId(data.pop('_id'))
            mongo.db.games.update_one({'_id': _id}, {'$set': data})
            return _id
        else:
            data.pop('_id', None)
            res = mongo.db.games.insert_one(data)
            self._id = res.inserted_id
            return res.inserted_id


class Team(BaseModel):
    """Persistent daily teams - teams stay the same for all rounds in a day."""
    collection_name = 'teams'

    def __init__(self, data=None):
        super().__init__(data)
        data = data or {}
        self.tournament_id = data.get('tournament_id')
        self.day_index = data.get('day_index', 0)
        self.player_ids = data.get('player_ids', [])  # 2 players for normal, 1 for power
        self.is_power_team = data.get('is_power_team', False)
        self.team_number = data.get('team_number')  # For display: Team 1, Team 2, etc.

    @classmethod
    def find_for_day(cls, mongo, tournament_id, day_index):
        teams = list(mongo.db.teams.find({
            'tournament_id': str(tournament_id),
            'day_index': day_index
        }))
        return [cls(t) for t in teams]

    @classmethod
    def delete_for_day(cls, mongo, tournament_id, day_index):
        mongo.db.teams.delete_many({
            'tournament_id': str(tournament_id),
            'day_index': day_index
        })

    def save(self, mongo):
        data = self.to_dict()
        if data.get('_id'):
            _id = ObjectId(data.pop('_id'))
            mongo.db.teams.update_one({'_id': _id}, {'$set': data})
            return _id
        else:
            data.pop('_id', None)
            res = mongo.db.teams.insert_one(data)
            self._id = res.inserted_id
            return res.inserted_id
