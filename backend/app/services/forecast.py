import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

class SimpleForecastModel:
    def __init__(self):
        self.city_baselines = {
            "islamabad": 45,
            "lahore": 180, 
            "karachi": 85,
            "rawalpindi": 55,
            "faisalabad": 120,
        }
    
    def generate_forecast(self, city, hours=48):
        """Generate PM2.5 forecast with daily patterns and trends"""
        base_value = self.city_baselines.get(city.lower(), 75)
        forecasts = []
        
        current_time = datetime.utcnow()
        
        for i in range(hours):
            forecast_time = current_time + timedelta(hours=i)
            hour_of_day = forecast_time.hour
            
            # Daily pattern: higher during day, lower at night
            if 6 <= hour_of_day <= 20:  # Daytime
                multiplier = 1.2
            else:  # Nighttime
                multiplier = 0.8
            
            # Add some trend (slight increase over time)
            trend = 1 + (i * 0.005)  # 0.5% increase per hour
            
            # Random variation
            variation = random.uniform(0.9, 1.1)
            
            # Calculate forecast value
            forecast_value = base_value * multiplier * trend * variation
            forecast_value = max(10, forecast_value)  # Ensure positive
            
            # Confidence intervals
            confidence_lower = forecast_value * 0.8
            confidence_upper = forecast_value * 1.2
            
            forecasts.append({
                "timestamp": forecast_time.isoformat(),
                "pm25": round(forecast_value, 1),
                "confidence_lower": round(confidence_lower, 1),
                "confidence_upper": round(confidence_upper, 1)
            })
        
        return forecasts

# Global forecast model instance
_forecast_model = SimpleForecastModel()

async def get_pm25_forecast(city, hours=48):
    """
    Get PM2.5 forecast for a city
    """
    forecast_data = _forecast_model.generate_forecast(city, hours)
    
    return {
        "city": city,
        "forecast_hours": hours,
        "forecast": forecast_data,
        "generated_at": datetime.utcnow().isoformat()
    }