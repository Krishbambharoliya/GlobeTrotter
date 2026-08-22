from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from support.models import ContactMessage, FAQ

class SupportAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.faq = FAQ.objects.create(
            question='How do I cancel my booking?',
            answer='Go to My Bookings in your Dashboard and click Cancel.',
            category='Bookings'
        )

    def test_list_faqs(self):
        response = self.client.get('/api/support/faqs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_contact_message(self):
        data = {
            'name': 'John Traveler',
            'email': 'john@example.com',
            'subject': 'Inquiry about Bali package',
            'message': 'Can I extend the stay by 2 days?'
        }
        response = self.client.post('/api/support/contact/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ContactMessage.objects.count(), 1)
