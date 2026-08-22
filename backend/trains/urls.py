from django.urls import path
from .views import TrainListView, TrainDetailView

urlpatterns = [
    path('', TrainListView.as_view(), name='train_list'),
    path('<int:pk>/', TrainDetailView.as_view(), name='train_detail'),
]
