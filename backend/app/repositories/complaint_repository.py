from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.orm import CitizenComplaint
from app.repositories.base import BaseRepository

class ComplaintRepository(BaseRepository[CitizenComplaint]):
    def __init__(self):
        super().__init__(CitizenComplaint)

    def get_by_number(self, db: Session, complaint_number: str) -> Optional[CitizenComplaint]:
        return db.query(CitizenComplaint).filter(CitizenComplaint.complaint_number == complaint_number).first()

    def get_by_user_id(self, db: Session, user_id: int) -> List[CitizenComplaint]:
        return db.query(CitizenComplaint).filter(CitizenComplaint.user_id == user_id).all()

complaint_repository = ComplaintRepository()
