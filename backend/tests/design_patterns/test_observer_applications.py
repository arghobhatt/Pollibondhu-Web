import pytest
import asyncio
from unittest.mock import patch, AsyncMock, MagicMock
from app.services.events.publisher import ApplicationEventPublisher
from app.services.events.observer import ApplicationObserver
from app.services.events.sms_observer import SMSNotificationObserver
from app.services.events.audit_observer import AuditLogObserver
from app.services.events.dashboard_observer import DashboardUpdateObserver

class MockTestObserver(ApplicationObserver):
    def __init__(self):
        self.call_count = 0
        self.last_event_data = {}

    async def on_status_changed(
        self, application_id: str, applicant_phone: str, new_status: str, sub_service_name: str
    ) -> None:
        self.call_count += 1
        self.last_event_data = {
            "application_id": application_id,
            "applicant_phone": applicant_phone,
            "new_status": new_status,
            "sub_service_name": sub_service_name
        }

def test_observer_registration():
    publisher = ApplicationEventPublisher()
    obs1 = MockTestObserver()
    obs2 = MockTestObserver()

    publisher.attach(obs1)
    publisher.attach(obs2)
    assert len(publisher._observers) == 2
    assert obs1 in publisher._observers
    assert obs2 in publisher._observers

    publisher.attach(obs1)
    assert len(publisher._observers) == 2

def test_observer_removal():
    publisher = ApplicationEventPublisher()
    obs1 = MockTestObserver()
    obs2 = MockTestObserver()

    publisher.attach(obs1)
    publisher.attach(obs2)

    publisher.detach(obs1)
    assert len(publisher._observers) == 1
    assert obs1 not in publisher._observers
    assert obs2 in publisher._observers

    publisher.detach(obs1)
    assert len(publisher._observers) == 1

def test_notification_to_one_observer():
    async def run_test():
        publisher = ApplicationEventPublisher()
        obs = MockTestObserver()
        publisher.attach(obs)

        await publisher.notify_status_change(
            application_id="APP-101",
            applicant_phone="+8801711223344",
            new_status="In Progress",
            sub_service_name="Agri Loan"
        )

        assert obs.call_count == 1
        assert obs.last_event_data["new_status"] == "In Progress"

    asyncio.run(run_test())

def test_notification_to_multiple_observers_and_event_payload():
    async def run_test():
        publisher = ApplicationEventPublisher()
        obs1 = MockTestObserver()
        obs2 = MockTestObserver()
        obs3 = MockTestObserver()

        publisher.attach(obs1)
        publisher.attach(obs2)
        publisher.attach(obs3)

        app_id = "APP-2026-9042"
        phone = "+8801812345678"
        status = "Approved"
        service = "Fertilizer Subsidy Card"

        await publisher.notify_status_change(
            application_id=app_id,
            applicant_phone=phone,
            new_status=status,
            sub_service_name=service
        )

        for obs in [obs1, obs2, obs3]:
            assert obs.call_count == 1
            assert obs.last_event_data["application_id"] == app_id
            assert obs.last_event_data["applicant_phone"] == phone
            assert obs.last_event_data["new_status"] == status
            assert obs.last_event_data["sub_service_name"] == service

    asyncio.run(run_test())

def test_notification_with_no_observers():
    async def run_test():
        publisher = ApplicationEventPublisher()
        assert len(publisher._observers) == 0

        await publisher.notify_status_change(
            application_id="APP-000",
            applicant_phone="+8801700000000",
            new_status="Pending",
            sub_service_name="Test Service"
        )

    asyncio.run(run_test())

def test_concrete_observers_execution_with_mocked_dependencies():
    async def run_test():
        publisher = ApplicationEventPublisher()

        sms_obs = SMSNotificationObserver()
        audit_obs = AuditLogObserver()
        dash_obs = DashboardUpdateObserver()

        publisher.attach(sms_obs)
        publisher.attach(audit_obs)
        publisher.attach(dash_obs)

        with patch.object(sms_obs.factory, "create_sender") as mock_create_sender, \
             patch("builtins.print") as mock_print:

            mock_sender = AsyncMock()
            mock_create_sender.return_value = mock_sender

            await publisher.notify_status_change(
                application_id="APP-CONCRETE-88",
                applicant_phone="+8801999887766",
                new_status="Approved",
                sub_service_name="Krishi Rin"
            )

            mock_create_sender.assert_called_with("sms")
            mock_sender.send.assert_called_once()

            assert len(audit_obs.audit_logs) == 1
            assert audit_obs.audit_logs[0]["application_id"] == "APP-CONCRETE-88"
            assert audit_obs.audit_logs[0]["new_status"] == "Approved"
            assert mock_print.call_count >= 2

    asyncio.run(run_test())
