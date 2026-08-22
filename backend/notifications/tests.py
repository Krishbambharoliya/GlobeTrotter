from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from notifications.models import Notification

class NotificationsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user('notifuser', 'notif@example.com', 'Password123!')
        self.client.force_authenticate(user=self.user)

        self.notif = Notification.objects.create(
            user=self.user,
            title='Booking Confirmed ✅',
            message='Your flight booking AI-101 is confirmed.',
            notification_type='Push'
        )

    def test_list_notifications(self):
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_mark_notification_as_read(self):
        response = self.client.post(f'/api/notifications/{self.notif.id}/read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notif.refresh_from_db()
        self.assertTrue(self.notif.read)
