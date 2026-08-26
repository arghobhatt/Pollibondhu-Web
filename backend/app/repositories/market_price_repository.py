from typing import List
from sqlalchemy.orm import Session
from app.models.orm import CropMarketPrice
from app.repositories.base import BaseRepository

class MarketPriceRepository(BaseRepository[CropMarketPrice]):
    def __init__(self):
        super().__init__(CropMarketPrice)

    def get_by_district(self, db: Session, district: str) -> List[CropMarketPrice]:
        return db.query(CropMarketPrice).filter(CropMarketPrice.district == district).all()

market_price_repository = MarketPriceRepository()
