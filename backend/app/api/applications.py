from fastapi import APIRouter
from app.services.events.publisher import application_event_publisher
from app.services.events.sms_observer import SMSNotificationObserver
from app.services.events.audit_observer import AuditLogObserver
from app.services.events.dashboard_observer import DashboardUpdateObserver
from app.models.domain import StatusUpdateRequestDTO

router = APIRouter(prefix="/api/applications", tags=["Service Applications"])

sms_obs = SMSNotificationObserver()
audit_obs = AuditLogObserver()
dash_obs = DashboardUpdateObserver()
application_event_publisher.attach(sms_obs)
application_event_publisher.attach(audit_obs)
application_event_publisher.attach(dash_obs)

@router.put("/status")
async def update_application_status(req: StatusUpdateRequestDTO):
    await application_event_publisher.notify_status_change(
        application_id=req.application_id,
        applicant_phone="+8801812345678",
        new_status=req.new_status,
        sub_service_name="কৃষি ঋণ (Subsidized Agri Loan)"
    )
    return {
        "status": "success",
        "message": f"Application {req.application_id} state updated to '{req.new_status}'. All attached observers notified.",
        "application_id": req.application_id,
        "new_status": req.new_status
    }
