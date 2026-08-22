from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import FAQ, ContactMessage

class SupportAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.faq = FAQ.objects.create(
            question="How do I change my booking dates?",
            answer="Go to My Bookings in your profile dashboard and click Change Dates.",
            category="Bookings"
        )

    def test_faq_list_api(self):
        response = self.client.get('/api/support/faqs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_contact_message_submit(self):
        response = self.client.post('/api/support/contact/', {
            'name': 'John Traveler',
            'email': 'john@example.com',
            'subject': 'Booking Query',
            'message': 'Can I request early check-in for my hotel?'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(ContactMessage.objects.filter(email='john@example.com').exists())
