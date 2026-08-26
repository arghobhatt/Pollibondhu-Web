from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.weather.facade import WeatherFacade
from app.models.orm import CropMarketPrice, User, UserRole

router = APIRouter(prefix="/api/dashboard", tags=["Composite Dashboard"])
weather_facade = WeatherFacade()

@router.get("")
async def get_dashboard_summary(
    city: str = Query("ঢাকা", description="City name for weather forecast"),
    db: Session = Depends(get_db)
):
    weather_dto = await weather_facade.get_weather_forecast(city)
    
    market_price_records = db.query(CropMarketPrice).all()
    market_prices = [
        {
            "id": p.id,
            "crop_name": p.crop_name,
            "crop_name_bn": p.crop_name_bn,
            "district": p.district,
            "price_bdt": p.price_bdt_per_mon,
            "unit": p.unit
        }
        for p in market_price_records
    ]
    if not market_prices:
        market_prices = [
            {"id": 1, "crop_name": "Aman Paddy", "crop_name_bn": "আমন ধান", "district": "ঢাকা", "price_bdt": 1350.0, "unit": "mon"},
            {"id": 2, "crop_name": "Boro Paddy", "crop_name_bn": "বোরো ধান", "district": "ঢাকা", "price_bdt": 1420.0, "unit": "mon"}
        ]

    officer = db.query(User).filter(User.role == UserRole.OFFICER).first()
    officer_info = {
        "officer_name": officer.full_name if officer else "মোঃ রফিকুল ইসলাম (উপসহকারী কৃষি কর্মকর্তা)",
        "phone": officer.phone_number if officer else "+8801800000000",
        "upazila": officer.upazila if officer else "ধামরাই"
    }

    return {
        "status": "success",
        "weather": weather_dto.model_dump(),
        "market_prices": market_prices,
        "assigned_officer": officer_info
    }
