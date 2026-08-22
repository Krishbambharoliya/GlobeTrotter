from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'user', 'username', 'category', 'target_id', 'rating', 'comment', 'likes', 'image_url', 'created_at')
        read_only_fields = ('user',)
