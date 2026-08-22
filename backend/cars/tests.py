from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from cars.models import Car

class CarsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.car = Car.objects.create(
            name='Mahindra Thar 4x4',
            car_type='SUV',
            transmission='Automatic',
            fuel_type='Petrol',
            rental_type='Self Drive',
            hourly_rate=150.00,
            daily_rate=3500.00
        )

    def test_list_cars(self):
        response = self.client.get('/api/cars/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_filter_cars(self):
        response = self.client.get('/api/cars/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
