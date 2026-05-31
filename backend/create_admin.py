from app import create_app, mongo
from app.models import User

app = create_app()

def create_admin(email, password):
    with app.app_context():
        user = User.find_by_email(mongo, email)
        if user:
            user.role = 'admin'
            user.save(mongo)
            print(f"✅ User {email} already exists and has been upgraded to ADMIN.")
        else:
            new_user = User({
                "name": "Tournament Admin",
                "email": email,
                "role": "admin",
                "is_proxy": False,
                "is_power_player": False,
                "checked_in": False
            })
            new_user.set_password(password)
            new_user.save(mongo)
            print(f"✅ New Admin User created successfully!")
            print(f"   Email: {email}")
            print(f"   Password: {password}")

if __name__ == '__main__':
    create_admin('admin@example.com', 'bags2026')
