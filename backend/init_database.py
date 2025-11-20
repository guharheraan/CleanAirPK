import sys
import os
import sqlite3

# Add the backend directory to Python path
sys.path.append(os.path.dirname(__file__))

def init_database():
    print("=== CleanAirPK Database Initialization ===")
    
    # First, let's check if we can create and connect to SQLite directly
    db_path = "cleanairpk.db"
    
    # Remove existing database if it exists
    if os.path.exists(db_path):
        os.remove(db_path)
        print("✓ Removed existing database")
    
    # Test basic SQLite connection
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        print("✓ SQLite connection established")
        
        # Create tables manually first to verify
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL,
                full_name TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_profiles (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                age INTEGER,
                has_chronic_conditions BOOLEAN DEFAULT 0,
                is_smoker BOOLEAN DEFAULT 0,
                daily_outdoor_hours INTEGER DEFAULT 0,
                risk_score INTEGER,
                risk_category TEXT,
                advice TEXT,
                alert_threshold INTEGER DEFAULT 150,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS stations (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                city TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                is_active BOOLEAN DEFAULT 1
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS measurements (
                id TEXT PRIMARY KEY,
                station_id TEXT NOT NULL,
                pm25 REAL,
                pm10 REAL,
                aqi INTEGER,
                measured_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (station_id) REFERENCES stations (id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS forecasts (
                id TEXT PRIMARY KEY,
                station_id TEXT NOT NULL,
                pm25 REAL,
                forecasted_for DATETIME NOT NULL,
                confidence_lower REAL,
                confidence_upper REAL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (station_id) REFERENCES stations (id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS alerts (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                message TEXT NOT NULL,
                aqi_level INTEGER,
                is_read BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        conn.commit()
        print("✓ Database tables created via direct SQL")
        
        # Now let's test with SQLAlchemy
        from app.db.session import engine, Base, SessionLocal
        from app.db.models import User, Station, UserProfile
        from app.services.security import get_password_hash
        import uuid
        
        print("✓ SQLAlchemy imports successful")
        
        # Create tables using SQLAlchemy (this should work now)
        Base.metadata.create_all(bind=engine)
        print("✓ SQLAlchemy tables created")
        
        # Now seed the data
        db = SessionLocal()
        
        try:
            print("Seeding initial data...")
            
            # Create sample user
            user_id = str(uuid.uuid4())
            user = User(
                id=user_id,
                email="demo@cleanairpk.com",
                hashed_password=get_password_hash("demo123"),
                full_name="Demo User"
            )
            db.add(user)
            print("✓ Created demo user")
            
            # Create sample stations
            stations_data = [
                {"name": "Islamabad F-8", "city": "Islamabad", "lat": 33.7001, "lon": 73.0748},
                {"name": "Lahore Liberty", "city": "Lahore", "lat": 31.5204, "lon": 74.3587},
                {"name": "Karachi DHA", "city": "Karachi", "lat": 24.8607, "lon": 67.0011},
            ]
            
            for station_data in stations_data:
                station_id = str(uuid.uuid4())
                station = Station(
                    id=station_id,
                    name=station_data["name"],
                    city=station_data["city"],
                    latitude=station_data["lat"],
                    longitude=station_data["lon"]
                )
                db.add(station)
                print(f"✓ Created station: {station_data['name']}")
            
            db.commit()
            print("✓ Database seeded successfully!")
            
            # Verify the data was inserted
            user_count = db.query(User).count()
            station_count = db.query(Station).count()
            print(f"✓ Verification: {user_count} users, {station_count} stations in database")
            
        except Exception as e:
            print(f"✗ Error during seeding: {e}")
            db.rollback()
            import traceback
            traceback.print_exc()
        finally:
            db.close()
            
        conn.close()
            
    except Exception as e:
        print(f"✗ Critical error: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print("\n🎉 Database initialization completed successfully!")
    print("📧 Demo user: demo@cleanairpk.com / demo123")
    return True

if __name__ == "__main__":
    success = init_database()
    if not success:
        print("\n❌ Database initialization failed!")
        sys.exit(1)