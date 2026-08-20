from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, Tuple
from app.models.domain import WeatherDataDTO

class WeatherCacheService:
    def __init__(self, ttl_minutes: int = 15):
        self._cache: Dict[str, Tuple[WeatherDataDTO, datetime]] = {}
        self.ttl_minutes = ttl_minutes

    def get_cached_weather(self, city_key: str) -> Optional[WeatherDataDTO]:
        if city_key in self._cache:
            data, timestamp = self._cache[city_key]
            now = datetime.now(timezone.utc)
            if (now - timestamp) < timedelta(minutes=self.ttl_minutes):
                cached_copy = data.model_copy()
                cached_copy.cached = True
                return cached_copy
        return None

    def store_in_cache(self, city_key: str, data: WeatherDataDTO) -> None:
        now = datetime.now(timezone.utc)
        self._cache[city_key] = (data, now)

    def clear_cache(self) -> None:
        self._cache.clear()
