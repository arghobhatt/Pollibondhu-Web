import pytest
import asyncio
from datetime import datetime, timedelta, timezone
from unittest.mock import patch, MagicMock, AsyncMock
from app.services.weather.cache_service import WeatherCacheService
from app.services.weather.external_api import ExternalWeatherApiService
from app.models.domain import WeatherDataDTO

def test_cache_service_clear_cache_and_ttl_expiration():
    cache_service = WeatherCacheService()
    
    dto = WeatherDataDTO(
        city="সিলেট",
        temperature_celsius=26.0,
        humidity=80,
        condition_bn="মেঘলা",
        wind_speed=9.0,
        cached=False
    )

    expired_timestamp = datetime.now(timezone.utc) - timedelta(minutes=20)
    cache_service._cache["Sylhet"] = (dto, expired_timestamp)

    expired_result = cache_service.get_cached_weather("Sylhet")
    assert expired_result is None

    valid_dto = WeatherDataDTO(
        city="ঢাকা",
        temperature_celsius=29.0,
        humidity=70,
        condition_bn="রোদ",
        wind_speed=10.0,
        cached=False
    )
    cache_service.store_in_cache("Dhaka", valid_dto)
    assert len(cache_service._cache) == 2

    valid_result = cache_service.get_cached_weather("Dhaka")
    assert valid_result is not None
    assert valid_result.city == "ঢাকা"
    assert valid_result.cached is True

def test_external_weather_api_http_error_and_exception_handling():
    async def run_test():
        api_service = ExternalWeatherApiService()

        mock_response_404 = MagicMock()
        mock_response_404.status_code = 404

        with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
            mock_get.return_value = mock_response_404
            res_404 = await api_service.fetch_raw_weather_data("UnknownCity")
            assert res_404 is None

        with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
            mock_get.side_effect = RuntimeError("Network Connection Failed")
            res_err = await api_service.fetch_raw_weather_data("Dhaka")
            assert res_err is None

    asyncio.run(run_test())
