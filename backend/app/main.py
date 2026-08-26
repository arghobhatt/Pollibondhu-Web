from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.core.config import settings
from app.core.exceptions import (
    http_exception_handler,
    validation_exception_handler,
    global_exception_handler
)
from app.db.init_db import init_db
from app.api import weather, notifications, loans, applications, health, dashboard, auth, citizen, agriculture, complaints, utility, transport, emergency, community, officer

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        init_db()
    except Exception:
        pass
    yield

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Pollibondhu Backend — Integrated Service Platform with Design Patterns & PostgreSQL.",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(citizen.router)
app.include_router(agriculture.router)
app.include_router(complaints.router)
app.include_router(utility.router)
app.include_router(transport.router)
app.include_router(emergency.router)
app.include_router(community.router)
app.include_router(officer.router)
app.include_router(dashboard.router)
app.include_router(weather.router)
app.include_router(notifications.router)
app.include_router(loans.router)
app.include_router(applications.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "design_patterns": [
            "1. Singleton (WeatherApiClient & Settings)",
            "2. Factory Method (ChannelNotificationFactory)",
            "3. Strategy (LoanCalculatorContext & LoanCalculationStrategy)",
            "4. Observer (ApplicationEventPublisher & ApplicationObserver)",
            "5. Facade (WeatherFacade & DashboardFacade)"
        ],
        "docs_url": "/docs",
        "health_url": "/api/health"
    }
