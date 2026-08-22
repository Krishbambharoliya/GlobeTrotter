from django.db import models

class Bus(models.Model):
    operator = models.CharField(max_length=100)
    bus_number = models.CharField(max_length=20)
    source_city = models.CharField(max_length=100)
    destination_city = models.CharField(max_length=100)
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    bus_type = models.CharField(max_length=50)
    total_seats = models.IntegerField(default=30)
    available_seats = models.IntegerField(default=30)
    booked_seats = models.TextField(default='[]')

    def __str__(self):
        return f"{self.operator} ({self.bus_number}) - {self.source_city} to {self.destination_city}"
