from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from promotions.models import Coupon, Offer

class PromotionsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.coupon = Coupon.objects.create(
            code='GTFLY15',
            discount_percentage=15.00,
            max_discount=1500.00,
            active=True
        )
        self.offer = Offer.objects.create(
            title='Monsoon Special 20% Off Hotels',
            description='Flat 20% Off on luxury resorts',
            discount_tag='Flat 20% OFF',
            category='hotels'
        )

    def test_list_coupons(self):
        response = self.client.get('/api/promotions/coupons/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_list_offers(self):
        response = self.client.get('/api/promotions/offers/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
