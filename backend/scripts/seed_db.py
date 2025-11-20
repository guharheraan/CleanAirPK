import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.db.session import SessionLocal
from app.db.models import User, Station
from app.services.security import get_password_hash

def seed_database():
    db = SessionLocal()
    
    try:
        print("Starting database seeding...")
        
        # Create sample user
        user = db.query(User).filter(User.email == "demo@cleanairpk.com").first()
        if not user:
            user = User(
                email="demo@cleanairpk.com",
                hashed_password=get_password_hash("demo123"),
                full_name="Demo User"
            )
            db.add(user)
            print("Created demo user")
        else:
            print("Demo user already exists")
        
        # Create sample stations
        stations_data = [
            {"name": "Islamabad F-8", "city": "Islamabad", "lat": 33.7001, "lon": 73.0748},
            {"name": "Lahore Liberty", "city": "Lahore", "lat": 31.5204, "lon": 74.3587},
            {"name": "Karachi DHA", "city": "Karachi", "lat": 24.8607, "lon": 67.0011},
        ]
        
        for station_data in stations_data:
            station = db.query(Station).filter(Station.name == station_data["name"]).first()
            if not station:
                station = Station(
                    name=station_data["name"],
                    city=station_data["city"],
                    latitude=station_data["lat"],
                    longitude=station_data["lon"]
                )
                db.add(station)
                print(f"Created station: {station_data['name']}")
        
        db.commit()
        print("Database seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()