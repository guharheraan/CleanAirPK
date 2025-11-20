import requests
import os
import random
from datetime import datetime
from app.core.config import settings

async def get_current_aqi(latitude=None, longitude=None, city=None):
    """
    Get current AQI data for Pakistani cities
    Uses OpenAQ API with fallback to realistic sample data for Pakistan
    """
    if settings.USE_SAMPLE_DATA or not settings.OPENA_API_KEY:
        return await get_pakistan_cities_data()
    
    try:
        # Try OpenAQ API for real data
        headers = {"Authorization": f"Bearer {settings.OPENA_API_KEY}"} if settings.OPENA_API_KEY else {}
        
        params = {'country': 'PK', 'parameter': 'pm25', 'limit': 100}
        if city:
            params['city'] = city
        
        response = requests.get(
            "https://api.openaq.org/v2/latest",
            params=params,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            return process_openaq_data(data)
        else:
            raise Exception(f"OpenAQ API error: {response.status_code}")
            
    except Exception as e:
        print(f"External API error: {e}")
        return await get_pakistan_cities_data()

async def get_pakistan_cities_data():
    """
    Realistic sample data for major Pakistani cities based on typical air quality
    """
    pakistan_cities = [
        {
            "station_id": "islamabad-1",
            "station_name": "Islamabad Central",
            "city": "Islamabad",
            "latitude": 33.6844,
            "longitude": 73.0479,
            "pm25": random.randint(35, 85),  # Typically 35-85 in Islamabad
            "aqi": None,  # Will be calculated
            "last_updated": datetime.utcnow().isoformat()
        },
        {
            "station_id": "lahore-1",
            "station_name": "Lahore Air Quality",
            "city": "Lahore", 
            "latitude": 31.5204,
            "longitude": 74.3587,
            "pm25": random.randint(150, 300),  # Lahore often has high pollution
            "aqi": None,
            "last_updated": datetime.utcnow().isoformat()
        },
        {
            "station_id": "karachi-1",
            "station_name": "Karachi Coastal",
            "city": "Karachi",
            "latitude": 24.8607,
            "longitude": 67.0011,
            "pm25": random.randint(80, 180),  # Karachi moderate-high
            "aqi": None,
            "last_updated": datetime.utcnow().isoformat()
        },
        {
            "station_id": "rawalpindi-1",
            "station_name": "Rawalpindi Station",
            "city": "Rawalpindi",
            "latitude": 33.6007,
            "longitude": 73.0679,
            "pm25": random.randint(40, 90),
            "aqi": None,
            "last_updated": datetime.utcnow().isoformat()
        },
        {
            "station_id": "faisalabad-1", 
            "station_name": "Faisalabad Industrial",
            "city": "Faisalabad",
            "latitude": 31.4504,
            "longitude": 73.1350,
            "pm25": random.randint(120, 250),
            "aqi": None,
            "last_updated": datetime.utcnow().isoformat()
        },
        {
            "station_id": "peshawar-1",
            "station_name": "Peshawar City",
            "city": "Peshawar",
            "latitude": 34.0151,
            "longitude": 71.5249,
            "pm25": random.randint(90, 200),
            "aqi": None,
            "last_updated": datetime.utcnow().isoformat()
        },
        {
            "station_id": "quetta-1",
            "station_name": "Quetta Valley",
            "city": "Quetta",
            "latitude": 30.1798,
            "longitude": 66.9750,
            "pm25": random.randint(50, 120),  # Quetta generally better air
            "aqi": None,
            "last_updated": datetime.utcnow().isoformat()
        },
        {
            "station_id": "multan-1",
            "station_name": "Multan City",
            "city": "Multan",
            "latitude": 30.1575,
            "longitude": 71.5249,
            "pm25": random.randint(100, 220),
            "aqi": None,
            "last_updated": datetime.utcnow().isoformat()
        },
        {
            "station_id": "gujranwala-1",
            "station_name": "Gujranwala Station",
            "city": "Gujranwala",
            "latitude": 32.1877,
            "longitude": 74.1945,
            "pm25": random.randint(110, 240),
            "aqi": None,
            "last_updated": datetime.utcnow().isoformat()
        },
        {
            "station_id": "sialkot-1",
            "station_name": "Sialkot City",
            "city": "Sialkot",
            "latitude": 32.4945,
            "longitude": 74.5229,
            "pm25": random.randint(80, 170),
            "aqi": None,
            "last_updated": datetime.utcnow().isoformat()
        }
    ]
    
    # Calculate AQI for each city
    for city_data in pakistan_cities:
        city_data["aqi"] = calculate_aqi_from_pm25(city_data["pm25"])
    
    return {"data": pakistan_cities, "source": "pakistan_cities_sample"}

def process_openaq_data(data):
    """Process OpenAQ API response for Pakistani cities"""
    processed = []
    for result in data.get('results', []):
        measurements = result.get('measurements', [])
        pm25 = next((m for m in measurements if m['parameter'] == 'pm25'), None)
        
        if pm25:
            processed.append({
                "station_id": result['location'],
                "station_name": result['location'],
                "city": result.get('city', 'Unknown'),
                "latitude": result['coordinates']['latitude'],
                "longitude": result['coordinates']['longitude'],
                "pm25": pm25['value'],
                "aqi": calculate_aqi_from_pm25(pm25['value']),
                "last_updated": result['lastUpdated']
            })
    
    return {"data": processed, "source": "openaq"}

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