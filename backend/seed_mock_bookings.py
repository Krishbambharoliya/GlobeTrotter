import os
import django
import random
import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from bookings.models import Booking
from flights.models import Flight
from hotels.models import Hotel
from trains.models import Train
from packages.models import Package
from cars.models import Car
from buses.models import Bus

def seed_data():
    user = User.objects.filter(is_superuser=False).first()
    if not user:
        user = User.objects.first()
    if not user:
        print("No users found in database. Please register/create a user first.")
        return
        
    print(f"Using user '{user.username}' for seeder bookings.")

    # Time frame: July 2025 to June 2026
    # 2025: Months 7, 8, 9, 10, 11, 12
    # 2026: Months 1, 2, 3, 4, 5, 6
    months_list = [
        (2025, 7), (2025, 8), (2025, 9), (2025, 10), (2025, 11), (2025, 12),
        (2026, 1), (2026, 2), (2026, 3), (2026, 4), (2026, 5), (2026, 6)
    ]

    booking_types = ['flight', 'hotel', 'train', 'package', 'car', 'bus']
    
    total_created = 0
    total_revenue_added = 0.0

    for year, month in months_list:
        # Create between 6 to 14 bookings per month
        num_bookings = random.randint(6, 14)
        print(f"Generating {num_bookings} bookings for {year}-{month:02d}...")

        for _ in range(num_bookings):
            b_type = random.choice(booking_types)
            status_choice = random.choice(['confirmed', 'confirmed', 'confirmed', 'confirmed', 'confirmed', 'confirmed', 'confirmed', 'confirmed', 'confirmed', 'cancelled'])
            
            # Fetch random service instance
            flight_obj = Flight.objects.order_by('?').first() if b_type == 'flight' else None
            hotel_obj = Hotel.objects.order_by('?').first() if b_type == 'hotel' else None
            train_obj = Train.objects.order_by('?').first() if b_type == 'train' else None
            package_obj = Package.objects.order_by('?').first() if b_type == 'package' else None
            car_obj = Car.objects.order_by('?').first() if b_type == 'car' else None
            bus_obj = Bus.objects.order_by('?').first() if b_type == 'bus' else None

            # Generate realistic price
            if b_type == 'flight':
                price = random.randint(3500, 15000)
            elif b_type == 'hotel':
                price = random.randint(1500, 8000)
            elif b_type == 'train':
                price = random.randint(500, 3000)
            elif b_type == 'package':
                price = random.randint(12000, 45000)
            elif b_type == 'car':
                price = random.randint(1500, 6000)
            else: # bus
                price = random.randint(600, 2500)

            # Create booking
            booking = Booking.objects.create(
                user=user,
                booking_type=b_type,
                flight_booking=flight_obj,
                hotel_booking=hotel_obj,
                train_booking=train_obj,
                package_booking=package_obj,
                car_booking=car_obj,
                bus_booking=bus_obj,
                total_price=price,
                status=status_choice
            )

            # Set random date in that month
            day = random.randint(1, 28)
            hour = random.randint(9, 21)
            minute = random.randint(0, 59)
            booking_datetime = datetime.datetime(year, month, day, hour, minute)

            # Bypassing auto_now_add via update
            Booking.objects.filter(id=booking.id).update(booking_date=booking_datetime)

            total_created += 1
            if status_choice == 'confirmed':
                total_revenue_added += price

    print(f"SUCCESS: Created {total_created} bookings with total revenue {total_revenue_added:,.2f}")

if __name__ == '__main__':
    seed_data()
