from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.models.domain import WeatherDataDTO, ForecastItemDTO

class WeatherProcessorService:
    def process_api_response(
        self, city: str, raw_json: Optional[Dict[str, Any]]
    ) -> WeatherDataDTO:
        now = datetime.now(timezone.utc)
        
        forecast_list = [
            ForecastItemDTO(day="আগামীকাল", temperature_celsius=30.0, condition_bn="রোদেলা", icon_symbol="☀️"),
            ForecastItemDTO(day="পরশু", temperature_celsius=28.5, condition_bn="আংশিক মেঘলা", icon_symbol="⛅"),
            ForecastItemDTO(day="৩য় দিন", temperature_celsius=29.0, condition_bn="হালকা বৃষ্টি", icon_symbol="🌧️")
        ]

        if raw_json and "main" in raw_json and "weather" in raw_json:
            return WeatherDataDTO(
                city=city,
                temperature_celsius=float(raw_json["main"].get("temp", 28.0)),
                humidity=int(raw_json["main"].get("humidity", 75)),
                condition_bn=str(raw_json["weather"][0].get("description", "আংশিক মেঘলা")),
                wind_speed=float(raw_json.get("wind", {}).get("speed", 10.0)),
                cached=False,
                fetched_at=now,
                forecast=forecast_list
            )

        return WeatherDataDTO(
            city=city,
            temperature_celsius=29.5,
            humidity=78,
            condition_bn="হালকা বৃষ্টি ও রোদেলা আবহাওয়া",
            wind_speed=12.4,
            cached=False,
            fetched_at=now,
            forecast=forecast_list
        )
