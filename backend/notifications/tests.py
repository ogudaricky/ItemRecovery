from django.apps import apps
from django.test import SimpleTestCase


class NotificationsAppTests(SimpleTestCase):
    """Placeholders until notification models and APIs exist."""

    def test_notifications_app_is_installed(self):
        self.assertTrue(apps.is_installed("notifications"))
