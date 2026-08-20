from app.services.events.observer import ApplicationObserver
from app.services.notifications.factory import ChannelNotificationFactory

class SMSNotificationObserver(ApplicationObserver):
    def __init__(self):
        self.factory = ChannelNotificationFactory()

    async def on_status_changed(
        self, application_id: str, applicant_phone: str, new_status: str, sub_service_name: str
    ) -> None:
        message = f"আপনার আবেদন '{application_id}' এর বর্তমান অবস্থা: {new_status}। (পল্লীবন্ধু সেবা)"
        sender = self.factory.create_sender("sms")
        await sender.send(recipient=applicant_phone, message=message)
