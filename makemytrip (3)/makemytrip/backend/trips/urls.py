from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripViewSet, DestinationListView, PublicTripDetailView

router = DefaultRouter()
router.register(r'trips', TripViewSet, basename='trip')

urlpatterns = [
    path('destinations/', DestinationListView.as_view(), name='destinations'),
    path('trips/public-detail/<int:pk>/', PublicTripDetailView.as_view(), name='public-trip-detail'),
    path('', include(router.urls)),
]
