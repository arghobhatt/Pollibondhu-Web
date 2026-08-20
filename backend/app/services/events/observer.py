from abc import ABC, abstractmethod

class ApplicationObserver(ABC):
    @abstractmethod
    async def on_status_changed(
        self, application_id: str, applicant_phone: str, new_status: str, sub_service_name: str
    ) -> None:
        pass
