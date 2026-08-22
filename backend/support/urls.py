from django.urls import path
from .views import (
    FAQListView, 
    ContactMessageCreateView,
    ContactMessageListView,
    ContactMessageDestroyView,
    AIChatbotView,
    AITripPlannerView,
    AIWeatherSuggestionView
)

urlpatterns = [
    path('faqs/', FAQListView.as_view(), name='faq_list'),
    path('contact/', ContactMessageCreateView.as_view(), name='contact_create'),
    path('inquiries/', ContactMessageListView.as_view(), name='inquiries_list'),
    path('inquiries/<int:pk>/', ContactMessageDestroyView.as_view(), name='inquiries_destroy'),
    path('ai/chat/', AIChatbotView.as_view(), name='ai_chat'),
    path('ai/plan/', AITripPlannerView.as_view(), name='ai_plan'),
    path('ai/weather/', AIWeatherSuggestionView.as_view(), name='ai_weather'),
]
