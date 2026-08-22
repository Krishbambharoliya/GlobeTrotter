from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Review
from .serializers import ReviewSerializer

class ReviewListCreateView(generics.ListCreateAPIView):
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Review.objects.all().order_by('-created_at')
        category = self.request.query_params.get('category')
        target_id = self.request.query_params.get('target_id')
        user_id = self.request.query_params.get('user')
        
        if category:
            queryset = queryset.filter(category=category)
        if target_id:
            queryset = queryset.filter(target_id=target_id)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

from rest_framework.exceptions import PermissionDenied

class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def get_permissions(self):
        return [permissions.AllowAny()]

    def perform_update(self, serializer):
        user = self.request.user
        if not user or not user.is_authenticated:
            raise PermissionDenied("Authentication required.")
        obj = self.get_object()
        if obj.user.id != user.id and not user.is_staff:
            raise PermissionDenied("You do not have permission to edit this review.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if not user or not user.is_authenticated:
            raise PermissionDenied("Authentication required.")
        if instance.user.id != user.id and not user.is_staff:
            raise PermissionDenied("You do not have permission to delete this review.")
        instance.delete()

class LikeReviewView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            review = Review.objects.get(pk=pk)
            review.likes += 1
            review.save()
            return Response(ReviewSerializer(review).data)
        except Review.DoesNotExist:
            return Response({"error": "Review not found"}, status=status.HTTP_404_NOT_FOUND)
