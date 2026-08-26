from typing import Optional
from sqlalchemy.orm import Session
from app.models.orm import User
from app.repositories.base import BaseRepository

class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)

    def get_by_phone(self, db: Session, phone_number: str) -> Optional[User]:
        return db.query(User).filter(User.phone_number == phone_number).first()

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

user_repository = UserRepository()
