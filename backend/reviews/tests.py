from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from reviews.models import Review

class ReviewsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user('reviewer', 'reviewer@example.com', 'Password123!')
        self.client.force_authenticate(user=self.user)

    def test_create_and_list_reviews(self):
        review_data = {
            'category': 'general',
            'target_id': 1,
            'rating': 5,
            'comment': 'Amazing travel planning experience with Globe Trotter!'
        }
        create_resp = self.client.post('/api/reviews/', review_data, format='json')
        self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED)

        list_resp = self.client.get('/api/reviews/')
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_resp.data), 1)
