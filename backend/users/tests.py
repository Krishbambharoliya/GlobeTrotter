from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from users.models import UserProfile

class UsersAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/users/register/'
        self.login_url = '/api/users/login/'
        self.profile_url = '/api/users/profile/'
        self.change_password_url = '/api/users/change-password/'

        self.user_data = {
            'username': 'testuser',
            'email': 'testuser@example.com',
            'password': 'TestPassword123!',
            'first_name': 'Test',
            'last_name': 'User',
            'phone_number': '9876543210',
            'city': 'Mumbai',
            'country': 'India'
        }

    def test_user_registration_success(self):
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertTrue(User.objects.filter(username='testuser').exists())
        self.assertTrue(UserProfile.objects.filter(user__username='testuser').exists())

    def test_user_registration_duplicate_username(self):
        self.client.post(self.register_url, self.user_data, format='json')
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_missing_field(self):
        invalid_data = self.user_data.copy()
        invalid_data.pop('username')
        response = self.client.post(self.register_url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login_success(self):
        self.client.post(self.register_url, self.user_data, format='json')
        login_data = {'username': 'testuser', 'password': 'TestPassword123!'}
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_user_login_wrong_password(self):
        self.client.post(self.register_url, self.user_data, format='json')
        login_data = {'username': 'testuser', 'password': 'WrongPassword!'}
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_login_with_email(self):
        self.client.post(self.register_url, self.user_data, format='json')
        login_data = {'username': 'testuser@example.com', 'password': 'TestPassword123!'}
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_get_and_update_profile(self):
        reg_resp = self.client.post(self.register_url, self.user_data, format='json')
        token = reg_resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        get_resp = self.client.get(self.profile_url)
        self.assertEqual(get_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(get_resp.data['username'], 'testuser')

        update_data = {
            'first_name': 'UpdatedName',
            'city': 'Delhi',
            'country': 'India'
        }
        patch_resp = self.client.patch(self.profile_url, update_data, format='json')
        self.assertEqual(patch_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_resp.data['first_name'], 'UpdatedName')

    def test_change_password_success(self):
        reg_resp = self.client.post(self.register_url, self.user_data, format='json')
        token = reg_resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        pwd_data = {'old_password': 'TestPassword123!', 'new_password': 'NewSecurePassword456!'}
        resp = self.client.post(self.change_password_url, pwd_data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_change_password_wrong_old_password(self):
        reg_resp = self.client.post(self.register_url, self.user_data, format='json')
        token = reg_resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        pwd_data = {'old_password': 'WrongPassword!', 'new_password': 'NewSecurePassword456!'}
        resp = self.client.post(self.change_password_url, pwd_data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_profile_unauthenticated(self):
        self.client.credentials() # Clear credentials
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
