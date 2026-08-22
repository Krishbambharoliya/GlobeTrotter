from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import UserProfile

class UsersAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@globetrotter.com',
            password='Password123!'
        )
        self.profile, _ = UserProfile.objects.get_or_create(user=self.user)

    def test_user_registration(self):
        response = self.client.post('/api/users/register/', {
            'username': 'newuser',
            'email': 'newuser@globetrotter.com',
            'password': 'Password123!'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_get_user_profile(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/users/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')

    def test_update_user_profile(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.put('/api/users/profile/', {
            'first_name': 'Test',
            'last_name': 'User',
            'phone_number': '+1234567890',
            'avatar_url': 'https://example.com/avatar.jpg'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Test')

    def test_change_password(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/users/change-password/', {
            'old_password': 'Password123!',
            'new_password': 'NewPassword123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPassword123!'))

    def test_delete_user_account(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.delete('/api/users/profile/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(username='testuser').exists())
