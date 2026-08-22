from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Package

class PackagesAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.package = Package.objects.create(
            title="Kashmir Paradise 6D/5N Package",
            destination="Kashmir",
            duration="6 Days / 5 Nights",
            price=24999.00,
            description="Shikara ride, Gulmarg Gondola, and Pahalgam valley stay.",
            image_url="https://images.unsplash.com/photo-1566837430420-9de97abaf222"
        )

    def test_package_list_api(self):
        response = self.client.get('/api/packages/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
