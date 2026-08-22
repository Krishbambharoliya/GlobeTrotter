from django.contrib import admin
from .models import Flight

@admin.register(Flight)
class FlightAdmin(admin.ModelAdmin):
    list_display = ('airline', 'flight_number', 'departure_city', 'arrival_city', 'departure_time', 'price')
    list_filter = ('airline', 'departure_city', 'arrival_city')
    search_fields = ('airline', 'flight_number', 'departure_city', 'arrival_city')

