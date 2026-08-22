from django.contrib import admin
from .models import Car

@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ('name', 'car_type', 'transmission', 'fuel_type', 'rental_type', 'hourly_rate', 'daily_rate')
    list_filter = ('car_type', 'transmission', 'fuel_type', 'rental_type')
    search_fields = ('name',)

