from typing import List, Optional, Dict
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.transport import TransportRouteDTO
from app.services.transport_service import transport_service

router = APIRouter(prefix="/api/transport", tags=["Transport Services"])

@router.get("/routes", response_model=List[TransportRouteDTO])
def get_routes(
    origin: Optional[str] = Query(None, description="Origin location in Bangla"),
    destination: Optional[str] = Query(None, description="Destination location in Bangla"),
    vehicle_type: Optional[str] = Query(None, description="Vehicle type: bus, launch, train, auto"),
    db: Session = Depends(get_db)
):
    return transport_service.get_routes(db, origin, destination, vehicle_type)

@router.get("/routes/{route_id}", response_model=TransportRouteDTO)
def get_route_details(route_id: int, db: Session = Depends(get_db)):
    return transport_service.get_route_by_id(db, route_id)

@router.get("/locations", response_model=Dict[str, List[str]])
def get_locations(db: Session = Depends(get_db)):
    return transport_service.get_locations(db)
