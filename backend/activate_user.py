from app import create_app, mongo
from app.models import User
from bson import ObjectId

app = create_app()

def activate_user(email):
    with app.app_context():
        user_data = mongo.db.users.find_one({"email": email})
        if user_data:
            # Update role and ensure no blocking fields exist
            mongo.db.users.update_one(
                {"email": email},
                {"$set": {"role": "admin", "is_active": True}}
            )
            print(f"✅ User {email} has been activated and promoted to ADMIN.")
        else:
            # Create user if not exists
            user = User({
                "name": "Aaron Wood",
                "email": email,
                "role": "admin"
            })
            user.set_password("password123")
            user.save(mongo)
            print(f"✅ User {email} created as ADMIN with password: password123")

if __name__ == '__main__':
    activate_user('aaronwood.aew@gmail.com')
