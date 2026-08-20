import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

class ExternalWeatherApiService:
    def __init__(self):
        self.api_key = settings.OPENWEATHER_API_KEY
        self.base_url = settings.OPENWEATHER_BASE_URL

    async def fetch_raw_weather_data(self, english_city: str) -> Optional[Dict[str, Any]]:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(
                    self.base_url,
                    params={
                        "q": english_city,
                        "appid": self.api_key,
                        "units": "metric",
                        "lang": "bn"
                    }
                )
                if response.status_code == 200:
                    return response.json()
        except Exception:
            pass
        return None
