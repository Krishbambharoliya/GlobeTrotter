import random
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Trip, TripStop, TripActivity
from .serializers import TripSerializer

# Seed data for Destinations & Activities
SEED_DESTINATIONS = [
    {"city_name": "Paris", "country_name": "France", "cost_index": "$$$", "popularity": "Extreme", "activities": [
        {"name": "Eiffel Tower Summit Access", "category": "Sightseeing", "cost": 45.00, "duration_hours": 2.5},
        {"name": "Louvre Museum Audio Tour", "category": "Sightseeing", "cost": 25.00, "duration_hours": 3.0},
        {"name": "Seine River Dinner Cruise", "category": "Meals", "cost": 95.00, "duration_hours": 2.0},
        {"name": "Fresh Croissant Pastry Class", "category": "Food", "cost": 65.00, "duration_hours": 1.5}
    ]},
    {"city_name": "Tokyo", "country_name": "Japan", "cost_index": "$$", "popularity": "Very High", "activities": [
        {"name": "Shibuya Sky Observation Deck", "category": "Sightseeing", "cost": 15.00, "duration_hours": 1.5},
        {"name": "Tsukiji Outer Market Food Tour", "category": "Food", "cost": 50.00, "duration_hours": 2.0},
        {"name": "TeamLab Planets Digital Art Entry", "category": "Sightseeing", "cost": 28.00, "duration_hours": 2.0},
        {"name": "Bullet Train Ticket to Kyoto", "category": "Transport", "cost": 110.00, "duration_hours": 2.5}
    ]},
    {"city_name": "Rome", "country_name": "Italy", "cost_index": "$$", "popularity": "High", "activities": [
        {"name": "Colosseum & Roman Forum Walk", "category": "Sightseeing", "cost": 30.00, "duration_hours": 3.0},
        {"name": "Vatican Museums & Sistine Chapel", "category": "Sightseeing", "cost": 35.00, "duration_hours": 3.5},
        {"name": "Gelato & Pasta Making Class", "category": "Food", "cost": 55.00, "duration_hours": 2.5}
    ]},
    {"city_name": "Goa", "country_name": "India", "cost_index": "$", "popularity": "High", "activities": [
        {"name": "Scuba Diving at Grande Island", "category": "Adventure", "cost": 40.00, "duration_hours": 5.0},
        {"name": "Mandovi River Sunset Cruise", "category": "Sightseeing", "cost": 10.00, "duration_hours": 1.5},
        {"name": "Traditional Goan Fish Curry Lunch", "category": "Meals", "cost": 8.00, "duration_hours": 1.0}
    ]},
    {"city_name": "London", "country_name": "United Kingdom", "cost_index": "$$$", "popularity": "Very High", "activities": [
        {"name": "Warner Bros. Studio Tour (Harry Potter)", "category": "Sightseeing", "cost": 75.00, "duration_hours": 4.5},
        {"name": "London Eye Ride", "category": "Sightseeing", "cost": 40.00, "duration_hours": 1.0},
        {"name": "Afternoon Tea at The Ritz", "category": "Meals", "cost": 90.00, "duration_hours": 2.0}
    ]},
    {"city_name": "New York", "country_name": "United States", "cost_index": "$$$", "popularity": "Extreme", "activities": [
        {"name": "Empire State Building Deck", "category": "Sightseeing", "cost": 48.00, "duration_hours": 1.5},
        {"name": "Broadway Show ticket", "category": "Custom", "cost": 120.00, "duration_hours": 3.0},
        {"name": "Metropolitan Museum of Art", "category": "Sightseeing", "cost": 30.00, "duration_hours": 2.5}
    ]},
    {"city_name": "Bali", "country_name": "Indonesia", "cost_index": "$", "popularity": "Very High", "activities": [
        {"name": "Ubud Monkey Forest Walk", "category": "Sightseeing", "cost": 6.00, "duration_hours": 2.0},
        {"name": "Mount Batur Volcano Sunrise Trek", "category": "Adventure", "cost": 35.00, "duration_hours": 6.0},
        {"name": "Balinese Massage Spa Treatment", "category": "Custom", "cost": 20.00, "duration_hours": 1.5}
    ]}
]

class DestinationListView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return Response(SEED_DESTINATIONS, status=status.HTTP_200_OK)

class TripViewSet(viewsets.ModelViewSet):
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can view their own trips, or public trips
        return Trip.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['GET'], permission_classes=[permissions.AllowAny])
    def public(self, request):
        public_trips = Trip.objects.filter(is_public=True)
        serializer = self.get_serializer(public_trips, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['POST'])
    def copy(self, request, pk=None):
        source_trip = get_object_or_404(Trip, pk=pk, is_public=True)
        
        # Create a deep copy of the trip for the requesting user
        copied_trip = Trip.objects.create(
            user=request.user,
            name=f"Copy of {source_trip.name}",
            description=source_trip.description,
            start_date=source_trip.start_date,
            end_date=source_trip.end_date,
            cover_photo=source_trip.cover_photo,
            is_public=False,
            budget_limit=source_trip.budget_limit
        )

        for stop in source_trip.stops.all():
            copied_stop = TripStop.objects.create(
                trip=copied_trip,
                city_name=stop.city_name,
                country_name=stop.country_name,
                cost_index=stop.cost_index,
                popularity=stop.popularity,
                date=stop.date,
                order=stop.order
            )
            for activity in stop.activities.all():
                TripActivity.objects.create(
                    stop=copied_stop,
                    name=activity.name,
                    description=activity.description,
                    category=activity.category,
                    cost=activity.cost,
                    duration_hours=activity.duration_hours,
                    start_time=activity.start_time,
                    order=activity.order
                )

        serializer = self.get_serializer(copied_trip)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class PublicTripDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk=None):
        trip = get_object_or_404(Trip, pk=pk, is_public=True)
        serializer = TripSerializer(trip)
        return Response(serializer.data, status=status.HTTP_200_OK)
