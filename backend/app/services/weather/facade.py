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

    async def get_weather_forecast(self, city: str) -> WeatherDataDTO:
        english_city = self.location_service.get_english_query(city)

        cached_data = self.cache_service.get_cached_weather(english_city)
        if cached_data:
            return cached_data

        raw_json = await self.api_service.fetch_raw_weather_data(english_city)
        weather_dto = self.processor_service.process_api_response(city, raw_json)
        self.cache_service.store_in_cache(english_city, weather_dto)

        return weather_dto
