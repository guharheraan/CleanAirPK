from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.db.models import User, UserProfile
from app.api.auth import get_current_user

router = APIRouter()

class UserProfileUpdate(BaseModel):
    age: int = None
    has_chronic_conditions: bool = False
    is_smoker: bool = False
    daily_outdoor_hours: int = 0

@router.get("/profile")
async def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    return {
        "user": {
            "email": current_user.email,
            "full_name": current_user.full_name
        },
        "profile": profile.__dict__ if profile else None
    }

@router.post("/profile")
async def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.services.risk import calculate_risk_score
    
    # Calculate risk score
    risk_data = calculate_risk_score(
        profile_data.age, 
        profile_data.has_chronic_conditions, 
        profile_data.is_smoker, 
        profile_data.daily_outdoor_hours
    )
    
    # Update or create profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if profile:
        profile.age = profile_data.age
        profile.has_chronic_conditions = profile_data.has_chronic_conditions
        profile.is_smoker = profile_data.is_smoker
        profile.daily_outdoor_hours = profile_data.daily_outdoor_hours
        profile.risk_score = risk_data["score"]
        profile.risk_category = risk_data["category"]
        profile.advice = risk_data["advice"]
    else:
        profile = UserProfile(
            user_id=current_user.id,
            age=profile_data.age,
            has_chronic_conditions=profile_data.has_chronic_conditions,
            is_smoker=profile_data.is_smoker,
            daily_outdoor_hours=profile_data.daily_outdoor_hours,
            risk_score=risk_data["score"],
            risk_category=risk_data["category"],
            advice=risk_data["advice"]
        )
        db.add(profile)
    
    db.commit()
    db.refresh(profile)
    
    return {"message": "Profile updated successfully", "risk_assessment": risk_data}