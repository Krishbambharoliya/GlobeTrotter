from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'booking_type', 'booking_date', 'total_price', 'status')
    list_filter = ('booking_type', 'status', 'booking_date')
    search_fields = ('id', 'user__username', 'coupon_applied')

