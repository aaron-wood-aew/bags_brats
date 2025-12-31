from app import create_app, mongo, bcrypt
from app.models import User
import string

app = create_app()

def seed_players():
    with app.app_context():
        # Letters A to X (24 players)
        letters = string.ascii_lowercase[:24]
        
        count = 0
        for char in letters:
            email = f"{char}@{char}.com"
            # Check if exists
            if not mongo.db.users.find_one({"email": email}):
                user_data = {
                    "name": char,
                    "email": email,
                    "phone": "1231231234",
                    "role": "player",
                    "is_proxy": False
                }
                user = User(user_data)
                user.set_password(char) # Password matches the letter
                user.save(mongo)
                count += 1
        
        print(f"✅ Successfully seeded {count} test players.")

if __name__ == '__main__':
    seed_players()
