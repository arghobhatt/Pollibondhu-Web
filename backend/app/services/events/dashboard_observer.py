from app.services.events.observer import ApplicationObserver

class DashboardUpdateObserver(ApplicationObserver):
    async def on_status_changed(
        self, application_id: str, applicant_phone: str, new_status: str, sub_service_name: str
    ) -> None:
        print(f"[DASHBOARD BROADCAST] Live stream update for {application_id}: Status changed to {new_status}")
