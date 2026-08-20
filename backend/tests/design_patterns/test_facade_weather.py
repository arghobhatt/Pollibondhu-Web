import pytest
import asyncio
from unittest.mock import MagicMock, AsyncMock
from app.services.weather.facade import WeatherFacade
from app.services.weather.location_lookup import LocationLookupService
from app.services.weather.external_api import ExternalWeatherApiService
from app.services.weather.cache_service import WeatherCacheService
from app.services.weather.processor import WeatherProcessorService
from app.models.domain import WeatherDataDTO

def test_facade_cache_hit_bypasses_external_api():
    async def run_test():
        facade = WeatherFacade()
        
        cached_dto = WeatherDataDTO(
            city="ঢাকা",
            temperature_celsius=28.0,
            humidity=75,
            condition_bn="রোদ উজ্জ্বল",
            wind_speed=12.0,
            cached=True
        )

        facade.cache_service.get_cached_weather = MagicMock(return_value=cached_dto)
        facade.api_service.fetch_raw_weather_data = AsyncMock()

        result = await facade.get_weather_forecast("ঢাকা")

        assert result is cached_dto
        assert result.cached is True
        assert result.temperature_celsius == 28.0
        facade.api_service.fetch_raw_weather_data.assert_not_called()

    asyncio.run(run_test())

def test_facade_cache_miss_orchestrates_subsystems():
    async def run_test():
        facade = WeatherFacade()

        facade.cache_service.get_cached_weather = MagicMock(return_value=None)
        facade.cache_service.store_in_cache = MagicMock()

        mock_raw_json = {
            "main": {"temp": 30.0, "humidity": 65},
            "weather": [{"description": "হালকা বৃষ্টি"}],
            "wind": {"speed": 4.5}
        }
        facade.api_service.fetch_raw_weather_data = AsyncMock(return_value=mock_raw_json)

        result = await facade.get_weather_forecast("চট্টগ্রাম")

        assert result.city == "চট্টগ্রাম"
        assert result.temperature_celsius == 30.0
        assert result.humidity == 65
        assert result.condition_bn == "হালকা বৃষ্টি"
        assert result.cached is False

        facade.api_service.fetch_raw_weather_data.assert_called_once_with("Chittagong")
        facade.cache_service.store_in_cache.assert_called_once()

    asyncio.run(run_test())

def test_facade_external_api_failure_graceful_fallback():
    async def run_test():
        facade = WeatherFacade()

        facade.cache_service.get_cached_weather = MagicMock(return_value=None)
        facade.api_service.fetch_raw_weather_data = AsyncMock(return_value=None)

        result = await facade.get_weather_forecast("খুলনা")

        assert result.city == "খুলনা"
        assert result.temperature_celsius == 29.5
        assert result.condition_bn == "হালকা বৃষ্টি ও রোদেলা আবহাওয়া"
        assert result.cached is False

    asyncio.run(run_test())

def test_location_lookup_service_translation():
    service = LocationLookupService()

    assert service.get_english_query("ঢাকা") == "Dhaka"
    assert service.get_english_query("সিলেট") == "Sylhet"
    assert service.get_english_query("রংপুর") == "Rangpur"
    assert service.get_english_query("গাজীপুর") == "গাজীপুর"

def test_weather_processor_service_parsing_and_fallback():
    processor = WeatherProcessorService()

    raw_json = {
        "main": {"temp": 25.0, "humidity": 80},
        "weather": [{"description": "পরিষ্কার আকাশ"}],
        "wind": {"speed": 3.0}
    }

    dto = processor.process_api_response("বরিশাল", raw_json)
    assert dto.city == "বরিশাল"
    assert dto.temperature_celsius == 25.0
    assert dto.humidity == 80
    assert dto.condition_bn == "পরিষ্কার আকাশ"

    fallback_dto = processor.process_api_response("বরিশাল", None)
    assert fallback_dto.city == "বরিশাল"
    assert fallback_dto.temperature_celsius == 29.5
    assert fallback_dto.condition_bn == "হালকা বৃষ্টি ও রোদেলা আবহাওয়া"
