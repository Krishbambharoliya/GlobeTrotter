from django.db import models

class Car(models.Model):
    name = models.CharField(max_length=100)
    car_type = models.CharField(max_length=50) # e.g. Hatchback, Sedan, SUV, Luxury
    transmission = models.CharField(max_length=50, default='Automatic') # Manual, Automatic
    fuel_type = models.CharField(max_length=50, default='Petrol') # Petrol, Diesel, EV, CNG
    rental_type = models.CharField(max_length=50, default='Self Drive') # Self Drive, Driver Included, Airport Pickup, Hourly Rental
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=150.00)
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2, default=1500.00)
    image_url = models.TextField(blank=True, null=True)
    features = models.TextField(default='[]') # JSON list of strings

    def __str__(self):
        return f"{self.name} ({self.rental_type})"
