from django.db import models

class Train(models.Model):
    name = models.CharField(max_length=100)
    train_number = models.CharField(max_length=20)
    source_city = models.CharField(max_length=100)
    destination_city = models.CharField(max_length=100)
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    train_type = models.CharField(max_length=50) # e.g. 1AC, 2AC, 3AC, SL
    total_seats = models.IntegerField(default=60)
    available_seats = models.IntegerField(default=60)
    booked_seats = models.TextField(default='[]') # JSON array of booked seat identifiers e.g. ["A1", "A2"]
    departure_platform = models.CharField(max_length=50, default='Platform 1')
    arrival_platform = models.CharField(max_length=50, default='Platform 2')
    district_name = models.CharField(max_length=100, blank=True, null=True)
    sub_district_name = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.train_number}): {self.source_city} ({self.departure_platform}) -> {self.destination_city} ({self.arrival_platform})"
