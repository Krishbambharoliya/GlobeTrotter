from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Coupon, Offer
from .serializers import CouponSerializer, OfferSerializer

class OfferListView(generics.ListCreateAPIView):
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        category = self.request.query_params.get('category')
        if category:
            return Offer.objects.filter(category__iexact=category)
        return Offer.objects.all()

class OfferDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

class CouponListView(generics.ListCreateAPIView):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

class CouponDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

class ValidateCouponView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response({"error": "Code is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            coupon = Coupon.objects.get(code__iexact=code, active=True)
            return Response(CouponSerializer(coupon).data)
        except Coupon.DoesNotExist:
            return Response({"error": "Invalid or inactive coupon code"}, status=status.HTTP_404_NOT_FOUND)
