from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Trip, TripStop, TripActivity

class TripAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.client.force_authenticate(user=self.user)

        self.trip = Trip.objects.create(
            user=self.user,
            name="Test Europe Trip",
            description="Testing travel planner backend",
            start_date="2026-09-01",
            end_date="2026-09-10",
            budget_limit=2000.00,
            is_public=True
        )

        self.stop = TripStop.objects.create(
            trip=self.trip,
            city_name="Paris",
            country_name="France",
            cost_index="$$$",
            popularity="Extreme",
            date="2026-09-01",
            order=0
        )

        self.activity = TripActivity.objects.create(
            stop=self.stop,
            name="Louvre Museum",
            category="Sightseeing",
            cost=25.00,
            duration_hours=3.0,
            start_time="10:00 AM",
            order=0
        )

    def test_list_destinations(self):
        response = self.client.get('/api/destinations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)

    def test_create_trip(self):
        payload = {
            "name": "New Tokyo Adventure",
            "description": "Visiting Tokyo and Kyoto",
            "start_date": "2026-10-01",
            "end_date": "2026-10-07",
            "budget_limit": 1500.00,
            "is_public": False
        }
        response = self.client.post('/api/trips/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Trip.objects.filter(user=self.user).count(), 2)

    def test_list_user_trips(self):
        response = self.client.get('/api/trips/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_trip_detail(self):
        response = self.client.get(f'/api/trips/{self.trip.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Test Europe Trip")
        self.assertEqual(len(response.data['stops']), 1)

    def test_copy_public_trip(self):
        user2 = User.objects.create_user(username='user2', password='password123')
        self.client.force_authenticate(user=user2)
        response = self.client.post(f'/api/trips/{self.trip.id}/copy/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Trip.objects.filter(user=user2).count(), 1)
