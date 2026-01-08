from app import create_app, mongo, bcrypt
from app.models import User
import string

app = create_app()

# Realistic first/last name pairs for A-X (24 players)
SEED_NAMES = {
    'a': 'Alice Anderson',
    'b': 'Bob Baker',
    'c': 'Carol Carter',
    'd': 'David Davis',
    'e': 'Emma Edwards',
    'f': 'Frank Foster',
    'g': 'Grace Garcia',
    'h': 'Henry Harris',
    'i': 'Iris Ingram',
    'j': 'Jack Johnson',
    'k': 'Karen King',
    'l': 'Leo Lewis',
    'm': 'Maria Martinez',
    'n': 'Noah Nelson',
    'o': 'Olivia Owens',
    'p': 'Paul Parker',
    'q': 'Quinn Quigley',
    'r': 'Rachel Roberts',
    's': 'Sam Smith',
    't': 'Tina Taylor',
    'u': 'Uma Underwood',
    'v': 'Victor Valdez',
    'w': 'Wendy Wilson',
    'x': 'Xavier Xu'
}

# Designate some as Power Players (every 5th-ish player)
POWER_PLAYERS = ['e', 'j', 'o', 't']  # Emma, Jack, Olivia, Tina

def seed_players():
    with app.app_context():
        letters = string.ascii_lowercase[:24]
        
        count = 0
        power_count = 0
        for char in letters:
            email = f"{char}@{char}.com"
            # Check if exists
            if not mongo.db.users.find_one({"email": email}):
                is_power = char in POWER_PLAYERS
                user_data = {
                    "name": SEED_NAMES[char],
                    "email": email,
                    "phone": "1231231234",
                    "role": "player",
                    "is_proxy": False,
                    "is_power_player": is_power,
                    "power_player_used": False
                }
                user = User(user_data)
                user.set_password(char)  # Password matches the letter
                user.save(mongo)
                count += 1
                if is_power:
                    power_count += 1
        
        print(f"✅ Successfully seeded {count} test players.")
        print(f"⚡ Power Players ({power_count}): {', '.join([SEED_NAMES[c] for c in POWER_PLAYERS])}")

if __name__ == '__main__':
    seed_players()

