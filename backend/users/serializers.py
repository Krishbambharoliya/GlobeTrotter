from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('phone_number', 'avatar_url', 'tier', 'loyalty_points', 'wallet_balance', 'saved_travelers')

class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=False)
    profile = UserProfileSerializer(read_only=True)
    phone_number = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'password', 'profile', 'is_staff', 'is_active', 'phone_number')

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")
        email = value.strip().lower()
        
        queryset = User.objects.filter(email__iexact=email)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("An account with this email address already exists.")
        return email

    def create(self, validated_data):
        phone_number = validated_data.pop('phone_number', '')
        is_staff = validated_data.pop('is_staff', False)
        is_active = validated_data.pop('is_active', True)
        
        email = validated_data.get('email', '').strip().lower()
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=email,
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        user.is_staff = is_staff
        user.is_active = is_active
        user.save()
        
        if phone_number:
            profile = user.profile
            profile.phone_number = phone_number
            profile.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        return super().update(instance, validated_data)
