from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.orm import ServiceApplication
from app.repositories.base import BaseRepository

class ApplicationRepository(BaseRepository[ServiceApplication]):
    def __init__(self):
        super().__init__(ServiceApplication)

    def get_by_number(self, db: Session, application_number: str) -> Optional[ServiceApplication]:
        return db.query(ServiceApplication).filter(ServiceApplication.application_number == application_number).first()

    def get_by_user_id(self, db: Session, user_id: int) -> List[ServiceApplication]:
        return db.query(ServiceApplication).filter(ServiceApplication.user_id == user_id).all()

application_repository = ApplicationRepository()
