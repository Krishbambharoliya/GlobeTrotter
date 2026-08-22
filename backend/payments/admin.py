from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('payment_id', 'booking', 'amount', 'status', 'method', 'created_at')
    list_filter = ('status', 'method', 'created_at')
    search_fields = ('payment_id', 'booking__id', 'booking__user__username')

