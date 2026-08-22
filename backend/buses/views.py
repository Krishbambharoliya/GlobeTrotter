from rest_framework import generics, permissions
from .models import Bus
from .serializers import BusSerializer

class BusListView(generics.ListCreateAPIView):
    queryset = Bus.objects.all().order_by('price')
    serializer_class = BusSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Bus.objects.all().order_by('price')
        source_city = self.request.query_params.get('source_city')
        destination_city = self.request.query_params.get('destination_city')
        
        if source_city:
            queryset = queryset.filter(source_city__iexact=source_city)
        if destination_city:
            queryset = queryset.filter(destination_city__iexact=destination_city)
            
        return queryset

class BusDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
