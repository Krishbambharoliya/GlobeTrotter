from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Train
from django.utils import timezone
from datetime import timedelta

class TrainsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.train = Train.objects.create(
            train_number="12951",
            name="Rajdhani Express",
            source_city="Mumbai Central",
            destination_city="New Delhi",
            departure_time=timezone.now() + timedelta(days=1),
            arrival_time=timezone.now() + timedelta(days=1, hours=16),
            price=2800.00,
            train_type="3AC"
        )

    def test_train_list_api(self):
        response = self.client.get('/api/trains/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
