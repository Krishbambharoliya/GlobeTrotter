from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from .models import Flight
from datetime import timedelta

class FlightsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.flight = Flight.objects.create(
            flight_number="AI-101",
            airline="Air India",
            departure_city="New Delhi",
            arrival_city="Mumbai",
            departure_time=timezone.now() + timedelta(days=1),
            arrival_time=timezone.now() + timedelta(days=1, hours=2),
            price=4500.00
        )

    def test_flight_list_api(self):
        response = self.client.get('/api/flights/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_flight_search_filter(self):
        response = self.client.get('/api/flights/?from=New Delhi&to=Mumbai')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
