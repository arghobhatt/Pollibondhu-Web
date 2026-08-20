import uuid
from app.services.notifications.base import NotificationSender
from app.models.domain import NotificationResponseDTO

class SMSNotificationSender(NotificationSender):
    async def send(self, recipient: str, message: str) -> NotificationResponseDTO:
        print(f"[SMS GATEWAY] Sending SMS to {recipient}: {message}")
        msg_id = f"SMS-{uuid.uuid4().hex[:8].upper()}"
        return NotificationResponseDTO(
            success=True,
            channel="sms",
            recipient=recipient,
            message_id=msg_id
        )
