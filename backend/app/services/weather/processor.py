from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.models.domain import WeatherDataDTO

class WeatherProcessorService:
    def process_api_response(
        self, city: str, raw_json: Optional[Dict[str, Any]]
    ) -> WeatherDataDTO:
        now = datetime.now(timezone.utc)
        
        if raw_json and "main" in raw_json and "weather" in raw_json:
            return WeatherDataDTO(
                city=city,
                temperature_celsius=float(raw_json["main"].get("temp", 28.0)),
                humidity=int(raw_json["main"].get("humidity", 75)),
                condition_bn=str(raw_json["weather"][0].get("description", "আংশিক মেঘলা")),
                wind_speed=float(raw_json.get("wind", {}).get("speed", 10.0)),
                cached=False,
                fetched_at=now
            )

        return WeatherDataDTO(
            city=city,
            temperature_celsius=29.5,
            humidity=78,
            condition_bn="হালকা বৃষ্টি ও রোদেলা আবহাওয়া",
            wind_speed=12.4,
            cached=False,
            fetched_at=now
        )
