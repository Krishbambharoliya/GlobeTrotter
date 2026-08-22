from django.contrib import admin
from .models import Coupon, Offer

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_percentage', 'max_discount', 'active')
    list_filter = ('active',)
    search_fields = ('code', 'description')

@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ('title', 'discount_tag', 'category')
    list_filter = ('category',)
    search_fields = ('title', 'description')

