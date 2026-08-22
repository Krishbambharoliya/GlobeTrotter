from django.db import models
from bookings.models import Booking

class Payment(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='payments')
    payment_id = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=30, default='pending') # pending, completed, failed, refunded
    method = models.CharField(max_length=50) # UPI, Card, NetBanking, Wallet
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.payment_id} - Status: {self.status}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        old_status = None
        if not is_new:
            try:
                old_status = Payment.objects.get(pk=self.pk).status
            except Payment.DoesNotExist:
                pass

        super().save(*args, **kwargs)

        try:
            from notifications.models import Notification
            if is_new and self.status == 'completed':
                Notification.objects.create(
                    user=self.booking.user,
                    title="Payment Successful 💳",
                    message=f"Payment of ₹{self.amount} for booking #{self.booking.id} was successful via {self.method}.",
                    notification_type="Push"
                )
            elif not is_new and old_status != self.status and self.status == 'completed':
                Notification.objects.create(
                    user=self.booking.user,
                    title="Payment Confirmed ✅",
                    message=f"Your payment of ₹{self.amount} (ID: {self.payment_id}) has been marked as {self.status.upper()}.",
                    notification_type="Push"
                )
        except Exception as e:
            print(f"Error creating notification: {e}")

