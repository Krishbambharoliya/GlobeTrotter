from rest_framework import generics, permissions
from .models import Car
from .serializers import CarSerializer

class CarListView(generics.ListCreateAPIView):
    queryset = Car.objects.all().order_by('daily_rate')
    serializer_class = CarSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Car.objects.all().order_by('daily_rate')
        rental_type = self.request.query_params.get('rental_type')
        car_type = self.request.query_params.get('car_type')
        
        if rental_type:
            queryset = queryset.filter(rental_type__iexact=rental_type)
        if car_type:
            queryset = queryset.filter(car_type__iexact=car_type)
            
        return queryset

class CarDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Car.objects.all()
    serializer_class = CarSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
