from django.db import models

class Flight(models.Model):
    flight_number = models.CharField(max_length=20)
    airline = models.CharField(max_length=100)
    departure_city = models.CharField(max_length=100)
    arrival_city = models.CharField(max_length=100)
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.airline} {self.flight_number} ({self.departure_city} -> {self.arrival_city})"
