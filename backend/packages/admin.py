from django.contrib import admin
from .models import Package

@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ('title', 'destination', 'price', 'rating', 'duration', 'category')
    list_filter = ('category', 'destination')
    search_fields = ('title', 'destination', 'description')

