import uuid
from app.services.notifications.base import NotificationSender
from app.models.domain import NotificationResponseDTO

class PushNotificationSender(NotificationSender):
    async def send(self, recipient: str, message: str) -> NotificationResponseDTO:
        print(f"[PUSH ALERT] Dispatching Push Alert to {recipient}: {message}")
        msg_id = f"PUSH-{uuid.uuid4().hex[:8].upper()}"
        return NotificationResponseDTO(
            success=True,
            channel="push",
            recipient=recipient,
            message_id=msg_id
        )
