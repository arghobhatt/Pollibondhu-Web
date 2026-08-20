import uuid
from app.services.notifications.base import NotificationSender
from app.models.domain import NotificationResponseDTO

class EmailNotificationSender(NotificationSender):
    async def send(self, recipient: str, message: str) -> NotificationResponseDTO:
        print(f"[SMTP MAIL] Sending Email to {recipient}: {message}")
        msg_id = f"EMAIL-{uuid.uuid4().hex[:8].upper()}"
        return NotificationResponseDTO(
            success=True,
            channel="email",
            recipient=recipient,
            message_id=msg_id
        )
