from django.urls import path
from .views import PackageListView, PackageDetailView

urlpatterns = [
    path('', PackageListView.as_view(), name='package_list'),
    path('<int:pk>/', PackageDetailView.as_view(), name='package_detail'),
]
