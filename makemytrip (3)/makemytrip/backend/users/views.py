# pyrefly: ignore [missing-import]
from django.contrib.auth.models import User
# pyrefly: ignore [missing-import]
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSerializer
from .models import UserProfile
import random
from django.utils import timezone
from datetime import timedelta
import json

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

class UserProfileView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        data = request.data
        
        # Update user fields
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        user.save()
        
        # Update profile fields
        profile = user.profile
        profile.phone_number = data.get('phone_number', profile.phone_number)
        profile.avatar_url = data.get('avatar_url', profile.avatar_url)
        if 'saved_travelers' in data:
            travelers = data['saved_travelers']
            if isinstance(travelers, list):
                profile.saved_travelers = json.dumps(travelers)
            else:
                profile.saved_travelers = travelers
        profile.save()
        
        return Response(UserSerializer(user).data)

class ChangePasswordView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not user.check_password(old_password):
            return Response({"error": "Incorrect old password"}, status=status.HTTP_400_BAD_REQUEST)
            
        user.set_password(new_password)
        user.save()
        return Response({"message": "Password changed successfully"})



class AdminUserListView(generics.ListCreateAPIView):
    queryset = User.objects.all().order_by('-id')
    permission_classes = (permissions.IsAdminUser,)
    serializer_class = UserSerializer

class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.IsAdminUser,)
    serializer_class = UserSerializer
    
    def perform_destroy(self, instance):
        if instance.is_superuser:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Cannot delete superuser.")
        instance.delete()
