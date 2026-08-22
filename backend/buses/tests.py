from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Bus
from django.utils import timezone
from datetime import timedelta

class BusesAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.bus = Bus.objects.create(
            operator="Zingbus Volvo Sleeper",
            bus_number="NL-01-AB-1234",
            source_city="Delhi",
            destination_city="Manali",
            departure_time=timezone.now() + timedelta(days=1),
            arrival_time=timezone.now() + timedelta(days=1, hours=12),
            bus_type="AC Sleeper (2+1)",
            price=1299.00
        )

    def test_bus_list_api(self):
        response = self.client.get('/api/buses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
