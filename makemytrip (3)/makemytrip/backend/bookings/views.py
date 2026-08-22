from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Booking
from .serializers import BookingSerializer

class BookingListCreateView(generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if user.is_staff and self.request.query_params.get('all') == 'true':
            return Booking.objects.all().order_by('-booking_date')
        return Booking.objects.filter(user=user).order_by('-booking_date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Booking.objects.all()
        return Booking.objects.filter(user=user)

class BookingCancelView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            user = request.user
            if user.is_staff:
                booking = Booking.objects.get(pk=pk)
            else:
                booking = Booking.objects.get(pk=pk, user=user)
                
            booking.status = 'cancelled'
            booking.save()
            
            # Refund logic - if paid, refund back to MMT Wallet
            profile = booking.user.profile
            profile.wallet_balance += booking.total_price
            profile.save()
            
            return Response(BookingSerializer(booking).data)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found or unauthorized"}, status=status.HTTP_404_NOT_FOUND)

class AdminAnalyticsView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        from django.contrib.auth.models import User
        from django.db.models import Sum, Count
        
        total_bookings = Booking.objects.count()
        confirmed_bookings = Booking.objects.filter(status='confirmed')
        total_revenue = confirmed_bookings.aggregate(Sum('total_price'))['total_price__sum'] or 0.00
        total_users = User.objects.count()
        
        # Revenue by category
        category_revenue = confirmed_bookings.values('booking_type').annotate(
            count=Count('id'),
            revenue=Sum('total_price')
        )
        
        cat_data = {}
        for item in category_revenue:
            cat_data[item['booking_type']] = {
                "count": item['count'],
                "revenue": float(item['revenue'] or 0)
            }
            
        for category in ['flight', 'hotel', 'train', 'package', 'car', 'bus']:
            if category not in cat_data:
                cat_data[category] = {"count": 0, "revenue": 0.0}

        # Calculate staff and normal user counts
        total_staff = User.objects.filter(is_staff=True).count()
        total_normal_users = total_users - total_staff

        # Three graphs using uniform value key
        import datetime
        now = datetime.datetime.now()
        
        # Get requested year from query params
        year_param = request.query_params.get('year')
        try:
            current_year = int(year_param) if year_param else now.year
        except ValueError:
            current_year = now.year

        # If it's a past year, show all 12 months, else show up to current month
        if current_year < now.year:
            limit_months = 12
        elif current_year > now.year:
            limit_months = 0
        else:
            limit_months = now.month

        # Unique booking years in DB
        booking_years = list(Booking.objects.dates('booking_date', 'year'))
        years_list = sorted(list(set([y.year for y in booking_years] + [now.year])))

        month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        
        revenue_graph = []
        bookings_graph = []
        accounts_graph = []
        
        from django.db.models import Q
        for i in range(limit_months):
            m_num = i + 1
            m_name = month_names[i]
            
            # Query actual revenue in month `m_num` of current_year
            month_revenue = confirmed_bookings.filter(
                booking_date__year=current_year,
                booking_date__month=m_num
            ).aggregate(Sum('total_price'))['total_price__sum'] or 0.00
            
            # Query actual bookings in month `m_num` of current_year
            month_bookings = Booking.objects.filter(
                booking_date__year=current_year,
                booking_date__month=m_num
            ).count()
            
            # Query actual cumulative normal users (is_staff=False) up to month `m_num` of current_year
            month_users = User.objects.filter(
                Q(is_staff=False) & (
                    Q(date_joined__year__lt=current_year) |
                    Q(date_joined__year=current_year, date_joined__month__lte=m_num)
                )
            ).count()
            
            revenue_graph.append({"month": m_name, "value": float(month_revenue)})
            bookings_graph.append({"month": m_name, "value": int(month_bookings)})
            accounts_graph.append({"month": m_name, "value": int(month_users)})

        # Total revenue for the selected year
        selected_year_revenue = confirmed_bookings.filter(booking_date__year=current_year).aggregate(Sum('total_price'))['total_price__sum'] or 0.00
        # Total bookings for the selected year
        selected_year_bookings = Booking.objects.filter(booking_date__year=current_year).count()

        return Response({
            "total_bookings": total_bookings,
            "total_users": total_users,
            "total_staff": total_staff,
            "total_normal_users": total_normal_users,
            "total_revenue": float(total_revenue),
            "category_stats": cat_data,
            "revenue_graph": revenue_graph,
            "bookings_graph": bookings_graph,
            "accounts_graph": accounts_graph,
            "available_years": years_list,
            "selected_year": current_year,
            "selected_year_revenue": float(selected_year_revenue),
            "selected_year_bookings": selected_year_bookings
        })
