import os
import django
import random
from datetime import datetime, timedelta

# Set up django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from flights.models import Flight
from hotels.models import Hotel
from trains.models import Train
from packages.models import Package
from cars.models import Car
from buses.models import Bus
from promotions.models import Coupon, Offer
from support.models import FAQ
from reviews.models import Review

def seed_users():
    print("Seeding Users...")
    User.objects.filter(username__in=['admin', 'user']).delete()
    
    # Seed Admin
    admin = User.objects.create_superuser('admin', 'admin@globetrotter.com', 'AdminPassword123', first_name='GT', last_name='Administrator')
    if hasattr(admin, 'profile'):
        admin.profile.wallet_balance = 5000.00
        admin.profile.tier = "GT Black VIP"
        admin.profile.loyalty_points = 2500
        admin.profile.phone_number = "9876543210"
        admin.profile.save()
        
    # Seed standard User
    user = User.objects.create_user('user', 'user@globetrotter.com', 'UserPassword123', first_name='John', last_name='Doe')
    if hasattr(user, 'profile'):
        user.profile.wallet_balance = 2000.00
        user.profile.tier = "GT Member"
        user.profile.loyalty_points = 500
        user.profile.phone_number = "9876543211"
        user.profile.save()
        
    print("Successfully seeded users!")

def seed_flights():
    print("Seeding Flights...")
    Flight.objects.all().delete()
    
    cities = ['New Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Chennai', 'Goa']
    airlines = [
        {'name': 'IndiGo', 'code': '6E'},
        {'name': 'Air India', 'code': 'AI'},
        {'name': 'Vistara', 'code': 'UK'},
        {'name': 'SpiceJet', 'code': 'SG'}
    ]

    base_time = datetime.now()
    flight_count = 0

    for i in range(0, 6):  # next 6 days (including today)
        date = base_time + timedelta(days=i)
        for dep_city in cities:
            for arr_city in cities:
                if dep_city == arr_city:
                    continue
                # Create a flight for each airline
                for index, airline in enumerate(airlines):
                    flight_num = f"{airline['code']}-{100 + flight_count}"
                    dep_time = datetime(date.year, date.month, date.day, 6 + (index * 4), 0)
                    arr_time = dep_time + timedelta(hours=2, minutes=30)
                    price = 3500 + (index * 800) + (150 * (flight_count % 10))
                    
                    Flight.objects.create(
                        flight_number=flight_num,
                        airline=airline['name'],
                        departure_city=dep_city,
                        arrival_city=arr_city,
                        departure_time=dep_time,
                        arrival_time=arr_time,
                        price=price
                    )
                    flight_count += 1
                    
    print(f"Successfully seeded {flight_count} flights!")

def seed_hotels():
    print("Seeding Hotels...")
    Hotel.objects.all().delete()
    
    hotels_data = [
        # New Delhi
        {'name': 'Taj Palace', 'city': 'New Delhi', 'address': 'Sardar Patel Marg, Diplomatic Enclave', 'price': 9500, 'rating': 4.8, 'img': 'https://images.unsplash.com/photo-1566073771259-6a8506099945'},
        {'name': 'The Leela Palace', 'city': 'New Delhi', 'address': 'Chanakyapuri, Diplomatic Enclave', 'price': 12000, 'rating': 4.9, 'img': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'},
        {'name': 'Radisson Blu Plaza', 'city': 'New Delhi', 'address': 'National Highway 8, Mahipalpur', 'price': 5500, 'rating': 4.3, 'img': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'},
        
        # Mumbai
        {'name': 'The Taj Mahal Palace', 'city': 'Mumbai', 'address': 'Apollo Bandar, Colaba', 'price': 14000, 'rating': 4.9, 'img': 'https://images.unsplash.com/photo-1582719508461-905c673771fd'},
        {'name': 'Trident Nariman Point', 'city': 'Mumbai', 'address': 'CR 2 Nariman Point, Netaji Subhash Chandra Bose Rd', 'price': 8000, 'rating': 4.6, 'img': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa'},
        {'name': 'The Oberoi', 'city': 'Mumbai', 'address': 'Nariman Point', 'price': 13500, 'rating': 4.8, 'img': 'https://images.unsplash.com/photo-1564507592333-c60657eea523'},
        
        # Bengaluru
        {'name': 'JW Marriott Hotel', 'city': 'Bengaluru', 'address': '24/1, Vittal Mallya Rd, Shanthala Nagar', 'price': 9000, 'rating': 4.7, 'img': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d'},
        {'name': 'The Oberoi Bengaluru', 'city': 'Bengaluru', 'address': '37-39, Mahatma Gandhi Rd', 'price': 10500, 'rating': 4.8, 'img': 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6'},
        
        # Goa
        {'name': 'Taj Exotica Resort & Spa', 'city': 'Goa', 'address': 'Calwaddo, Benaulim', 'price': 15000, 'rating': 4.9, 'img': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461'},
        {'name': 'Caravela Beach Resort', 'city': 'Goa', 'address': 'Varca Beach, Salcete', 'price': 7500, 'rating': 4.4, 'img': 'https://images.unsplash.com/photo-1618773928121-c32242e63f39'},
        {'name': 'Novotel Goa Resort & Spa', 'city': 'Goa', 'address': 'Pinto Waddo, Candolim', 'price': 6200, 'rating': 4.2, 'img': 'https://images.unsplash.com/photo-1606046604972-77cc76aee944'}
    ]

    hotel_count = 0
    for h in hotels_data:
        Hotel.objects.create(
            name=h['name'],
            city=h['city'],
            address=h['address'],
            price_per_night=h['price'],
            rating=h['rating'],
            image_url=h['img']
        )
        hotel_count += 1
        
    print(f"Successfully seeded {hotel_count} hotels!")

def seed_trains():
    print("Seeding Trains...")
    Train.objects.all().delete()
    cities = ['New Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Chennai', 'Goa']
    train_names = [
        {'name': 'Rajdhani Express', 'num': '12431'},
        {'name': 'Shatabdi Express', 'num': '12002'},
        {'name': 'Duronto Express', 'num': '12267'},
        {'name': 'Garib Rath', 'num': '12909'},
        {'name': 'Tejas Express', 'num': '22119'}
    ]
    types = ['1AC (AC First Class)', '2AC (AC Two Tier)', '3AC (AC Three Tier)', 'SL (Sleeper Class)']
    
    base_time = datetime.now()
    train_count = 0
    
    for i in range(0, 6): # next 6 days (including today)
        date = base_time + timedelta(days=i)
        for dep in cities:
            for arr in cities:
                if dep == arr:
                    continue
                # Create 2 trains per route
                for index in range(2):
                    train_info = train_names[random.randint(0, len(train_names)-1)]
                    train_type = types[random.randint(0, len(types)-1)]
                    dep_time = datetime(date.year, date.month, date.day, 8 + (index * 10), 0)
                    arr_time = dep_time + timedelta(hours=8, minutes=30)
                    price = 600 + (index * 500) + random.randint(50, 200)
                    
                    Train.objects.create(
                        name=train_info['name'],
                        train_number=train_info['num'],
                        source_city=dep,
                        destination_city=arr,
                        departure_time=dep_time,
                        arrival_time=arr_time,
                        price=price,
                        train_type=train_type,
                        total_seats=60,
                        available_seats=random.randint(5, 60),
                        booked_seats='[]'
                    )
                    train_count += 1
    print(f"Successfully seeded {train_count} trains!")

def seed_packages():
    print("Seeding Packages...")
    Package.objects.all().delete()
    
    packages_data = [
        {
            'title': 'Kashmir Paradise Tour',
            'destination': 'Kashmir',
            'price': 15999,
            'rating': 4.7,
            'duration': '5 Days / 4 Nights',
            'img': 'https://images.unsplash.com/photo-1566837430420-9de97abaf222',
            'desc': 'Experience heaven on Earth with shikara rides, snow activities in Gulmarg, and houseboats in Srinagar.',
            'cat': 'Domestic',
            'itinerary': '[{"day": 1, "title": "Arrival in Srinagar", "desc": "Check-in at houseboat and Shikara ride on Dal Lake."}, {"day": 2, "title": "Srinagar to Gulmarg", "desc": "Enjoy Gondola ride and snow activities."}, {"day": 3, "title": "Gulmarg to Pahalgam", "desc": "Visit Betaab Valley and Aru Valley."}, {"day": 4, "title": "Pahalgam to Srinagar sightseeing", "desc": "Visit Shalimar and Nishat Mughal Gardens."}, {"day": 5, "title": "Departure", "desc": "Transfer to Srinagar Airport."}]',
            'gallery': '["https://images.unsplash.com/photo-1566837430420-9de97abaf222", "https://images.unsplash.com/photo-1589136775550-189f7f45b5cc"]'
        },
        {
            'title': 'Goa Beach Vacation',
            'destination': 'Goa',
            'price': 8999,
            'rating': 4.5,
            'duration': '4 Days / 3 Nights',
            'img': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
            'desc': 'Sunny beaches, water sports, historic churches, and vibrant nightlife.',
            'cat': 'Domestic',
            'itinerary': '[{"day": 1, "title": "Welcome to Goa", "desc": "Check-in at resort and relax at Calangute Beach."}, {"day": 2, "title": "North Goa Tour", "desc": "Visit Fort Aguada, Baga Beach, and water sports."}, {"day": 3, "title": "South Goa Sightseeing", "desc": "Visit Basilica of Bom Jesus and Miramar Beach."}, {"day": 4, "title": "Departure", "desc": "Check out and head to airport/station."}]',
            'gallery': '["https://images.unsplash.com/photo-1507525428034-b723cf961d3e", "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3"]'
        },
        {
            'title': 'Kerala Backwaters Tour',
            'destination': 'Kerala',
            'price': 14999,
            'rating': 4.6,
            'duration': '5 Days / 4 Nights',
            'img': 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2',
            'desc': 'Relax in private luxury houseboats cruising through the scenic canals, lagoons, and coconut groves of Alleppey.',
            'cat': 'Domestic',
            'itinerary': '[{"day": 1, "title": "Welcome to Cochin", "desc": "Arrival at airport and transfer to Munnar hill station."}, {"day": 2, "title": "Munnar Tea Gardens Tour", "desc": "Visit Eravikulam National Park and tea museum."}, {"day": 3, "title": "Munnar to Alleppey Houseboat", "desc": "Check-in at premium houseboat. Cruising and delicious local meals."}, {"day": 4, "title": "Alleppey to Cochin Sightseeing", "desc": "Visit Fort Kochi, Chinese fishing nets and Jewish Synagogue."}, {"day": 5, "title": "Departure", "desc": "Transfer to Cochin airport."}]',
            'gallery': '["https://images.unsplash.com/photo-1593693397690-362cb9666fc2", "https://images.unsplash.com/photo-1593693411515-c202e97429b6"]'
        },
        {
            'title': 'Leh Ladakh Adventure',
            'destination': 'Ladakh',
            'price': 24999,
            'rating': 4.8,
            'duration': '7 Days / 6 Nights',
            'img': 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2',
            'desc': 'Conquer the highest motorable passes, marvel at Pangong Lake, and explore majestic Buddhist monasteries.',
            'cat': 'Domestic',
            'itinerary': '[{"day": 1, "title": "Arrival in Leh", "desc": "Full day acclimatization. Rest is critical due to high altitude."}, {"day": 2, "title": "Leh Monasteries Tour", "desc": "Visit Hemis, Thiksey and Shey monasteries."}, {"day": 3, "title": "Leh to Nubra Valley", "desc": "Drive through Khardung La pass (highest motorable pass). Double-humped camel ride."}, {"day": 4, "title": "Nubra Valley to Pangong Lake", "desc": "Explore spectacular Pangong lake changing colors during the day."}, {"day": 5, "title": "Pangong Lake back to Leh", "desc": "Drive back through Chang La pass. Evening local market visit."}, {"day": 6, "title": "Leh Sightseeing & Rafting", "desc": "Confluence of Indus-Zanskar rivers and Magnetic Hill."}, {"day": 7, "title": "Departure", "desc": "Transfer to Leh Airport."}]',
            'gallery': '["https://images.unsplash.com/photo-1581793745862-99fde7fa73d2", "https://images.unsplash.com/photo-1599587428800-4b8cc9c0c169"]'
        },
        {
            'title': 'Shimla Manali Snowy Hills',
            'destination': 'Himachal Pradesh',
            'price': 11999,
            'rating': 4.6,
            'duration': '6 Days / 5 Nights',
            'img': 'https://images.unsplash.com/photo-1591873138883-7729227181df',
            'desc': 'Breathtaking drive through Solang Valley, Rohtang Pass, mall road shopping in Shimla, and old temples of Manali.',
            'cat': 'Domestic',
            'itinerary': '[{"day": 1, "title": "Delhi to Shimla", "desc": "Scenic drive from Delhi to Shimla. Check-in at hotel."}, {"day": 2, "title": "Shimla & Kufri Sightseeing", "desc": "Excursion to Kufri, Mall Road walk, and Ridge visit."}, {"day": 3, "title": "Shimla to Manali", "desc": "Drive past Kullu Valley and Pandoh Dam."}, {"day": 4, "title": "Manali Local Tour", "desc": "Hadimba Temple, Vashisht Hot Springs, and Club House."}, {"day": 5, "title": "Solang Valley Adventure", "desc": "Snow sports, paragliding, and optional Rohtang Pass visit."}, {"day": 6, "title": "Manali to Delhi Departure", "desc": "Return drive to Delhi and departure."}]',
            'gallery': '[]'
        },
        {
            'title': 'Royal Rajasthan Heritage',
            'destination': 'Rajasthan',
            'price': 16999,
            'rating': 4.7,
            'duration': '7 Days / 6 Nights',
            'img': 'https://images.unsplash.com/photo-1477584305590-38772ba65545',
            'desc': 'Discover forts and heritage palaces of Jaipur, blue streets of Jodhpur, and romantic lake cruises in Udaipur.',
            'cat': 'Domestic',
            'itinerary': '[{"day": 1, "title": "Arrive in Jaipur", "desc": "Check-in at heritage hotel. Chokhi Dhani evening visit."}, {"day": 2, "title": "Jaipur Forts Tour", "desc": "Amer Fort elephant ride, Hawa Mahal, and City Palace."}, {"day": 3, "title": "Jaipur to Jodhpur", "desc": "Drive to Sun City. Mehrangarh Fort and Jaswant Thada."}, {"day": 4, "title": "Jodhpur to Udaipur", "desc": "Enroute visit Ranakpur Jain Temples."}, {"day": 5, "title": "Udaipur Lakes Tour", "desc": "City Palace, Jagdish Temple, and Lake Pichola boat ride."}, {"day": 6, "title": "Udaipur Leisure Day", "desc": "Explore local markets, arts, and cafes."}, {"day": 7, "title": "Departure", "desc": "Head to Udaipur airport or station."}]',
            'gallery': '[]'
        },
        {
            'title': 'Golden Triangle Express',
            'destination': 'Agra',
            'price': 9999,
            'rating': 4.4,
            'duration': '4 Days / 3 Nights',
            'img': 'https://images.unsplash.com/photo-1564507592333-c60657eea523',
            'desc': 'A swift historical trip covering the capital Delhi, the Taj Mahal in Agra, and the pink city Jaipur.',
            'cat': 'Domestic',
            'itinerary': '[{"day": 1, "title": "Delhi Sightseeing", "desc": "Red Fort, Qutub Minar, and drive past India Gate."}, {"day": 2, "title": "Delhi to Agra", "desc": "Visit Taj Mahal at sunset and Agra Fort."}, {"day": 3, "title": "Agra to Jaipur", "desc": "Enroute Fatehpur Sikri. Evening shopping in Jaipur."}, {"day": 4, "title": "Jaipur Tour & Departure", "desc": "Amer Fort, Jal Mahal, and return to Delhi."}]',
            'gallery': '[]'
        },
        {
            'title': 'Andaman Islands Paradise',
            'destination': 'Andaman',
            'price': 19999,
            'rating': 4.8,
            'duration': '6 Days / 5 Nights',
            'img': 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3',
            'desc': 'White sand beaches, private cruises, scuba diving at Radhanagar Beach, and cellular jail light show in Port Blair.',
            'cat': 'Domestic',
            'itinerary': '[{"day": 1, "title": "Arrive Port Blair", "desc": "Cellular jail visit and sound & light show."}, {"day": 2, "title": "Port Blair to Havelock", "desc": "Take luxury cruise to Havelock Island."}, {"day": 3, "title": "Radhanagar Beach Scuba", "desc": "Scuba diving and beach sports at Asia finest beach."}, {"day": 4, "title": "Havelock to Neil Island", "desc": "Visit Laxmanpur and Bharatpur beaches."}, {"day": 5, "title": "Neil Island back to Port Blair", "desc": "Return cruise, shopping, and local dinner."}, {"day": 6, "title": "Departure", "desc": "Check-out and flight home."}]',
            'gallery': '[]'
        },
        {
            'title': 'Spiti Valley Jeep Safari',
            'destination': 'Himachal Pradesh',
            'price': 22999,
            'rating': 4.9,
            'duration': '8 Days / 7 Nights',
            'img': 'https://images.unsplash.com/photo-1605649487212-47bdab064df7',
            'desc': 'Off-road tour crossing Kunzum Pass, staying at Key Monastery, and camping near the high Chandratal Lake.',
            'cat': 'Domestic',
            'itinerary': '[{"day": 1, "title": "Manali Acclimatization", "desc": "Prepare and acclimatize in Manali."}, {"day": 2, "title": "Manali to Kaza", "desc": "Drive through Rohtang/Atal Tunnel and Kunzum Pass."}, {"day": 3, "title": "Kaza & Key Monastery", "desc": "Visit 1000-year-old Key Monastery and Kibber village."}, {"day": 4, "title": "Hikkim & Komic", "desc": "Send a postcard from the highest post office in Hikkim."}, {"day": 5, "title": "Kaza to Pin Valley", "desc": "Explore Pin Valley National Park and Mud village."}, {"day": 6, "title": "Kaza to Chandratal Lake", "desc": "Camp near the crescent-shaped sacred Chandratal lake."}, {"day": 7, "title": "Chandratal back to Manali", "desc": "Drive back via Rothang Pass."}, {"day": 8, "title": "Departure", "desc": "Check out and depart."}]',
            'gallery': '[]'
        },
        {
            'title': 'Darjeeling & Sikkim Wonders',
            'destination': 'Sikkim',
            'price': 13999,
            'rating': 4.6,
            'duration': '5 Days / 4 Nights',
            'img': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa',
            'desc': 'Watch sunrise at Tiger Hill, explore Gangtok lakes, and enjoy scenic toy train rides in Darjeeling.',
            'cat': 'Domestic',
            'itinerary': '[{"day": 1, "title": "Arrive Bagdogra & Darjeeling", "desc": "Transfer to Darjeeling, evening at Mall road."}, {"day": 2, "title": "Tiger Hill Sunrise Tour", "desc": "Watch sunrise over Kanchenjunga. Visit Ghoom Monastery."}, {"day": 3, "title": "Darjeeling to Gangtok", "desc": "Scenic drive along Teesta River to Gangtok."}, {"day": 4, "title": "Tsomgo Lake & Baba Mandir", "desc": "Excursion to high altitude glacial Tsomgo lake."}, {"day": 5, "title": "Departure", "desc": "Transfer to Bagdogra airport."}]',
            'gallery': '[]'
        },
        {
            'title': 'Spiritual Varanasi & Ganges',
            'destination': 'Uttar Pradesh',
            'price': 7999,
            'rating': 4.6,
            'duration': '3 Days / 2 Nights',
            'img': 'https://images.unsplash.com/photo-1561361058-c24cecae35ca',
            'desc': 'Witness mystical evening Ganga Aarti, sunrise boat cruises on the ghats, and excursion to Buddhist site Sarnath.',
            'cat': 'Domestic',
            'itinerary': '[{"day": 1, "title": "Varanasi Arrival & Aarti", "desc": "Check-in. Evening boat ride to witness spectacular Dashashwamedh Ganga Aarti."}, {"day": 2, "title": "Sunrise Cruise & Temples", "desc": "Subah-e-Banaras boat cruise. Kashi Vishwanath temple visit. Afternoon trip to Sarnath."}, {"day": 3, "title": "Ghat Walks & Departure", "desc": "Walk along Assi Ghat, try local street food, and transfer to airport."}]',
            'gallery': '[]'
        },
        {
            'title': 'Rishikesh Rafting & Yoga',
            'destination': 'Uttarakhand',
            'price': 6999,
            'rating': 4.5,
            'duration': '3 Days / 2 Nights',
            'img': 'https://images.unsplash.com/photo-1545205597-3d9d02c29597',
            'desc': 'White water rafting, riverside luxury camps, morning ashram yoga sessions, and Ganga Aarti at Triveni Ghat.',
            'cat': 'Domestic',
            'itinerary': '[{"day": 1, "title": "Riverside Camp Check-in", "desc": "Arrival at camp. Evening beach volleyball and bonfire."}, {"day": 2, "title": "Rafting & Cliff Jumping", "desc": "16km white water rafting from Shivpuri. Visit Lakshman Jhula in evening."}, {"day": 3, "title": "Yoga & Departure", "desc": "Sunrise yoga session, breakfast, and checkout."}]',
            'gallery': '[]'
        },
        {
            'title': 'Coorg & Mysore Escape',
            'destination': 'Karnataka',
            'price': 10999,
            'rating': 4.4,
            'duration': '5 Days / 4 Nights',
            'img': 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1',
            'desc': 'Stroll through lush coffee plantations in Coorg, visit Dubare Elephant Camp, and tour the historic Mysore Palace.',
            'cat': 'Domestic',
            'itinerary': '[{"day": 1, "title": "Bangalore to Coorg", "desc": "Drive to Coorg. Check-in at plantation resort."}, {"day": 2, "title": "Coorg Waterfalls & Elephants", "desc": "Abbey Falls, Dubare Elephant camp, and Raja Seat sunset."}, {"day": 3, "title": "Coorg to Mysore", "desc": "Drive to Mysore, visit majestic Mysore Palace at night."}, {"day": 4, "title": "Mysore Zoo & Gardens", "desc": "Visit Chamundi Hills and Brindavan Gardens."}, {"day": 5, "title": "Mysore to Bangalore Departure", "desc": "Return drive and flight back home."}]',
            'gallery': '[]'
        },
        {
            'title': 'Hampi Stone Chariot Heritage',
            'destination': 'Karnataka',
            'price': 9499,
            'rating': 4.7,
            'duration': '4 Days / 3 Nights',
            'img': 'https://images.unsplash.com/photo-1600100395162-43b9a69a65e0?auto=format&fit=crop&w=800&q=80',
            'desc': 'Step back in time among the ruins of the Vijayanagara Empire, Stone Chariot, and coracle rides on Tungabhadra River.',
            'cat': 'Domestic',
            'itinerary': '[{"day": 1, "title": "Arrive in Hampi", "desc": "Check-in at cottage. Evening sunset walk at Hemakuta Hill."}, {"day": 2, "title": "Vittala Temple & Royal Enclave", "desc": "Explore Stone Chariot, Lotus Mahal, and Elephant Stables."}, {"day": 3, "title": "Virupaksha Temple & Coracle Ride", "desc": "Morning temple visit and coracle boat ride on the river."}, {"day": 4, "title": "Departure", "desc": "Checkout and transfer to Hospet station."}]',
            'gallery': '[]'
        },
        {
            'title': 'Meghalaya Living Root Bridges',
            'destination': 'Meghalaya',
            'price': 17999,
            'rating': 4.8,
            'duration': '6 Days / 5 Nights',
            'img': 'https://images.unsplash.com/photo-1628172909405-b0728c31cb8c?auto=format&fit=crop&w=800&q=80',
            'desc': 'Trek to Double Decker Living Root Bridges, explore deep Mawsmai caves, and sail on crystal clear Dawki river.',
            'cat': 'Domestic',
            'itinerary': '[{"day": 1, "title": "Guwahati to Shillong", "desc": "Arrive at airport and drive past Umiam Lake to Shillong."}, {"day": 2, "title": "Shillong to Cherrapunji", "desc": "Visit Elephant Falls and Mawkdok Dympep Valley."}, {"day": 3, "title": "Double Decker Root Bridge Trek", "desc": "Full day trek to Nongriat village root bridges and rainbow falls."}, {"day": 4, "title": "Cherrapunji to Dawki & Mawlynnong", "desc": "Visit cleanest village Mawlynnong and boat ride on Umngot river in Dawki."}, {"day": 5, "title": "Dawki back to Shillong", "desc": "Visit Laitlum Canyons and local market shopping."}, {"day": 6, "title": "Shillong to Guwahati Departure", "desc": "Return transfer and flight."}]',
            'gallery': '[]'
        },
        {
            'title': 'Sundarbans Tiger Safari',
            'destination': 'West Bengal',
            'price': 8499,
            'rating': 4.3,
            'duration': '3 Days / 2 Nights',
            'img': 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80',
            'desc': 'Jungle launch cruises through mangrove creeks, bird watching, and spotting royal Bengal tigers.',
            'cat': 'Domestic',
            'itinerary': '[{"day": 1, "title": "Kolkata to Sundarbans", "desc": "Transfer to Godkhali jetty, boat transfer to eco-resort."}, {"day": 2, "title": "Jungle Launch Cruise", "desc": "Full day watchtower cruise (Sajnekhali, Sudhanyakhali, Dobanki). Mangrove trails."}, {"day": 3, "title": "Village Walk & Return", "desc": "Local village interact sessions and return drive to Kolkata."}]',
            'gallery': '[]'
        },
        {
            'title': 'Ooty Nilgiri Toy Train Tour',
            'destination': 'Tamil Nadu',
            'price': 11499,
            'rating': 4.5,
            'duration': '4 Days / 3 Nights',
            'img': 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
            'desc': 'Ride the iconic UNESCO Nilgiri Mountain Toy Train, stroll through botanical gardens, and boat in Ooty Lake.',
            'cat': 'Domestic',
            'itinerary': '[{"day": 1, "title": "Coimbatore to Ooty", "desc": "Scenic mountain drive to Ooty. Check-in at hotel."}, {"day": 2, "title": "Ooty Botanical & Lake Tour", "desc": "Botanical Gardens, Rose Garden, and boat riding in Ooty Lake."}, {"day": 3, "title": "Coonoor Toy Train ride", "desc": "Take Nilgiri mountain railway to Coonoor. Visit Sim park and Dolphin nose."}, {"day": 4, "title": "Ooty to Coimbatore Departure", "desc": "Transfer back to Coimbatore airport."}]',
            'gallery': '[]'
        },
        {
            'title': 'Chardham Yatra Pilgrimage',
            'destination': 'Uttarakhand',
            'price': 34999,
            'rating': 4.9,
            'duration': '10 Days / 9 Nights',
            'img': 'https://images.unsplash.com/photo-1583089892943-e02e5b017b6a?auto=format&fit=crop&w=800&q=80',
            'desc': 'A sacred spiritual journey covering Yamunotri, Gangotri, Kedarnath, and Badrinath shrines.',
            'cat': 'Domestic',
            'itinerary': '[{"day": 1, "title": "Haridwar to Barkot", "desc": "Drive to Barkot along Yamuna river."}, {"day": 2, "title": "Yamunotri Darshan", "desc": "Trek to Yamunotri temple, holy dip, and return to Barkot."}, {"day": 3, "title": "Barkot to Uttarkashi", "desc": "Drive to Uttarkashi, visit Kashi Vishwanath temple."}, {"day": 4, "title": "Gangotri Darshan", "desc": "Drive to Gangotri temple, holy dip in Ganges, return to Uttarkashi."}, {"day": 5, "title": "Uttarkashi to Guptkashi", "desc": "Drive along Mandakini river to Guptkashi."}, {"day": 6, "title": "Guptkashi to Kedarnath", "desc": "Trek to Kedarnath temple, attend evening aarti. Stay at Kedarnath."}, {"day": 7, "title": "Kedarnath to Guptkashi", "desc": "Descend back from Kedarnath and rest at Guptkashi."}, {"day": 8, "title": "Badrinath to Rishikesh", "desc": "Drive back to Rishikesh, visit Laxman Jhula."}, {"day": 9, "title": "Rishikesh to Dehradun Departure", "desc": "Transfer to Dehradun airport."}]',
            'gallery': '[]'
        },
        {
            'title': 'Ajanta Ellora Caves Tour',
            'destination': 'Maharashtra',
            'price': 9999,
            'rating': 4.6,
            'duration': '4 Days / 3 Nights',
            'img': 'https://images.unsplash.com/photo-1606210122158-e565ed64c810?auto=format&fit=crop&w=800&q=80',
            'desc': 'Explore UNESCO-listed ancient rock-cut cave temples and the monolithic Kailash Temple of Ellora.',
            'cat': 'Domestic',
            'itinerary': '[{"day": 1, "title": "Arrive Aurangabad", "desc": "Check-in at hotel. Visit Bibi Ka Maqbara (mini Taj)."}, {"day": 2, "title": "Ajanta Caves Excursion", "desc": "Explore 30 rock-cut Buddhist cave monuments dated back to 2nd century BCE."}, {"day": 3, "title": "Ellora Caves & Daulatabad Fort", "desc": "Explore monolithic Kailash temple and climb historic Daulatabad fort."}, {"day": 4, "title": "Departure", "desc": "Checkout and transfer to Aurangabad station/airport."}]',
            'gallery': '[]'
        },
        {
            'title': 'Kaziranga Wildlife Safari',
            'destination': 'Assam',
            'price': 10999,
            'rating': 4.5,
            'duration': '4 Days / 3 Nights',
            'img': 'https://images.unsplash.com/photo-1602491453631-e2a5ad90a131',
            'desc': 'Elephant and open jeep safaris in Kaziranga National Park to spot the great Indian one-horned rhinoceros.',
            'cat': 'Domestic',
            'itinerary': '[{"day": 1, "title": "Guwahati to Kaziranga", "desc": "Transfer to Kaziranga National Park check-in. Evening Assamese folk dance show."}, {"day": 2, "title": "Elephant Safari & Orchid Park", "desc": "Early morning elephant safari in central range. Visit national orchid park."}, {"day": 3, "title": "Jeep Safari", "desc": "Afternoon open jeep safari in western range for rhino sighting."}, {"day": 4, "title": "Departure", "desc": "Return transfer to Guwahati."}]',
            'gallery': '[]'
        },
        {
            'title': 'Maldives Luxury Overwater Resort',
            'destination': 'Maldives',
            'price': 49999,
            'rating': 4.9,
            'duration': '5 Days / 4 Nights',
            'img': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8',
            'desc': 'Stay in a private water villa with infinity pool, sunset dolphin cruises, and coral reef snorkeling.',
            'cat': 'International',
            'itinerary': '[{"day": 1, "title": "Arrive Male & Speedboat Transfer", "desc": "Speedboat transfer to luxury island resort. Welcome drinks and check-in."}, {"day": 2, "title": "Coral Reef Snorkeling", "desc": "Guided snorkeling tour among turtles and stingrays. Candlelight beach dinner."}, {"day": 3, "title": "Sunset Dolphin Cruise", "desc": "Private catamaran cruise watching wild dolphins and glowing beach plankton."}, {"day": 4, "title": "Spa & Water Sports", "desc": "Overwater spa massage session and Jet Ski adventure."}, {"day": 5, "title": "Departure", "desc": "Speedboat transfer back to Male International Airport."}]',
            'gallery': '["https://images.unsplash.com/photo-1514282401047-d79a71a590e8", "https://images.unsplash.com/photo-1573843981267-be1999ff37cd"]'
        },
        {
            'title': 'Dubai Desert & City Lights',
            'destination': 'Dubai',
            'price': 39999,
            'rating': 4.8,
            'duration': '5 Days / 4 Nights',
            'img': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
            'desc': 'Burj Khalifa 124th floor view, desert dune bashing safari with BBQ dinner, and luxury yacht cruise.',
            'cat': 'International',
            'itinerary': '[{"day": 1, "title": "Arrival in Dubai", "desc": "Check-in at downtown hotel. Evening Walk at Dubai Marina & JBR Beach."}, {"day": 2, "title": "Burj Khalifa & Dubai Mall", "desc": "Visit 124th Observatory floor, Dubai Aquarium and Fountain Show."}, {"day": 3, "title": "4x4 Desert Safari", "desc": "Thrilling dune bashing, camel riding, belly dance show and BBQ dinner."}, {"day": 4, "title": "Old Dubai & Gold Souk", "desc": "Abra boat ride across Dubai Creek, Gold & Spice Souk shopping."}, {"day": 5, "title": "Departure", "desc": "Transfer to Dubai International Airport."}]',
            'gallery': '["https://images.unsplash.com/photo-1512453979798-5ea266f8880c", "https://images.unsplash.com/photo-1580674684081-7617fbf3d745"]'
        },
        {
            'title': 'Singapore Gardens & Universal Studios',
            'destination': 'Singapore',
            'price': 35999,
            'rating': 4.7,
            'duration': '4 Days / 3 Nights',
            'img': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd',
            'desc': 'Explore Gardens by the Bay, full day at Sentosa Island & Universal Studios, and Marina Bay Sands light show.',
            'cat': 'International',
            'itinerary': '[{"day": 1, "title": "Welcome to Lion City", "desc": "Arrive at Changi Airport. Transfer to hotel and Night Safari experience."}, {"day": 2, "title": "Universal Studios Sentosa", "desc": "Full day ride access at Universal Studios Singapore and Wings of Time show."}, {"day": 3, "title": "Gardens by the Bay & Marina Bay", "desc": "Cloud Forest Dome, Flower Dome, Supertree Grove and Skypark observation deck."}, {"day": 4, "title": "Jewel Changi & Departure", "desc": "Visit Rain Vortex waterfall at Jewel Changi before departure."}]',
            'gallery': '["https://images.unsplash.com/photo-1525625293386-3f8f99389edd"]'
        },
        {
            'title': 'Thailand Tropical Beaches & Phuket',
            'destination': 'Thailand',
            'price': 29999,
            'rating': 4.6,
            'duration': '6 Days / 5 Nights',
            'img': 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a',
            'desc': 'Speedboat tour of Phi Phi Islands, James Bond Island, Bangkok temple tours and vibrant night markets.',
            'cat': 'International',
            'itinerary': '[{"day": 1, "title": "Bangkok Arrival", "desc": "Transfer to hotel. Evening Chao Phraya Princess Dinner Cruise."}, {"day": 2, "title": "Bangkok Temples Tour", "desc": "Grand Palace, Wat Pho (Reclining Buddha), and Wat Arun."}, {"day": 3, "title": "Bangkok to Phuket", "desc": "Flight to Phuket. Evening Bangla Road nightlife walk."}, {"day": 4, "title": "Phi Phi Island Speedboat Tour", "desc": "Maya Bay, Monkey Beach, snorkeling and buffet lunch."}, {"day": 5, "title": "Big Buddha & Chalong Temple", "desc": "Phuket viewpoint city tour and Thai massage session."}, {"day": 6, "title": "Departure", "desc": "Transfer to Phuket Airport."}]',
            'gallery': '[]'
        },
        {
            'title': 'Swiss Alps & Glacier Express',
            'destination': 'Switzerland',
            'price': 89999,
            'rating': 4.9,
            'duration': '7 Days / 6 Nights',
            'img': 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99',
            'desc': 'Travel on the panoramic Glacier Express train, visit Mt. Titlis snow revolving cable car, and cruise Lake Geneva.',
            'cat': 'International',
            'itinerary': '[{"day": 1, "title": "Arrive Zurich", "desc": "Check-in. Walk along Bahnhofstrasse and Lake Zurich."}, {"day": 2, "title": "Zurich to Lucerne", "desc": "Chapel Bridge, Lion Monument, and Lake Lucerne cruise."}, {"day": 3, "title": "Mt. Titlis Snow Adventure", "desc": "Rotair revolving cable car, Ice Flyer, and Cliff Walk suspension bridge."}, {"day": 4, "title": "Interlaken & Jungfraujoch", "desc": "Train to Top of Europe (Jungfraujoch 3,454m) and Ice Palace."}, {"day": 5, "title": "Glacier Express to Zermatt", "desc": "Panoramic mountain train journey to view the iconic Matterhorn peak."}, {"day": 6, "title": "Zermatt Village Walk", "desc": "Electric car ride, Alpine hiking, and Swiss fondue dinner."}, {"day": 7, "title": "Departure", "desc": "Transfer to Zurich Airport for flight back."}]',
            'gallery': '[]'
        },
        {
            'title': 'Bali Island & Cultural Ubud',
            'destination': 'Indonesia',
            'price': 34999,
            'rating': 4.8,
            'duration': '6 Days / 5 Nights',
            'img': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
            'desc': 'Private pool villa stay, Tegallalang Rice Terrace swing, Tanah Lot temple sunset, and Nusa Penida island tour.',
            'cat': 'International',
            'itinerary': '[{"day": 1, "title": "Arrive Denpasar Bali", "desc": "Private villa check-in in Seminyak. Relax at beach club."}, {"day": 2, "title": "Ubud Art & Rice Fields", "desc": "Visit Sacred Monkey Forest, Tegallalang Rice Terraces & Bali Swing."}, {"day": 3, "title": "Kintamani Volcano & Waterfall", "desc": "Mount Batur volcano viewpoint, Tegenungan Waterfall & Coffee Plantation."}, {"day": 4, "title": "Nusa Penida Island Tour", "desc": "Speedboat to Nusa Penida. Visit Kelingking T-Rex Beach & Angel Billabong."}, {"day": 5, "title": "Tanah Lot Temple Sunset", "desc": "Evening sunset watch at sea temple Tanah Lot and Jimbaran seafood dinner."}, {"day": 6, "title": "Departure", "desc": "Transfer to Bali International Airport."}]',
            'gallery': '[]'
        },
        {
            'title': 'Japan Cherry Blossom & Bullet Train',
            'destination': 'Japan',
            'price': 74999,
            'rating': 4.9,
            'duration': '7 Days / 6 Nights',
            'img': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
            'desc': 'Witness cherry blossoms in Tokyo, ride the Shinkansen bullet train to Mt. Fuji, and explore ancient Kyoto temples.',
            'cat': 'International',
            'itinerary': '[{"day": 1, "title": "Arrive Tokyo", "desc": "Check-in at Shinjuku hotel. Evening Shibuya Crossing and Sky Deck."}, {"day": 2, "title": "Tokyo City & Sensoji Temple", "desc": "Asakusa Sensoji Temple, Nakamise Street, and TeamLab Planets digital art."}, {"day": 3, "title": "Mt. Fuji & Lake Kawaguchiko", "desc": "Day trip to Mt. Fuji 5th Station and Lake Kawaguchiko ropeway."}, {"day": 4, "title": "Bullet Train to Kyoto", "desc": "Ride Shinkansen at 300km/h. Visit Fushimi Inari Torii Gates."}, {"day": 5, "title": "Kyoto Bamboo Grove & Golden Pavilion", "desc": "Arashiyama Bamboo Forest and Kinkaku-ji Golden Temple."}, {"day": 6, "title": "Nara Deer Park & Osaka Dotonbori", "desc": "Feed friendly deer in Nara, evening food tour in Osaka Dotonbori."}, {"day": 7, "title": "Departure", "desc": "Transfer to Kansai / Narita Airport."}]',
            'gallery': '[]'
        }
    ]
    
    for p in packages_data:
        Package.objects.create(
            title=p['title'],
            destination=p['destination'],
            price=p['price'],
            rating=p['rating'],
            duration=p['duration'],
            image_url=p['img'],
            description=p['desc'],
            category=p['cat'],
            itinerary=p['itinerary'],
            gallery=p['gallery']
        )
    print(f"Successfully seeded {len(packages_data)} holiday packages!")

def seed_cars():
    print("Seeding Cars...")
    Car.objects.all().delete()
    
    cars_data = [
        {'name': 'Maruti Swift', 'type': 'Hatchback', 'trans': 'Manual', 'fuel': 'Petrol', 'rental': 'Self Drive', 'hour': 100, 'daily': 1200, 'img': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341', 'feats': '["Airbags", "Bluetooth", "USB Port"]'},
        {'name': 'Hyundai Creta', 'type': 'SUV', 'trans': 'Automatic', 'fuel': 'Diesel', 'rental': 'Self Drive', 'hour': 220, 'daily': 2500, 'img': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf', 'feats': '["GPS Navigation", "Sunroof", "Touchscreen", "Rear Camera"]'},
        {'name': 'Honda City', 'type': 'Sedan', 'trans': 'Automatic', 'fuel': 'Petrol', 'rental': 'Self Drive', 'hour': 180, 'daily': 2000, 'img': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf', 'feats': '["Leather Seats", "Apple CarPlay", "Automatic AC"]'},
        {'name': 'Toyota Innova Crysta', 'type': 'Luxury SUV', 'trans': 'Automatic', 'fuel': 'Diesel', 'rental': 'Driver Included', 'hour': 350, 'daily': 4000, 'img': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341', 'feats': '["Professional Driver", "Luggage Carrier", "AC Vents for all rows"]'},
        {'name': 'BMW 5 Series', 'type': 'Luxury', 'trans': 'Automatic', 'fuel': 'Petrol', 'rental': 'Airport Pickup', 'hour': 800, 'daily': 9000, 'img': 'https://images.unsplash.com/photo-1555215695-3004980ad54e', 'feats': '["VIP Greeting", "Chauffeur Service", "Refreshments", "WiFi on board"]'}
    ]
    
    for c in cars_data:
        Car.objects.create(
            name=c['name'],
            car_type=c['type'],
            transmission=c['trans'],
            fuel_type=c['fuel'],
            rental_type=c['rental'],
            hourly_rate=c['hour'],
            daily_rate=c['daily'],
            image_url=c['img'],
            features=c['feats']
        )
    print(f"Successfully seeded {len(cars_data)} rental cars!")

def seed_promotions():
    print("Seeding Coupons and Offers...")
    Coupon.objects.all().delete()
    Offer.objects.all().delete()
    
    coupons = [
        {'code': 'MMTFLIGHT', 'percent': 15.00, 'max': 1200.00, 'desc': 'Get 15% off up to ₹1200 on all flights!'},
        {'code': 'MMTHOTEL', 'percent': 25.00, 'max': 2000.00, 'desc': 'Get 25% off up to ₹2000 on luxury hotels!'},
        {'code': 'MMTTRAIN', 'percent': 10.00, 'max': 150.00, 'desc': 'Get 10% off up to ₹150 on your train ticket.'},
        {'code': 'WELCOME', 'percent': 20.00, 'max': 1000.00, 'desc': 'Special 20% discount for first-time booking.'}
    ]
    
    for cp in coupons:
        Coupon.objects.create(
            code=cp['code'],
            discount_percentage=cp['percent'],
            max_discount=cp['max'],
            active=True,
            description=cp['desc']
        )
        
    offers = [
        {'title': 'Fly High with Air India', 'desc': 'Get up to ₹1500 off on Air India domestic routes. Valid till next month.', 'tag': 'UP TO ₹1500 OFF', 'cat': 'flights', 'img': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05'},
        {'title': 'Luxury Staycation Deals', 'desc': 'Stay at Leela, Taj or Trident hotels and get flat 30% off and free breakfast.', 'tag': 'FLAT 30% OFF', 'cat': 'hotels', 'img': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'},
        {'title': 'Roadtrip Holiday Car Rentals', 'desc': 'Rent SUVs for your next roadtrip and enjoy the first day for free.', 'tag': 'FIRST DAY FREE', 'cat': 'general', 'img': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf'},
        {'title': 'Weekend Gateway Train Coupon', 'desc': 'Travel home for weekends. Use code MMTTRAIN and get direct cashback.', 'tag': 'FLAT ₹100 CASHBACK', 'cat': 'trains', 'img': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957'},
    ]
    
    for of in offers:
        Offer.objects.create(
            title=of['title'],
            description=of['desc'],
            discount_tag=of['tag'],
            image_url=of['img'],
            category=of['cat']
        )
    print("Successfully seeded coupons and offers!")

def seed_support():
    print("Seeding FAQ...")
    FAQ.objects.all().delete()
    
    faqs = [
        {'q': 'How do I cancel my flight booking?', 'a': 'You can cancel your booking directly from the dashboard under My Bookings by clicking the Cancel Booking button.', 'cat': 'Flights'},
        {'q': 'Is my hotel booking refundable?', 'a': 'Refund policies vary by hotel. Check the terms before booking or look at your booking status in your profile.', 'cat': 'Hotels'},
        {'q': 'Can I choose my berths in train bookings?', 'a': 'Yes, our interactive coach layout allows you to choose sleeper or AC berths in real-time.', 'cat': 'Trains'},
        {'q': 'What does the GlobeTrotter Wallet balance do?', 'a': 'Your GlobeTrotter Wallet balance holds credits that you can apply during checkout to pay for any booking.', 'cat': 'Payments'},
    ]
    
    for f in faqs:
        FAQ.objects.create(question=f['q'], answer=f['a'], category=f['cat'])
    print("Successfully seeded FAQs!")

def seed_reviews():
    print("Seeding reviews...")
    Review.objects.all().delete()
    
    admin_user = User.objects.get(username='admin')
    
    Review.objects.create(
        user=admin_user,
        category='hotel',
        target_id=1, # Taj Palace
        rating=5,
        comment='Absolutely brilliant service and location. Highly recommend the tea rooms and gardens!',
        likes=12,
        image_url='https://images.unsplash.com/photo-1566073771259-6a8506099945'
    )
    Review.objects.create(
        user=admin_user,
        category='flight',
        target_id=1, # First flight
        rating=4,
        comment='Good, on-time flight with nice meal selections. Cabin crew was helpful.',
        likes=5
    )
    print("Successfully seeded reviews!")

def seed_buses():
    print("Seeding Buses...")
    Bus.objects.all().delete()
    cities = ['New Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Chennai', 'Goa']
    operators = [
        {'name': 'Zingbus', 'type': 'AC Seater/Sleeper (2+1)'},
        {'name': 'VRL Travels', 'type': 'AC Sleeper (2+1)'},
        {'name': 'SRS Travels', 'type': 'Non-AC Sleeper (2+1)'},
        {'name': 'National Travels', 'type': 'Volvo Multi-Axle AC SemiSleeper'},
        {'name': 'IntrCity SmartBus', 'type': 'AC Sleeper (2+1)'}
    ]
    
    base_time = datetime.now()
    bus_count = 0
    
    for i in range(0, 6): # next 6 days (including today)
        date = base_time + timedelta(days=i)
        for dep in cities:
            for arr in cities:
                if dep == arr:
                    continue
                # Create 2 buses per route
                for index in range(2):
                    op_info = operators[random.randint(0, len(operators)-1)]
                    dep_time = datetime(date.year, date.month, date.day, 7 + (index * 11), 30) # 7:30 AM or 6:30 PM
                    arr_time = dep_time + timedelta(hours=10, minutes=30)
                    price = 450 + (index * 300) + random.randint(50, 150)
                    
                    Bus.objects.create(
                        operator=op_info['name'],
                        bus_number=f"IN-{random.randint(10, 99)}-{random.randint(1000, 9999)}",
                        source_city=dep,
                        destination_city=arr,
                        departure_time=dep_time,
                        arrival_time=arr_time,
                        price=price,
                        bus_type=op_info['type'],
                        total_seats=30,
                        available_seats=random.randint(2, 30),
                        booked_seats='[]'
                    )
                    bus_count += 1
    print(f"Successfully seeded {bus_count} buses!")

def run_seed():
    print("Starting master seed...")
    seed_users()
    seed_flights()
    seed_hotels()
    seed_trains()
    seed_cars()
    seed_packages()
    seed_promotions()
    seed_support()
    seed_reviews()
    seed_buses()
    print("Master seed completed successfully!")

if __name__ == '__main__':
    run_seed()
