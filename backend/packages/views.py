from rest_framework import generics, permissions
from .models import Package
from .serializers import PackageSerializer

class PackageListView(generics.ListCreateAPIView):
    queryset = Package.objects.all().order_by('-rating')
    serializer_class = PackageSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Package.objects.all().order_by('-rating')
        destination = self.request.query_params.get('destination')
        category = self.request.query_params.get('category')
        
        if destination:
            queryset = queryset.filter(destination__icontains=destination)
        if category:
            queryset = queryset.filter(category__iexact=category)
            
        return queryset

class PackageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
