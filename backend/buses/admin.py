from django.contrib import admin
from .models import Bus

@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ('operator', 'bus_number', 'source_city', 'destination_city', 'departure_time', 'price', 'bus_type', 'available_seats')
    list_filter = ('bus_type', 'source_city', 'destination_city')
    search_fields = ('operator', 'bus_number', 'source_city', 'destination_city')
