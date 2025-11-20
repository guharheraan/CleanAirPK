from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.forecast import get_pm25_forecast

router = APIRouter()

@router.get("/")
async def get_forecast(
    city: str,
    hours: int = 48,
    db: Session = Depends(get_db)
):
    if hours > 168:  # Limit to one week
        raise HTTPException(status_code=400, detail="Hours cannot exceed 168 (1 week)")
    
    if not city:
        raise HTTPException(status_code=400, detail="City parameter is required")
    
    try:
        forecast_data = await get_pm25_forecast(city, hours)
        return forecast_data
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Forecast generation failed: {str(e)}"
        )