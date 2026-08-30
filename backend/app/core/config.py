import os

class Settings:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Settings, cls).__new__(cls)
            cls._instance.APP_NAME = "Pollibondhu Integrated Service Platform"
            cls._instance.VERSION = "1.0.0"
            cls._instance.OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "mock_key_pollibondhu_2026")
            cls._instance.OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather"
            cls._instance.DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pollibondhu.db")
            cls._instance.JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "pollibondhu_jwt_secret_key_super_secure_2026")
            cls._instance.JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
            cls._instance.JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
            cls._instance.ALLOWED_CORS_ORIGINS = os.getenv("ALLOWED_CORS_ORIGINS", "*").split(",")
        return cls._instance

settings = Settings()
