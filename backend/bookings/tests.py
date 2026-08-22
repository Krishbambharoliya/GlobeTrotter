from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from flights.models import Flight
from bookings.models import Booking

class BookingsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user('booker', 'booker@example.com', 'Password123!')
        self.client.force_authenticate(user=self.user)

        self.flight = Flight.objects.create(
            flight_number='AI-101',
            airline='Air India',
            departure_city='Delhi',
            arrival_city='Mumbai',
            departure_time='2026-07-01 10:00:00',
            arrival_time='2026-07-01 12:15:00',
            price=4500.00
        )

    def test_create_flight_booking(self):
        booking_data = {
            'booking_type': 'flight',
            'flight_booking': self.flight.id,
            'flight_seats': '12A, 12B',
            'total_price': '9000.00',
            'travelers_info': '[{"name": "John Doe", "age": 30, "gender": "Male"}]'
        }
        response = self.client.post('/api/bookings/', booking_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Booking.objects.count(), 1)
        self.assertEqual(response.data['booking_type'], 'flight')

    def test_list_user_bookings(self):
        Booking.objects.create(
            user=self.user,
            booking_type='flight',
            flight_booking=self.flight,
            total_price=4500.00
        )
        response = self.client.get('/api/bookings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
