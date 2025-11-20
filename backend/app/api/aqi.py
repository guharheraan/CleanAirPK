from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random

from app.db.session import get_db
from app.db.models import Station, Measurement
from app.services.external_apis import get_current_aqi

router = APIRouter()

@router.get("/current")
async def get_current_aqi_data(
    latitude: float = None,
    longitude: float = None,
    city: str = None,
    db: Session = Depends(get_db)
):
    try:
        # Try to get real-time data from external API
        aqi_data = await get_current_aqi(latitude, longitude, city)
        return aqi_data
    except Exception as e:
        # Fallback to sample data from database
        return await get_sample_aqi_data(db)

@router.get("/stations")
async def get_stations(db: Session = Depends(get_db)):
    stations = db.query(Station).filter(Station.is_active == True).all()
    return {"stations": stations}

@router.get("/historical/{station_id}")
async def get_historical_data(station_id: str, days: int = 7, db: Session = Depends(get_db)):
    # For now, return sample historical data
    # In a real app, this would query the measurements table
    return generate_sample_historical_data(station_id, days)

async def get_sample_aqi_data(db: Session):
    """Generate sample AQI data for demonstration"""
    stations = db.query(Station).filter(Station.is_active == True).all()
    
    sample_data = []
    for station in stations:
        # Generate realistic sample data based on city
        base_pm25 = {
            "Islamabad": random.uniform(30, 80),
            "Lahore": random.uniform(150, 300),
            "Karachi": random.uniform(80, 180),
        }.get(station.city, random.uniform(50, 150))
        
        pm25 = max(10, base_pm25 + random.uniform(-20, 20))
        aqi = calculate_aqi_from_pm25(pm25)
        
        sample_data.append({
            "station_id": station.id,
            "station_name": station.name,
            "city": station.city,
            "latitude": station.latitude,
            "longitude": station.longitude,
            "pm25": round(pm25, 1),
            "aqi": aqi,
            "last_updated": datetime.utcnow().isoformat()
        })
    
    return {"data": sample_data, "source": "sample_data"}

def generate_sample_historical_data(station_id: str, days: int):
    """Generate sample historical data for charts"""
    data = []
    base_time = datetime.utcnow() - timedelta(days=days)
    
    # Base values for different cities
    base_values = {
        "sample-1": 45,  # Islamabad
        "sample-2": 180, # Lahore  
        "sample-3": 85,  # Karachi
    }
    
    base_pm25 = base_values.get(station_id, 75)
    
    for i in range(days * 24):  # Hourly data for requested days
        timestamp = base_time + timedelta(hours=i)
        # Add daily pattern and random variation
        hour = timestamp.hour
        if 6 <= hour <= 20:  # Daytime - higher pollution
            multiplier = 1.2
        else:  # Nighttime - lower pollution
            multiplier = 0.8
            
        pm25 = base_pm25 * multiplier * (1 + random.uniform(-0.1, 0.1))
        
        data.append({
            "timestamp": timestamp.isoformat(),
            "pm25": round(pm25, 1),
            "aqi": calculate_aqi_from_pm25(pm25)
        })
    
    return {
        "station_id": station_id,
        "data": data
    }

def calculate_aqi_from_pm25(pm25):
    """Convert PM2.5 concentration to AQI"""
    if pm25 <= 12:
        return int((pm25 / 12) * 50)
    elif pm25 <= 35.4:
        return int(((pm25 - 12.1) / (35.4 - 12.1)) * 50 + 51)
    elif pm25 <= 55.4:
        return int(((pm25 - 35.5) / (55.4 - 35.5)) * 50 + 101)
    elif pm25 <= 150.4:
        return int(((pm25 - 55.5) / (150.4 - 55.5)) * 100 + 151)
    elif pm25 <= 250.4:
        return int(((pm25 - 150.5) / (250.4 - 150.5)) * 100 + 201)
    else:
        return int(((pm25 - 250.5) / (350.4 - 250.5)) * 100 + 301)