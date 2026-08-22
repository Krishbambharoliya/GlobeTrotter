from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from buses.models import Bus

class BusesAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.bus = Bus.objects.create(
            operator='VRL Travels',
            bus_number='KA-01-F-1234',
            bus_type='Volvo Multi-Axle AC Sleeper',
            source_city='Bengaluru',
            destination_city='Goa',
            departure_time='2026-07-20 21:00:00',
            arrival_time='2026-07-21 07:30:00',
            price=1400.00,
            available_seats=30
        )

    def test_list_buses(self):
        response = self.client.get('/api/buses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_filter_buses(self):
        response = self.client.get('/api/buses/?from_city=Bengaluru&to_city=Goa')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
