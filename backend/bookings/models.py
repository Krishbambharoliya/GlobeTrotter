from django.db import models
from django.contrib.auth.models import User
from flights.models import Flight
from hotels.models import Hotel
from trains.models import Train
from packages.models import Package
from cars.models import Car
from buses.models import Bus

class Booking(models.Model):
    BOOKING_TYPES = (
        ('flight', 'Flight'),
        ('hotel', 'Hotel'),
        ('train', 'Train'),
        ('package', 'Package'),
        ('car', 'Car'),
        ('bus', 'Bus'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    booking_type = models.CharField(max_length=10, choices=BOOKING_TYPES)
    
    # Links to services
    flight_booking = models.ForeignKey(Flight, on_delete=models.SET_NULL, null=True, blank=True)
    hotel_booking = models.ForeignKey(Hotel, on_delete=models.SET_NULL, null=True, blank=True)
    train_booking = models.ForeignKey(Train, on_delete=models.SET_NULL, null=True, blank=True)
    package_booking = models.ForeignKey(Package, on_delete=models.SET_NULL, null=True, blank=True)
    car_booking = models.ForeignKey(Car, on_delete=models.SET_NULL, null=True, blank=True)
    bus_booking = models.ForeignKey(Bus, on_delete=models.SET_NULL, null=True, blank=True)
    
    booking_date = models.DateTimeField(auto_now_add=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    
    # Custom details for booking
    flight_seats = models.CharField(max_length=100, blank=True, null=True) # e.g. "12A, 12B"
    flight_meal = models.CharField(max_length=100, blank=True, null=True) # e.g. "Veg, Non-Veg"
    flight_baggage = models.CharField(max_length=100, blank=True, null=True) # e.g. "15kg + 7kg"
    
    train_seats = models.CharField(max_length=100, blank=True, null=True) # e.g. "S1, S2"
    bus_seats = models.CharField(max_length=100, blank=True, null=True) # e.g. "12, 13"
    
    car_rental_type = models.CharField(max_length=50, blank=True, null=True) # e.g. "Self Drive"
    rental_start_date = models.DateField(blank=True, null=True)
    rental_end_date = models.DateField(blank=True, null=True)
    
    hotel_room_type = models.CharField(max_length=100, blank=True, null=True) # e.g. "Couple Room (2 People)", "Family Room (4 People)", "Friends Room (6 People)"
    
    coupon_applied = models.CharField(max_length=50, blank=True, null=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    travelers_info = models.TextField(default='[]') # JSON string of travelers details

    def __str__(self):
        return f"Booking #{self.id} - {self.booking_type} for {self.user.username}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        old_status = None
        if not is_new:
            try:
                old_status = Booking.objects.get(pk=self.pk).status
            except Booking.DoesNotExist:
                pass
        
        super().save(*args, **kwargs)
        
        try:
            from notifications.models import Notification
            if is_new:
                Notification.objects.create(
                    user=self.user,
                    title=f"New {self.booking_type.capitalize()} Booking Created 📝",
                    message=f"Your booking for a {self.booking_type} has been created (ID: #{self.id}). Current status: {self.status.capitalize()}.",
                    notification_type="Push"
                )
            elif old_status != self.status:
                emoji = "✅" if self.status == 'confirmed' else "❌" if self.status == 'cancelled' else "ℹ️"
                Notification.objects.create(
                    user=self.user,
                    title=f"Booking Status Updated {emoji}",
                    message=f"Your booking (ID: #{self.id}) status has changed from '{old_status}' to '{self.status}'.",
                    notification_type="Push"
                )
        except Exception as e:
            print(f"Error creating notification: {e}")

