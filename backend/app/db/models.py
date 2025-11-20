from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    alerts = relationship("Alert", back_populates="user")

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    age = Column(Integer)
    has_chronic_conditions = Column(Boolean, default=False)
    is_smoker = Column(Boolean, default=False)
    daily_outdoor_hours = Column(Integer, default=0)
    risk_score = Column(Integer)
    risk_category = Column(String)
    advice = Column(Text)
    alert_threshold = Column(Integer, default=150)  # AQI threshold
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="profile")

class Station(Base):
    __tablename__ = "stations"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    city = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    
    measurements = relationship("Measurement", back_populates="station")
    forecasts = relationship("Forecast", back_populates="station")

class Measurement(Base):
    __tablename__ = "measurements"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    station_id = Column(String, ForeignKey("stations.id"), nullable=False)
    pm25 = Column(Float)
    pm10 = Column(Float)
    aqi = Column(Integer)
    measured_at = Column(DateTime, default=datetime.utcnow)
    
    station = relationship("Station", back_populates="measurements")

class Forecast(Base):
    __tablename__ = "forecasts"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    station_id = Column(String, ForeignKey("stations.id"), nullable=False)
    pm25 = Column(Float)
    forecasted_for = Column(DateTime, nullable=False)
    confidence_lower = Column(Float)
    confidence_upper = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    station = relationship("Station", back_populates="forecasts")

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    message = Column(String, nullable=False)
    aqi_level = Column(Integer)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="alerts")