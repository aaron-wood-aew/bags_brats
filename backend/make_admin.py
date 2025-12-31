from app import create_app, mongo
from app.models import User

app = create_app()

def make_admin(email):
    with app.app_context():
        user = User.find_by_email(mongo, email)
        if user:
            user.role = 'admin'
            user.save(mongo)
            print(f"✅ User {email} is now an ADMIN.")
        else:
            print(f"❌ User with email {email} not found.")

if __name__ == '__main__':
    make_admin('aaronwood.aew@gmail.com')
