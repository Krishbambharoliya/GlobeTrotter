from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from flights.models import Flight
from .models import Booking
from datetime import timedelta

class BookingsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='bookinguser', password='Password123!')
        self.flight = Flight.objects.create(
            flight_number="6E-202",
            airline="IndiGo",
            departure_city="Delhi",
            arrival_city="Goa",
            departure_time=timezone.now() + timedelta(days=2),
            arrival_time=timezone.now() + timedelta(days=2, hours=2),
            price=3500.00
        )
        self.booking = Booking.objects.create(
            user=self.user,
            booking_type='flight',
            flight_booking=self.flight,
            total_price=3500.00,
            status='confirmed'
        )

    def test_booking_list_api(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/bookings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_booking_creation(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/bookings/', {
            'booking_type': 'flight',
            'flight_booking': self.flight.id,
            'total_price': 3500.00,
            'status': 'confirmed'
        })
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_200_OK])
