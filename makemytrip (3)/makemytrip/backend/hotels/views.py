from rest_framework import generics, permissions
from .models import Hotel
from .serializers import HotelSerializer

class HotelListView(generics.ListCreateAPIView):
    queryset = Hotel.objects.all().order_by('-rating')
    serializer_class = HotelSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Hotel.objects.all().order_by('-rating')
        city = self.request.query_params.get('city')
        if city:
            queryset = queryset.filter(city__icontains=city)
        return queryset

class HotelDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Hotel.objects.all()
    serializer_class = HotelSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
