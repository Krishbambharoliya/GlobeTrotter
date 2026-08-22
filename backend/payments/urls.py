from django.urls import path
from .views import PaymentListCreateView, CreateMockPaymentView, AddWalletMoneyView

urlpatterns = [
    path('', PaymentListCreateView.as_view(), name='payment_list'),
    path('charge/', CreateMockPaymentView.as_view(), name='create_payment'),
    path('add-wallet/', AddWalletMoneyView.as_view(), name='add_wallet_money'),
]
