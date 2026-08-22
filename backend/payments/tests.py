from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from bookings.models import Booking
from .models import Payment

class PaymentsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='payer', password='Password123!')
        self.booking = Booking.objects.create(
            user=self.user,
            booking_type='hotel',
            total_price=5000.00,
            status='pending'
        )
        self.payment = Payment.objects.create(
            booking=self.booking,
            payment_id="PAY_TEST_12345",
            amount=5000.00,
            status='completed',
            method='UPI'
        )

    def test_payment_list_api(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/payments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
