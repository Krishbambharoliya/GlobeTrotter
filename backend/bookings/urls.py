from django.urls import path
from .views import (
    BookingListCreateView, 
    BookingCancelView, 
    BookingDetailView,
    AdminAnalyticsView
)

urlpatterns = [
    path('', BookingListCreateView.as_view(), name='booking_list_create'),
    path('<int:pk>/', BookingDetailView.as_view(), name='booking_detail'),
    path('<int:pk>/cancel/', BookingCancelView.as_view(), name='booking_cancel'),
    path('analytics/', AdminAnalyticsView.as_view(), name='admin_analytics'),
]
