from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Car

class CarsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.car = Car.objects.create(
            name="Mahindra Thar 4x4",
            car_type="SUV",
            transmission="Automatic",
            fuel_type="Diesel",
            rental_type="Self Drive",
            hourly_rate=250.00,
            daily_rate=3500.00,
            image_url="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf"
        )

    def test_car_list_api(self):
        response = self.client.get('/api/cars/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
