import pytest
import asyncio
from unittest.mock import patch, MagicMock
from app.services.notifications.factory import ChannelNotificationFactory, NotificationFactory
from app.services.notifications.base import NotificationSender
from app.services.notifications.sms import SMSNotificationSender
from app.services.notifications.email import EmailNotificationSender
from app.services.notifications.push import PushNotificationSender

def test_sms_product_creation():
    factory = ChannelNotificationFactory()
    sender = factory.create_sender("sms")

    assert isinstance(sender, NotificationSender)
    assert isinstance(sender, SMSNotificationSender)
    assert type(sender) is SMSNotificationSender

def test_email_product_creation():
    factory = ChannelNotificationFactory()
    sender = factory.create_sender("email")

    assert isinstance(sender, NotificationSender)
    assert isinstance(sender, EmailNotificationSender)
    assert type(sender) is EmailNotificationSender

def test_push_product_creation():
    factory = ChannelNotificationFactory()
    sender_push = factory.create_sender("push")
    sender_in_app = factory.create_sender("in_app")

    assert isinstance(sender_push, NotificationSender)
    assert isinstance(sender_push, PushNotificationSender)
    assert isinstance(sender_in_app, PushNotificationSender)

def test_invalid_unsupported_channel_fallback():
    factory = ChannelNotificationFactory()

    sender_unsupported = factory.create_sender("unsupported_carrier_99")
    sender_invalid = factory.create_sender("whatsapp")

    assert isinstance(sender_unsupported, SMSNotificationSender)
    assert isinstance(sender_invalid, SMSNotificationSender)

def test_polymorphic_sender_execution_mocked():
    async def run_polymorphic_test():
        factory = ChannelNotificationFactory()

        channels_to_test = [
            ("sms", "+8801812345678", "SMS-"),
            ("email", "citizen@pollibondhu.gov.bd", "EMAIL-"),
            ("push", "USR-DEV-901", "PUSH-")
        ]

        with patch("builtins.print") as mock_print:
            for channel, recipient, expected_prefix in channels_to_test:
                sender = factory.create_sender(channel)
                response = await sender.send(recipient, "আবেদন স্ট্যাটাস পরিবর্তন হয়েছে")

                assert response.success is True
                assert response.channel == channel
                assert response.recipient == recipient
                assert response.message_id.startswith(expected_prefix)

            assert mock_print.call_count == 3

    asyncio.run(run_polymorphic_test())
