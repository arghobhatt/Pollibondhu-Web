from typing import List, Optional, Dict
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from app.models.orm import TransportRoute, TransportSchedule
from app.schemas.transport import TransportRouteDTO

class TransportService:
    def get_routes(
        self,
        db: Session,
        division: Optional[str] = None,
        origin: Optional[str] = None,
        destination: Optional[str] = None,
        vehicle_type: Optional[str] = None
    ) -> List[TransportRouteDTO]:
        query = db.query(TransportRoute).options(joinedload(TransportRoute.schedules))

        if division and division.strip() and division.strip() != "সকল বিভাগ":
            query = query.filter(TransportRoute.division.ilike(f"%{division.strip()}%"))
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

    def get_locations(self, db: Session, division: Optional[str] = None) -> Dict[str, List[str]]:
        query = db.query(TransportRoute)
        all_routes = db.query(TransportRoute).all()
        
        all_divisions = ["ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট", "রংপুর", "ময়মনসিংহ"]
        db_divisions = sorted(list(set(r.division for r in all_routes if r.division)))
        # combine standard divisions and any db divisions preserving unique
        divisions = [d for d in all_divisions if d in db_divisions] + [d for d in db_divisions if d not in all_divisions]
        if not divisions:
            divisions = all_divisions

        if division and division.strip() and division.strip() != "সকল বিভাগ":
            query = query.filter(TransportRoute.division.ilike(f"%{division.strip()}%"))

        routes = query.all()
        origins = sorted(list(set(r.origin_bn for r in routes)))
        destinations = sorted(list(set(r.destination_bn for r in routes)))
        vehicle_types = sorted(list(set(r.vehicle_type for r in all_routes)))
        
        return {
            "divisions": divisions,
            "origins": origins,
            "destinations": destinations,
            "vehicle_types": vehicle_types
        }

transport_service = TransportService()
