from django.db import models

class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)
    max_discount = models.DecimalField(max_digits=10, decimal_places=2, default=500.00)
    active = models.BooleanField(default=True)
    description = models.CharField(max_length=250, blank=True, null=True)

    def __str__(self):
        return self.code

class Offer(models.Model):
    title = models.CharField(max_length=150)
    description = models.TextField()
    discount_tag = models.CharField(max_length=50) # e.g. "Flat 12% OFF"
    image_url = models.CharField(max_length=500, blank=True, null=True)
    category = models.CharField(max_length=50, default='flights') # flights, hotels, trains, packages, general

    def __str__(self):
        return self.title
