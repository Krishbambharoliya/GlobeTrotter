from django.db import models

class Package(models.Model):
    title = models.CharField(max_length=200)
    destination = models.CharField(max_length=150)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    rating = models.FloatField(default=4.5)
    duration = models.CharField(max_length=100) # e.g. "5 Days / 4 Nights"
    image_url = models.CharField(max_length=500, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=50, default='Domestic') # Domestic or International
    itinerary = models.TextField(default='[]') # JSON list of objects: [{"day": 1, "title": "...", "desc": "..."}]
    gallery = models.TextField(default='[]') # JSON list of image URLs

    def __str__(self):
        return f"{self.title} - {self.destination}"
