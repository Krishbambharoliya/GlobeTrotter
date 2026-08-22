from django.contrib import admin
from .models import Hotel

@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'address', 'price_per_night', 'rating')
    list_filter = ('city', 'rating')
    search_fields = ('name', 'city', 'address')

