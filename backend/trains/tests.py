from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from trains.models import Train

class TrainsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.train = Train.objects.create(
            name='Mumbai Rajdhani Express',
            train_number='12951',
            source_city='Mumbai',
            destination_city='Delhi',
            departure_time='2026-07-15 17:00:00',
            arrival_time='2026-07-16 08:32:00',
            price=2800.00,
            train_type='3AC'
        )

    def test_list_trains(self):
        response = self.client.get('/api/trains/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_filter_trains_by_station(self):
        response = self.client.get('/api/trains/?from_city=Mumbai&to_city=Delhi')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
