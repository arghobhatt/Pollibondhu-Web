from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class TransportScheduleDTO(BaseModel):
    id: int
    route_id: int
    departure_time: str
    arrival_time: str
    days_of_week: str
    is_active: bool

    class Config:
        from_attributes = True

class TransportRouteDTO(BaseModel):
    id: int
    route_code: str
    division: str = "ঢাকা"
    district: Optional[str] = "ঢাকা"
    origin_bn: str
    destination_bn: str
    distance_km: float
    estimated_duration_minutes: int
    vehicle_type: str
    operator_name_bn: str
    fare_bdt: float
    schedules: List[TransportScheduleDTO] = []

    class Config:
        from_attributes = True
