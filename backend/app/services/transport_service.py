from typing import List, Optional, Dict
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from app.models.orm import TransportRoute, TransportSchedule
from app.schemas.transport import TransportRouteDTO

class TransportService:
    def get_routes(
        self,
        db: Session,
        origin: Optional[str] = None,
        destination: Optional[str] = None,
        vehicle_type: Optional[str] = None
    ) -> List[TransportRouteDTO]:
        query = db.query(TransportRoute).options(joinedload(TransportRoute.schedules))

        if origin and origin.strip():
            query = query.filter(TransportRoute.origin_bn.ilike(f"%{origin.strip()}%"))
        if destination and destination.strip():
            query = query.filter(TransportRoute.destination_bn.ilike(f"%{destination.strip()}%"))
        if vehicle_type and vehicle_type.strip():
            query = query.filter(TransportRoute.vehicle_type == vehicle_type.strip().lower())

        routes = query.order_by(TransportRoute.id.asc()).all()
        return [TransportRouteDTO.model_validate(r) for r in routes]

    def get_route_by_id(self, db: Session, route_id: int) -> TransportRouteDTO:
        route = db.query(TransportRoute).options(joinedload(TransportRoute.schedules)).filter(TransportRoute.id == route_id).first()
        if not route:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transport route not found")
        return TransportRouteDTO.model_validate(route)

    def get_locations(self, db: Session) -> Dict[str, List[str]]:
        routes = db.query(TransportRoute).all()
        origins = sorted(list(set(r.origin_bn for r in routes)))
        destinations = sorted(list(set(r.destination_bn for r in routes)))
        vehicle_types = sorted(list(set(r.vehicle_type for r in routes)))
        return {
            "origins": origins,
            "destinations": destinations,
            "vehicle_types": vehicle_types
        }

transport_service = TransportService()
