from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Coupon

class PromotionsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.coupon = Coupon.objects.create(
            code="WELCOME500",
            discount_percentage=15.00,
            max_discount=500.00,
            active=True
        )

    def test_promotions_list_api(self):
        response = self.client.get('/api/promotions/coupons/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
