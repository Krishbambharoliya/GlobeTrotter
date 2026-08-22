from rest_framework import serializers
from .models import Booking
from flights.serializers import FlightSerializer
from hotels.serializers import HotelSerializer
from trains.serializers import TrainSerializer
from packages.serializers import PackageSerializer
from cars.serializers import CarSerializer
from buses.serializers import BusSerializer

class BookingSerializer(serializers.ModelSerializer):
    flight_details = FlightSerializer(source='flight_booking', read_only=True)
    hotel_details = HotelSerializer(source='hotel_booking', read_only=True)
    train_details = TrainSerializer(source='train_booking', read_only=True)
    package_details = PackageSerializer(source='package_booking', read_only=True)
    car_details = CarSerializer(source='car_booking', read_only=True)
    bus_details = BusSerializer(source='bus_booking', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Booking
        fields = (
            'id', 'user', 'username', 'booking_type', 
            'flight_booking', 'hotel_booking', 'train_booking', 'package_booking', 'car_booking', 'bus_booking',
            'booking_date', 'total_price', 'status', 
            'flight_seats', 'flight_meal', 'flight_baggage',
            'train_seats', 'bus_seats',
            'car_rental_type', 'rental_start_date', 'rental_end_date',
            'hotel_room_type',
            'coupon_applied', 'discount_amount', 'travelers_info',
            'flight_details', 'hotel_details', 'train_details', 'package_details', 'car_details', 'bus_details'
        )
        read_only_fields = ('user', 'booking_date')
