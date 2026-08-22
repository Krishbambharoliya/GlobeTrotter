from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import FAQ, ContactMessage
from .serializers import FAQSerializer, ContactMessageSerializer
import random

class FAQListView(generics.ListAPIView):
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    permission_classes = (permissions.AllowAny,)

class ContactMessageCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = (permissions.AllowAny,)

class ContactMessageListView(generics.ListAPIView):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer
    permission_classes = (permissions.IsAdminUser,)

class ContactMessageDestroyView(generics.DestroyAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = (permissions.IsAdminUser,)

# AI Chatbot simulation
class AIChatbotView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        message = request.data.get('message', '').lower()
        
        responses = [
            "I'd love to help you plan your next getaway! Are you looking for beach resorts, mountain hikes, or cultural cities?",
            "GlobeTrotter Black VIP members get access to premium lounge bookings! Let me know if you'd like to search flights for that.",
            "Goa and Kashmir are our top domestic picks this week! Bali and Switzerland are the trending international packages.",
            "You can apply coupons like GTFLIGHT or GTHOTEL during checkout to save up to 25% on your booking!",
            "I can calculate a custom budget for you! Try using the Budget Calculator tab on our AI page."
        ]
        
        reply = random.choice(responses)
        if 'flight' in message:
            reply = "You can search for one-way or round-trip flights directly on our home page. We have airlines like Air India, Vistara, and IndiGo seeded with the latest live pricing."
        elif 'hotel' in message or 'stay' in message:
            reply = "We offer premium hotels in Delhi, Mumbai, Bengaluru, and Goa. You can filter by ratings and view photos. Bookings are fully manageable from your profile dashboard."
        elif 'cancel' in message or 'refund' in message:
            reply = "Cancellations can be made instantly in the 'My Bookings' section of your Dashboard. Refunds are credited back to your MMT Wallet immediately."
        elif 'discount' in message or 'coupon' in message or 'offer' in message:
            reply = "Currently active coupons are MMTFLIGHT (15% off flights), MMTHOTEL (25% off hotels), and MMTTRAIN (10% off train tickets). Apply them in your Booking Details page!"
            
        return Response({"reply": reply})

# AI Trip Planner simulation
class AITripPlannerView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        destination = request.data.get('destination', 'Goa')
        budget = float(request.data.get('budget', 10000))
        days = int(request.data.get('days', 3))
        
        hotel_tier = "Budget Guesthouse"
        flight_tier = "Economy Flight"
        activities = []
        
        if budget > 80000:
            hotel_tier = "5-Star Luxury Resort (Taj/Leela)"
            flight_tier = "Premium Vistara / Business Class Flight"
            activities = ["Private sightseeing tour", "Premium cruise with dining", "Fine-dine reservations"]
        elif budget > 30000:
            hotel_tier = "4-Star Business Hotel (Radisson/Trident)"
            flight_tier = "Standard IndiGo Flight"
            activities = ["Group local sightseeing", "Adventure water sports", "Famous local markets visit"]
        else:
            hotel_tier = "Cozy Homestay / 3-Star Hotel"
            flight_tier = "Early-morning saver flight"
            activities = ["Self-guided walking tours", "Beach visits & street food hopping", "Public transit exploration"]
            
        itinerary = []
        for d in range(1, days + 1):
            itinerary.append({
                "day": d,
                "title": f"Explore {destination} - Day {d}",
                "desc": f"Enjoy sightseeing at main attractions. Recommended activity: {activities[d % len(activities)] if activities else 'Leisure walk'}."
            })
            
        weather_tips = [
            f"Expected weather in {destination}: Sunny & pleasant (26°C). Perfect for outdoor visits.",
            f"Expected weather in {destination}: Light showers expected. Carry an umbrella or plan indoor visits.",
            f"Expected weather in {destination}: Warm & breezy (30°C). Drink plenty of water and wear sunscreen."
        ]
        
        return Response({
            "destination": destination,
            "days": days,
            "budget_tier": "Premium" if budget > 80000 else "Standard" if budget > 30000 else "Budget",
            "recommended_flight": flight_tier,
            "recommended_hotel": hotel_tier,
            "itinerary": itinerary,
            "weather_suggestion": random.choice(weather_tips)
        })

# AI Weather View
class AIWeatherSuggestionView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        city = request.query_params.get('city', 'New Delhi')
        weather_states = [
            {"temp": "28°C", "condition": "Sunny", "humidity": "60%", "tip": "Great day for outdoor walks and sightseeing!"},
            {"temp": "22°C", "condition": "Overcast", "humidity": "75%", "tip": "Cooler winds. Ideal for cafe hops and city tours."},
            {"temp": "31°C", "condition": "Humid", "humidity": "85%", "tip": "Bring water and wear breathable light clothes."},
            {"temp": "24°C", "condition": "Light Rain", "humidity": "90%", "tip": "Grab an umbrella. Great day for museum visits!"}
        ]
        return Response({
            "city": city,
            "weather": random.choice(weather_states)
        })
