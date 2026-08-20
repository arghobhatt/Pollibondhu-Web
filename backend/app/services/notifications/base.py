from abc import ABC, abstractmethod
from app.models.domain import NotificationResponseDTO

class NotificationSender(ABC):
    @abstractmethod
    async def send(self, recipient: str, message: str) -> NotificationResponseDTO:
        pass
