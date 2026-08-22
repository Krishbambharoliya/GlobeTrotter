from django.contrib import admin
from .models import UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'tier', 'loyalty_points', 'wallet_balance', 'otp_expiry')
    search_fields = ('user__username', 'user__email', 'phone_number')
    list_filter = ('tier',)

