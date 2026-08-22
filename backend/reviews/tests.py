from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Review

class ReviewsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='reviewer', password='Password123!')
        self.review = Review.objects.create(
            user=self.user,
            category='hotel',
            target_id=1,
            rating=5,
            comment='Outstanding hospitality and ocean view room!'
        )

    def test_review_list_api(self):
        response = self.client.get('/api/reviews/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_create_review(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/reviews/', {
            'category': 'flight',
            'target_id': 2,
            'rating': 4,
            'comment': 'Smooth flight, great legroom.'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
