from django.urls import path
from .views import TrainListView, TrainDetailView, LocationSearchAPIView, LiveTrainStatusAPIView

urlpatterns = [
    path('', TrainListView.as_view(), name='train_list'),
    path('locations/', LocationSearchAPIView.as_view(), name='train_locations'),
    path('live/<str:train_number>/', LiveTrainStatusAPIView.as_view(), name='live_train_status'),
    path('<int:pk>/', TrainDetailView.as_view(), name='train_detail'),
]
