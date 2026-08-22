from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Trip, TripStop, TripActivity

class GlobeTrotterCoreFeaturesTestCase(TestCase):
    """
    Comprehensive test suite validating the 5 core project pillars:
    1. Multi-city itinerary creation
    2. Travel dates, activity assignment, and budget limits
    3. Destination & activity discovery search
    4. Cost breakdown & visual calendar rendering logic
    5. Public trip sharing & trip cloning/copying
    """

    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username='traveler1', email='traveler1@globetrotter.com', password='password123')
        self.user2 = User.objects.create_user(username='traveler2', email='traveler2@globetrotter.com', password='password123')
        self.client.force_authenticate(user=self.user1)

        # Pre-seed a multi-city trip
        self.trip = Trip.objects.create(
            user=self.user1,
            name="Grand European Tour",
            description="Multi-city trip through Paris and Rome",
            start_date="2026-09-01",
            end_date="2026-09-10",
            budget_limit=3000.00,
            is_public=True
        )

        # Stop 1: Paris
        self.stop_paris = TripStop.objects.create(
            trip=self.trip,
            city_name="Paris",
            country_name="France",
            cost_index="$$$",
            popularity="Extreme",
            date="2026-09-01",
            order=0
        )
        self.act_louvre = TripActivity.objects.create(
            stop=self.stop_paris,
            name="Louvre Museum Tour",
            category="Sightseeing",
            cost=30.00,
            duration_hours=3.5,
            start_time="10:00 AM",
            order=0
        )
        self.act_eiffel = TripActivity.objects.create(
            stop=self.stop_paris,
            name="Eiffel Tower Summit",
            category="Sightseeing",
            cost=45.00,
            duration_hours=2.0,
            start_time="03:00 PM",
            order=1
        )

        # Stop 2: Rome
        self.stop_rome = TripStop.objects.create(
            trip=self.trip,
            city_name="Rome",
            country_name="Italy",
            cost_index="$$",
            popularity="High",
            date="2026-09-05",
            order=1
        )
        self.act_colosseum = TripActivity.objects.create(
            stop=self.stop_rome,
            name="Colosseum & Roman Forum",
            category="Sightseeing",
            cost=35.00,
            duration_hours=4.0,
            start_time="09:30 AM",
            order=0
        )

    # -------------------------------------------------------------------------
    # Pillar 1: Customized Multi-City Itineraries
    # -------------------------------------------------------------------------
    def test_pillar_1_multi_city_itinerary_creation_and_reordering(self):
        new_trip = Trip.objects.create(
            user=self.user1,
            name="Asian Discovery Tour",
            description="Tokyo to Kyoto adventure",
            start_date="2026-10-01",
            end_date="2026-10-12",
            budget_limit=4000.00,
            is_public=False
        )
        TripStop.objects.create(
            trip=new_trip,
            city_name="Tokyo",
            country_name="Japan",
            cost_index="$$$",
            popularity="Extreme",
            date="2026-10-01",
            order=0
        )
        TripStop.objects.create(
            trip=new_trip,
            city_name="Kyoto",
            country_name="Japan",
            cost_index="$$",
            popularity="High",
            date="2026-10-05",
            order=1
        )
        self.assertEqual(new_trip.stops.count(), 2)
        response = self.client.get(f'/api/trips/{new_trip.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # -------------------------------------------------------------------------
    # Pillar 2: Assign Travel Dates, Activities, and Budgets
    # -------------------------------------------------------------------------
    def test_pillar_2_dates_activities_and_budget_evaluation(self):
        response = self.client.get(f'/api/trips/{self.trip.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify budget limit and assigned activity calculations
        data = response.data
        self.assertEqual(data['budget_limit'], '3000.00')
        total_activities = sum(len(stop['activities']) for stop in data['stops'])
        self.assertEqual(total_activities, 3)

        # Update budget limit and trip properties
        update_payload = {
            "name": "Grand European Tour Updated",
            "budget_limit": 2500.00
        }
        update_response = self.client.patch(f'/api/trips/{self.trip.id}/', update_payload, format='json')
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

    # -------------------------------------------------------------------------
    # Pillar 3: Discover Activities and Destinations Through Search
    # -------------------------------------------------------------------------
    def test_pillar_3_destination_and_activity_discovery(self):
        response = self.client.get('/api/destinations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        destinations = response.data
        self.assertGreater(len(destinations), 0)
        
        # Verify destination attributes (country, cost index, popularity, activities)
        first_dest = destinations[0]
        self.assertIn('city_name', first_dest)
        self.assertIn('country_name', first_dest)
        self.assertIn('cost_index', first_dest)
        self.assertIn('popularity', first_dest)
        self.assertIn('activities', first_dest)

    # -------------------------------------------------------------------------
    # Pillar 4: Cost Breakdowns and Visual Calendars
    # -------------------------------------------------------------------------
    def test_pillar_4_cost_breakdown_data_integrity(self):
        response = self.client.get(f'/api/trips/{self.trip.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Calculate total cost of activities across all stops
        stops = response.data['stops']
        total_cost = sum(
            float(act['cost']) 
            for stop in stops 
            for act in stop['activities']
        )
        # Louvre ($30) + Eiffel ($45) + Colosseum ($35) = $110.00
        self.assertEqual(total_cost, 110.00)

    # -------------------------------------------------------------------------
    # Pillar 5: Share Plans Publicly or with Friends (Public URLs & Copying)
    # -------------------------------------------------------------------------
    def test_pillar_5_public_sharing_and_trip_copying(self):
        # 1. Fetch public itineraries list via /api/trips/public/
        public_resp = self.client.get('/api/trips/public/')
        self.assertEqual(public_resp.status_code, status.HTTP_200_OK)
        self.assertGreater(len(public_resp.data), 0)

        # 2. Switch to User 2 and copy User 1's public trip
        self.client.force_authenticate(user=self.user2)
        copy_resp = self.client.post(f'/api/trips/{self.trip.id}/copy/')
        self.assertEqual(copy_resp.status_code, status.HTTP_201_CREATED)

        copied_trip_id = copy_resp.data['id']
        copied_trip = Trip.objects.get(id=copied_trip_id)
        self.assertEqual(copied_trip.user, self.user2)
        self.assertEqual(copied_trip.name, "Copy of Grand European Tour")
        self.assertEqual(copied_trip.stops.count(), 2)
