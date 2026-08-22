from rest_framework import generics, permissions
from .models import Flight
from .serializers import FlightSerializer

class FlightListView(generics.ListCreateAPIView):
    queryset = Flight.objects.all().order_by('departure_time')
    serializer_class = FlightSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Flight.objects.all().order_by('departure_time')
        from_city = self.request.query_params.get('from_city')
        to_city = self.request.query_params.get('to_city')
        departure_date = self.request.query_params.get('departure_date')
        
        if from_city:
            queryset = queryset.filter(departure_city__icontains=from_city)
        if to_city:
            queryset = queryset.filter(arrival_city__icontains=to_city)
        if departure_date:
            queryset = queryset.filter(departure_time__date=departure_date)
            
        return queryset

class FlightDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Flight.objects.all()
    serializer_class = FlightSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
