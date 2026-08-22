from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Notification

class NotificationsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='notifuser', password='Password123!')
        self.notif = Notification.objects.create(
            user=self.user,
            title="Welcome to GlobeTrotter!",
            message="Explore 7,000+ stations, flights, and curated itineraries.",
            read=False,
            notification_type="Push"
        )

    def test_notification_list_api(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
