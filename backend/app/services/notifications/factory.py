from abc import ABC, abstractmethod
from app.services.notifications.base import NotificationSender
from app.services.notifications.sms import SMSNotificationSender
from app.services.notifications.email import EmailNotificationSender
from app.services.notifications.push import PushNotificationSender

class NotificationFactory(ABC):
    @abstractmethod
    def create_sender(self, channel: str) -> NotificationSender:
        pass

class ChannelNotificationFactory(NotificationFactory):
    def create_sender(self, channel: str) -> NotificationSender:
        normalized_channel = channel.lower().strip()

        if normalized_channel == "sms":
            return SMSNotificationSender()
        elif normalized_channel == "email":
            return EmailNotificationSender()
        elif normalized_channel in ["push", "in_app"]:
            return PushNotificationSender()
        else:
            return SMSNotificationSender()
