from rest_framework import generics, permissions
from .models import Train
from .serializers import TrainSerializer

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
        
        if from_city:
            queryset = queryset.filter(source_city__icontains=from_city)
        if to_city:
            queryset = queryset.filter(destination_city__icontains=to_city)
        if departure_date:
            queryset = queryset.filter(departure_time__date=departure_date)
            
        return queryset

class TrainDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Train.objects.all()
    serializer_class = TrainSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
