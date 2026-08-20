from datetime import datetime, timezone
from app.services.events.observer import ApplicationObserver

class AuditLogObserver(ApplicationObserver):
    def __init__(self):
        self.audit_logs = []

    async def on_status_changed(
        self, application_id: str, applicant_phone: str, new_status: str, sub_service_name: str
    ) -> None:
        log_entry = {
            "application_id": application_id,
            "new_status": new_status,
            "sub_service_name": sub_service_name,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        self.audit_logs.append(log_entry)
        print(f"[AUDIT LOG] {log_entry['timestamp']} - Application {application_id} -> {new_status}")
