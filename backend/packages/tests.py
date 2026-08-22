from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from packages.models import Package

class PackagesAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.package = Package.objects.create(
            title='Exotic Bali & Nusa Penida Escape',
            destination='Bali, Indonesia',
            duration='5 Days / 4 Nights',
            price=45000.00,
            description='Includes 4-star beach resort, private island tour, scuba diving & transfers.'
        )

    def test_list_packages(self):
        response = self.client.get('/api/packages/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_package_detail(self):
        response = self.client.get(f'/api/packages/{self.package.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Exotic Bali & Nusa Penida Escape')
