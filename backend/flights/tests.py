from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from flights.models import Flight

class FlightsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.flight = Flight.objects.create(
            flight_number='6E-202',
            airline='IndiGo',
            departure_city='Mumbai',
            arrival_city='Goa',
            departure_time='2026-07-10 08:00:00',
            arrival_time='2026-07-10 09:15:00',
            price=3200.00
        )

    def test_list_flights(self):
        response = self.client.get('/api/flights/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_filter_flights(self):
        response = self.client.get('/api/flights/?from_city=Mumbai&to_city=Goa')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
