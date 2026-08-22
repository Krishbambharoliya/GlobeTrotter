from django.db import models
from django.contrib.auth.models import User

class Trip(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trips')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    cover_photo = models.TextField(blank=True, null=True)
    is_public = models.BooleanField(default=False)
    budget_limit = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class TripStop(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='stops')
    city_name = models.CharField(max_length=150)
    country_name = models.CharField(max_length=150)
    cost_index = models.CharField(max_length=10, default='$$')
    popularity = models.CharField(max_length=100, default='High')
    date = models.DateField()
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'date']

    def __str__(self):
        return f"{self.city_name} ({self.trip.name})"

class TripActivity(models.Model):
    stop = models.ForeignKey(TripStop, on_delete=models.CASCADE, related_name='activities')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=50, default='Sightseeing') # Sightseeing, Lodging, Transport, Meals, Custom
    cost = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    duration_hours = models.DecimalField(max_digits=5, decimal_places=2, default=1.00)
    start_time = models.CharField(max_length=10, default='09:00 AM')
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.name} - {self.stop.city_name}"
