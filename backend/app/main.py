from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.core.config import settings

app = FastAPI(
    title="CleanAirPK API",
    description="Air Quality Monitoring Backend",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
from app.api import auth, users, aqi, forecast, alerts
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(aqi.router, prefix="/api/aqi", tags=["air-quality"])
app.include_router(forecast.router, prefix="/api/forecast", tags=["forecast"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])

@app.get("/")
async def root():
    return {"message": "CleanAirPK API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)