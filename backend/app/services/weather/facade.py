from typing import Optional
from app.services.weather.location_lookup import LocationLookupService
from app.services.weather.external_api import ExternalWeatherApiService
from app.services.weather.cache_service import WeatherCacheService
from app.services.weather.processor import WeatherProcessorService
from app.models.domain import WeatherDataDTO

class WeatherFacade:
    def __init__(self):
        self.location_service = LocationLookupService()
        self.api_service = ExternalWeatherApiService()
        self.cache_service = WeatherCacheService(ttl_minutes=15)
        self.processor_service = WeatherProcessorService()

    def estimate_district_from_coords(self, lat: float, lon: float) -> str:
        if lat >= 24.5 and lon >= 91.5:
            return 'সিলেট'
        if lat >= 24.0 and lon >= 88.5 and lon <= 89.5:
            return 'রাজশাহী'
        if lat >= 25.5:
            return 'রংপুর'
        if lat <= 22.8 and lon >= 91.5:
            return 'চট্টগ্রাম'
        if lat <= 23.0 and lon <= 90.5:
            return 'বরিশাল'
        if lat >= 22.5 and lat <= 23.8 and lon >= 89.0 and lon <= 90.0:
            return 'খুলনা'
        if lat >= 24.5 and lon >= 90.0 and lon <= 90.8:
            return 'ময়মনসিংহ'
        return 'ঢাকা'

    async def get_weather_forecast(
        self,
        city: Optional[str] = None,
        lat: Optional[float] = None,
        lon: Optional[float] = None
    ) -> WeatherDataDTO:
        target_city = city or 'ঢাকা'
        if lat is not None and lon is not None:
            target_city = self.estimate_district_from_coords(lat, lon)

        english_city = self.location_service.get_english_query(target_city)

        cached_data = self.cache_service.get_cached_weather(english_city)
        if cached_data:
            return cached_data

        raw_json = await self.api_service.fetch_raw_weather_data(english_city)
        weather_dto = self.processor_service.process_api_response(target_city, raw_json)
        self.cache_service.store_in_cache(english_city, weather_dto)

        return weather_dto
