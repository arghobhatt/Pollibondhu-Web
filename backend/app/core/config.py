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
        return cls._instance

settings = Settings()
