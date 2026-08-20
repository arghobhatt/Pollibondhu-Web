from fastapi import APIRouter
from app.services.notifications.factory import ChannelNotificationFactory
from app.models.domain import NotificationRequestDTO, NotificationResponseDTO

router = APIRouter(prefix="/api/notifications", tags=["Notification Service"])

@router.post("/send", response_model=NotificationResponseDTO)
async def send_notification(req: NotificationRequestDTO):
    factory = ChannelNotificationFactory()
    sender = factory.create_sender(req.channel)
    return await sender.send(recipient=req.recipient, message=req.message)
