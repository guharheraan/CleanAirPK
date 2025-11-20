import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cleanairpk.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # External APIs
    OPENA_API_KEY: str = os.getenv("OPENA_API_KEY", "")
    IQAIR_API_KEY: str = os.getenv("IQAIR_API_KEY", "")
    USE_SAMPLE_DATA: bool = os.getenv("USE_SAMPLE_DATA", "false").lower() == "true"

settings = Settings()