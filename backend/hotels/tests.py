from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Hotel

class HotelsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.hotel = Hotel.objects.create(
            name="Taj Palace Resort",
            city="Goa",
            address="Calangute Beach Road, Goa",
            price_per_night=8500.00,
            rating=4.9,
            image_url="https://images.unsplash.com/photo-1566073771259-6a8506099945"
        )

    def test_hotel_list_api(self):
        response = self.client.get('/api/hotels/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_hotel_search_filter(self):
        response = self.client.get('/api/hotels/?city=Goa')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
