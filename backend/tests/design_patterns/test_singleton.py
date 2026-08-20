import pytest
import asyncio
import threading
from unittest.mock import patch, MagicMock, AsyncMock
from app.services.weather_client import WeatherApiClient
from app.core.config import Settings, settings

def test_singleton_same_instance_identity():
    client1 = WeatherApiClient()
    client2 = WeatherApiClient()
    assert client1 is client2
    assert id(client1) == id(client2)

    s1 = Settings()
    s2 = Settings()
    assert s1 is s2
    assert s1 is settings

def test_singleton_initialization_once_guard():
    client = WeatherApiClient()
    client._cache["TEST_KEY"] = "MOCK_DATA"

    client_again = WeatherApiClient()
    assert client_again._cache.get("TEST_KEY") == "MOCK_DATA"

def test_singleton_thread_safety_concurrency():
    instances = []

    def get_instance():
        inst = WeatherApiClient()
        instances.append(inst)

    threads = [threading.Thread(target=get_instance) for _ in range(25)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    first_instance = instances[0]
    for inst in instances:
        assert inst is first_instance

def test_singleton_shared_state_with_mocked_network():
    async def run_test():
        client1 = WeatherApiClient()
        client2 = WeatherApiClient()

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "main": {"temp": 28.5, "humidity": 70},
            "weather": [{"description": "মেঘলা"}],
            "wind": {"speed": 10.0}
        }

        with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
            mock_get.return_value = mock_response

            res1 = await client1.fetch_weather("সিলেট")
            assert res1.city == "সিলেট"
            assert res1.temperature_celsius == 28.5
            assert res1.humidity == 70
            assert res1.condition_bn == "মেঘলা"
            assert res1.cached is False
            assert mock_get.call_count == 1

            res2 = await client1.fetch_weather("সিলেট")
            assert res2.city == "সিলেট"
            assert res2.cached is True
            assert mock_get.call_count == 1

    asyncio.run(run_test())

def test_singleton_fetch_weather_http_200_parsing():
    async def run_test():
        client = WeatherApiClient()
        
        mock_res = MagicMock()
        mock_res.status_code = 200
        mock_res.json.return_value = {
            "main": {"temp": 31.2, "humidity": 65},
            "weather": [{"description": "পরিষ্কার আকাশ"}],
            "wind": {"speed": 5.4}
        }

        with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
            mock_get.return_value = mock_res
            result = await client.fetch_weather("রংপুর")
            
            assert result.city == "রংপুর"
            assert result.temperature_celsius == 31.2
            assert result.humidity == 65
            assert result.condition_bn == "পরিষ্কার আকাশ"
            assert result.wind_speed == 5.4
            assert result.cached is False

    asyncio.run(run_test())
