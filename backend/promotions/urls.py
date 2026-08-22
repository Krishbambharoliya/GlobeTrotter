from django.urls import path
from .views import (
    OfferListView, OfferDetailView, 
    CouponListView, CouponDetailView,
    ValidateCouponView
)

urlpatterns = [
    path('offers/', OfferListView.as_view(), name='offer_list'),
    path('offers/<int:pk>/', OfferDetailView.as_view(), name='offer_detail'),
    path('coupons/', CouponListView.as_view(), name='coupon_list'),
    path('coupons/<int:pk>/', CouponDetailView.as_view(), name='coupon_detail'),
    path('validate/', ValidateCouponView.as_view(), name='validate_coupon'),
]
