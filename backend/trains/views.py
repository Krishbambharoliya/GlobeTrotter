import requests
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from .models import Train
from .serializers import TrainSerializer
from .location_loader import search_locations

class TrainListView(generics.ListCreateAPIView):
    queryset = Train.objects.all().order_by('departure_time')
    serializer_class = TrainSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Train.objects.all().order_by('departure_time')
        from_city = self.request.query_params.get('from_city')
        to_city = self.request.query_params.get('to_city')
        departure_date = self.request.query_params.get('departure_date')
        platform = self.request.query_params.get('platform')

        if from_city:
            clean_from = from_city.replace('Railway Station', '').replace('Junction', '').replace('Central', '').replace('Terminus', '').strip()
            first_word = clean_from.split('(')[0].strip().split(' ')[0]
            from django.db.models import Q
            queryset = queryset.filter(Q(source_city__icontains=from_city) | Q(source_city__icontains=clean_from) | Q(source_city__icontains=first_word))
        if to_city:
            clean_to = to_city.replace('Railway Station', '').replace('Junction', '').replace('Central', '').replace('Terminus', '').strip()
            first_word_to = clean_to.split('(')[0].strip().split(' ')[0]
            from django.db.models import Q
            queryset = queryset.filter(Q(destination_city__icontains=to_city) | Q(destination_city__icontains=clean_to) | Q(destination_city__icontains=first_word_to))
        if departure_date:
            queryset = queryset.filter(departure_time__date=departure_date)
        if platform:
            queryset = queryset.filter(departure_platform__icontains=platform)

        return queryset

class TrainDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Train.objects.all()
    serializer_class = TrainSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

class LocationSearchAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '')
        limit = int(request.query_params.get('limit', 50))
        results = search_locations(query, limit=limit)
        return Response(results, status=status.HTTP_200_OK)

class LiveTrainStatusAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, train_number):
        api_key = getattr(settings, 'TRAIN_API_KEY', 'rg_9033efca615d47598abb369bb69f12b0')
        url = f"https://api.railfy.com/v1/trains/{train_number}/status"
        headers = {
            "x-api-key": api_key,
            "Accept": "application/json"
        }
        try:
            resp = requests.get(url, headers=headers, timeout=3)
            if resp.status_code == 200:
                return Response(resp.json(), status=status.HTTP_200_OK)
        except Exception as e:
            print("Live Train API fallback:", e)

        # Fallback simulated response with platform details
        train_obj = Train.objects.filter(train_number=train_number).first()
        platform_info = train_obj.departure_platform if train_obj else "Platform 1"
        return Response({
            "train_number": train_number,
            "status": "On Time",
            "current_station": train_obj.source_city if train_obj else "Origin Station",
            "departure_platform": platform_info,
            "api_key_used": api_key[:10] + "..."
        }, status=status.HTTP_200_OK)
