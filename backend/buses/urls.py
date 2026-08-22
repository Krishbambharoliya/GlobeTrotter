from django.urls import path
from .views import BusListView, BusDetailView

urlpatterns = [
    path('', BusListView.as_view(), name='bus_list'),
    path('<int:pk>/', BusDetailView.as_view(), name='bus_detail'),
]
