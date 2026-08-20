from fastapi import FastAPI
from app.core.config import settings
from app.api import weather, notifications, loans, applications

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Pollibondhu Backend — Demonstrating Singleton, Factory Method, Strategy, and Observer Patterns."
)

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
            "4. Observer (ApplicationEventPublisher & ApplicationObserver)"
        ],
        "docs_url": "/docs"
    }
