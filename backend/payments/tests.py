from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from payments.models import Payment
from bookings.models import Booking

class PaymentsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user('payer', 'payer@example.com', 'Password123!')
        self.client.force_authenticate(user=self.user)

        self.booking = Booking.objects.create(
            user=self.user,
            booking_type='hotel',
            total_price=5000.00
        )

    def test_process_payment_wallet(self):
        payment_data = {
            'booking': self.booking.id,
            'payment_id': 'PAY-TEST-001',
            'method': 'Wallet',
            'amount': '5000.00',
            'status': 'completed'
        }
        response = self.client.post('/api/payments/', payment_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Payment.objects.count(), 1)
