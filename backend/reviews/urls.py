from django.urls import path
from .views import ReviewListCreateView, ReviewDetailView, LikeReviewView

urlpatterns = [
    path('', ReviewListCreateView.as_view(), name='review_list_create'),
    path('<int:pk>/', ReviewDetailView.as_view(), name='review_detail'),
    path('<int:pk>/like/', LikeReviewView.as_view(), name='like_review'),
]
