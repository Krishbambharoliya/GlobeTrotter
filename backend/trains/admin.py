from django.contrib import admin
from .models import Train

@admin.register(Train)
class TrainAdmin(admin.ModelAdmin):
    list_display = ('name', 'train_number', 'source_city', 'destination_city', 'departure_time', 'price', 'train_type', 'available_seats')
    search_fields = ('name', 'train_number', 'source_city', 'destination_city')
    list_filter = ('train_type', 'source_city', 'destination_city')

