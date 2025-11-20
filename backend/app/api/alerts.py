from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from pydantic import BaseModel

from app.db.session import get_db
from app.db.models import User, UserProfile, Alert
from app.api.auth import get_current_user

router = APIRouter()

class ThresholdUpdate(BaseModel):
    threshold: int

@router.get("/")
async def get_user_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alerts = db.query(Alert).filter(
        Alert.user_id == current_user.id
    ).order_by(Alert.created_at.desc()).limit(50).all()
    
    return {"alerts": alerts}

@router.post("/threshold")
async def set_alert_threshold(
    threshold_data: ThresholdUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    threshold = threshold_data.threshold
    
    if threshold < 0 or threshold > 500:
        raise HTTPException(status_code=400, detail="Threshold must be between 0 and 500")
    
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        # Create profile if it doesn't exist
        profile = UserProfile(
            user_id=current_user.id,
            alert_threshold=threshold
        )
        db.add(profile)
    else:
        profile.alert_threshold = threshold
    
    db.commit()
    
    # Create an alert about the threshold change
    alert = Alert(
        user_id=current_user.id,
        message=f"Alert threshold set to {threshold} AQI. You'll receive notifications when AQI exceeds this level.",
        aqi_level=threshold
    )
    db.add(alert)
    db.commit()
    
    return {"message": f"Alert threshold set to {threshold} AQI"}

@router.post("/check")
async def check_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check current AQI against user's threshold and create alerts if needed
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile or not profile.alert_threshold:
        return {"alerts_created": 0, "message": "No alert threshold set"}
    
    # Get current AQI data
    from app.services.external_apis import get_pakistan_cities_data
    aqi_data = await get_pakistan_cities_data()
    
    alerts_created = 0
    threshold = profile.alert_threshold
    
    for city_data in aqi_data["data"]:
        if city_data["aqi"] > threshold:
            # Check if we already have a recent alert for this city (last 6 hours)
            recent_alert = db.query(Alert).filter(
                Alert.user_id == current_user.id,
                Alert.message.like(f"%{city_data['city']}%"),
                Alert.created_at >= datetime.utcnow() - timedelta(hours=6)
            ).first()
            
            if not recent_alert:
                alert = Alert(
                    user_id=current_user.id,
                    message=f"🚨 High AQI Alert for {city_data['city']}: {city_data['aqi']} AQI (Your threshold: {threshold})",
                    aqi_level=city_data["aqi"]
                )
                db.add(alert)
                alerts_created += 1
    
    db.commit()
    
    return {
        "alerts_created": alerts_created, 
        "message": f"Created {alerts_created} new alert(s)" if alerts_created > 0 else "No new alerts"
    }

@router.post("/mark-read/{alert_id}")
async def mark_alert_read(
    alert_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == current_user.id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.is_read = True
    db.commit()
    
    return {"message": "Alert marked as read"}

@router.post("/mark-all-read")
async def mark_all_alerts_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(Alert).filter(
        Alert.user_id == current_user.id,
        Alert.is_read == False
    ).update({"is_read": True})
    
    db.commit()
    
    return {"message": "All alerts marked as read"}