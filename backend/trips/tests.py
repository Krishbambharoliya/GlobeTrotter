from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from trips.models import Trip, TripStop, TripActivity

class TripsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user('traveler', 'traveler@example.com', 'Password123!')
        self.other_user = User.objects.create_user('other', 'other@example.com', 'Password123!')

        self.client.force_authenticate(user=self.user)

        self.trip_data = {
            'name': 'Euro Summer Trip',
            'description': 'Exploring Paris, Rome, and Barcelona',
            'start_date': '2026-06-01',
            'end_date': '2026-06-15',
            'is_public': True,
            'budget_limit': '3000.00',
            'stops': [
                {
                    'city_name': 'Paris',
                    'country_name': 'France',
                    'cost_index': '$$$',
                    'popularity': 'High',
                    'date': '2026-06-01',
                    'order': 0,
                    'activities': [
                        {
                            'name': 'Eiffel Tower',
                            'description': 'Summit Visit',
                            'category': 'Sightseeing',
                            'cost': '50.00',
                            'duration_hours': '2.00',
                            'start_time': '10:00 AM',
                            'order': 0
                        }
                    ]
                }
            ]
        }

    def test_create_trip(self):
        response = self.client.post('/api/trips/', self.trip_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Trip.objects.count(), 1)
        self.assertEqual(TripStop.objects.count(), 1)
        self.assertEqual(TripActivity.objects.count(), 1)
        self.assertEqual(response.data['name'], 'Euro Summer Trip')

    def test_list_user_trips(self):
        self.client.post('/api/trips/', self.trip_data, format='json')
        response = self.client.get('/api/trips/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_single_trip_detail(self):
        res = self.client.post('/api/trips/', self.trip_data, format='json')
        trip_id = res.data['id']
        response = self.client.get(f'/api/trips/{trip_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], trip_id)

    def test_update_trip(self):
        res = self.client.post('/api/trips/', self.trip_data, format='json')
        trip_id = res.data['id']
        update_data = {
            'name': 'Updated Euro Trip',
            'description': 'New description',
            'start_date': '2026-06-01',
            'end_date': '2026-06-20',
            'budget_limit': '4000.00'
        }
        response = self.client.patch(f'/api/trips/{trip_id}/', update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Euro Trip')

    def test_delete_trip(self):
        res = self.client.post('/api/trips/', self.trip_data, format='json')
        trip_id = res.data['id']
        response = self.client.delete(f'/api/trips/{trip_id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Trip.objects.count(), 0)

    def test_public_trips_list(self):
        self.client.post('/api/trips/', self.trip_data, format='json')
        self.client.force_authenticate(user=None) # Unauthenticated
        response = self.client.get('/api/trips/public/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_public_trip_detail(self):
        create_resp = self.client.post('/api/trips/', self.trip_data, format='json')
        trip_id = create_resp.data['id']

        self.client.force_authenticate(user=None)
        response = self.client.get(f'/api/trips/public-detail/{trip_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Euro Summer Trip')

    def test_copy_public_trip(self):
        create_resp = self.client.post('/api/trips/', self.trip_data, format='json')
        trip_id = create_resp.data['id']

        self.client.force_authenticate(user=self.other_user)
        copy_resp = self.client.post(f'/api/trips/{trip_id}/copy/')
        self.assertEqual(copy_resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Trip.objects.filter(user=self.other_user).count(), 1)
        copied_trip = Trip.objects.get(user=self.other_user)
        self.assertTrue(copied_trip.name.startswith('Copy of'))

    def test_destination_seed_list(self):
        response = self.client.get('/api/destinations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)

    def test_unauthenticated_create_trip_fails(self):
        self.client.force_authenticate(user=None)
        response = self.client.post('/api/trips/', self.trip_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
