from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timezone
from app.db.database import get_db
from app.core.config import settings

router = APIRouter(prefix="/api/health", tags=["Health & Status"])

@router.get("")
def health_check(db: Session = Depends(get_db)):
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
