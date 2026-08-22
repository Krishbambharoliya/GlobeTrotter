from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from hotels.models import Hotel

class HotelsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.hotel = Hotel.objects.create(
            name='Taj Exotica Resort & Spa',
            city='Goa',
            address='Benaulim Beach, South Goa',
            price_per_night=12500.00,
            rating=4.8
        )

    def test_list_hotels(self):
        response = self.client.get('/api/hotels/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_filter_hotels_by_city(self):
        response = self.client.get('/api/hotels/?city=Goa')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
