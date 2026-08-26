from typing import List
from app.services.events.observer import ApplicationObserver

class ApplicationEventPublisher:
    def __init__(self):
        self._observers: List[ApplicationObserver] = []

    def attach(self, observer: ApplicationObserver) -> None:
        if observer not in self._observers:
            self._observers.append(observer)

    def detach(self, observer: ApplicationObserver) -> None:
        if observer in self._observers:
            self._observers.remove(observer)

    async def notify_status_change(
        self, application_id: str, applicant_phone: str, new_status: str, sub_service_name: str
    ) -> None:
        for obs in self._observers:
            await obs.on_status_changed(
                application_id=application_id,
                applicant_phone=applicant_phone,
                new_status=new_status,
                sub_service_name=sub_service_name
            )

    async def notify(self, application_number: str, new_status: str, user_phone: str, user_id: int) -> None:
        await self.notify_status_change(
            application_id=application_number,
            applicant_phone=user_phone,
            new_status=new_status,
            sub_service_name="কৃষি সেবা"
        )

application_event_publisher = ApplicationEventPublisher()
