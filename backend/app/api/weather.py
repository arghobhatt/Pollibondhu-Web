from typing import List
from fastapi import APIRouter, Query
from app.services.weather.facade import WeatherFacade
from app.models.domain import WeatherDataDTO

router = APIRouter(prefix="/api/weather", tags=["Weather Service"])
weather_facade = WeatherFacade()

@router.get("", response_model=WeatherDataDTO)
async def get_weather(city: str = Query("ঢাকা", description="City name in Bangla or English")):
    return await weather_facade.get_weather_forecast(city)

@router.get("/locations", response_model=List[str])
def get_supported_locations():
    return list(weather_facade.location_service.location_mapping.keys())
