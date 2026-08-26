from typing import List, Optional
from fastapi import APIRouter, Query
from app.services.weather.facade import WeatherFacade
from app.models.domain import WeatherDataDTO

router = APIRouter(prefix="/api/weather", tags=["Weather Service"])
weather_facade = WeatherFacade()

@router.get("", response_model=WeatherDataDTO)
async def get_weather(
    city: Optional[str] = Query(None, description="City name in Bangla or English"),
    lat: Optional[float] = Query(None, description="Latitude coordinate"),
    lon: Optional[float] = Query(None, description="Longitude coordinate")
):
    return await weather_facade.get_weather_forecast(city=city, lat=lat, lon=lon)

@router.get("/locations", response_model=List[str])
def get_supported_locations():
    return list(weather_facade.location_service.location_mapping.keys())
