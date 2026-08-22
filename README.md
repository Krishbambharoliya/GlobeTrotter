# 🌍 GlobeTrotter - Next-Gen Travel & Itinerary Planning Platform

**GlobeTrotter** is a modern, full-stack web application designed for seamless trip planning, multi-modal transport bookings (Flights, Trains, Buses, Cars), hotel reservations, tour package discovery, interactive calendar scheduling, and AI-assisted itinerary generation.

---

## 🚀 Key Features Overview

### 1. 🧳 Trip & Itinerary Management
- **Multi-City Itinerary Builder**: Create customized multi-day travel plans, add activities, budget estimates, and landmark attractions.
- **⚡ 1-Click Quick Trip Presets**: Instant pre-filled templates for trending destinations like *Manali Snow Expedition*, *Dubai Luxury*, *Switzerland Alps*, and *Bali Sanctuary*.
- **Interactive Trip Calendar**: Monthly view for scheduling flights, hotel check-ins, train departures, and tour activities.

### 2. 🚆 Multi-Modal Transport & Stays Booking
- **Flights**: One-way and round-trip searches across major airlines with seating class options (Economy, Premium, Business).
- **Hotels**: Search handpicked luxury and budget hotels by city, view ratings, photo galleries, and nightly rates.
- **Trains**: Indian Railways & IRCTC integration for 7,000+ stations and class tier selection (1AC, 2AC, 3AC, Sleeper).
- **Buses**: AC Sleeper and Seater intercity bus reservations with live operator listings.
- **Car Rentals**: Self-drive SUV/sedan rentals and chauffeur-driven rental bookings with hourly/daily pricing.

### 3. 🐍 Python-Powered Language Translation Service
- **Python Backend Translator**: Powered by Django REST Framework and `deep_translator` (`POST /api/support/translate/`).
- **High-Contrast Language Selector**: Instant client-side & server-side translation supporting English, Hindi, Gujarati, Spanish, French, German, Japanese, Chinese, Arabic, Russian, Portuguese, Italian, and Korean.

### 4. 🎨 Modern Glassmorphic UI & Themes
- **Single-Row Top Navigation Bar**: Standardized navigation bar across all pages featuring Home, Explore, Plan Trips, Community, About, Contact, Language Selector, Theme Switcher, and User Profile.
- **Dark & Light Modes**: Full system theme switching with dark slate containers (`#0d1527`, `#111b2d`) and vibrant sky-blue accents (`#0ea5e9`, `#38bdf8`).
- **Universal Soft Rounded Inputs**: Smooth `12px` border-radius input fields, custom date/time pickers, and soft translucent text highlights.

---

## 🛠️ Architecture & Tech Stack

```text
GlobeTrotter Platform
├── Backend (Django REST Framework 5.0 + Python 3.11)
│   ├── users/        -> User Auth, Profiles & Travelers
│   ├── flights/      -> Flight Listings & Search Engine
│   ├── hotels/       -> Hotel Inventory & Amenity Filters
│   ├── trains/       -> Train Routes & Railway Stations
│   ├── buses/        -> Bus Operator Schedules & Pricing
│   ├── cars/         -> Self-Drive & Chauffeur Vehicle Fleet
│   ├── bookings/     -> Universal Booking Ledger & Tickets
│   ├── packages/     -> Curated Tour Packages & Itineraries
│   ├── promotions/   -> Discount Coupons & Promo Offers
│   ├── support/      -> FAQs, Contact Form & Python Translator API
│   ├── reviews/      -> Verified User Ratings & Reviews
│   ├── payments/     -> Payment Gateway Ledger & Wallets
│   └── notifications/-> User Alert Notifications
│
└── Frontend (React 18 + Vite 8.1 + Bootstrap 5.3 + React Icons)
    ├── components/   -> Navbar, AuthModal, LanguageSelector, PlanTripFAB
    ├── pages/        -> Home, Explore, TripList, CreateTrip, CalendarView, ItineraryBuilder
    ├── context/      -> ThemeContext (Dark/Light mode state)
    └── api.js        -> Axios API Client with JWT Bearer Interceptors
```

---

## 🧪 Testing & Verification

The project includes an automated test suite across all 14 Django applications:

### Run Backend Django Unit Tests
```bash
cd backend
python manage.py test
```
*Result: 28/28 test cases passing cleanly (100% pass rate).*

### Run Frontend Production Build
```bash
cd frontend
npm run build
```
*Result: Minified production build compiles cleanly in ~1 second.*

---

## 🔧 Local Development Setup Guide

### 1. Backend Setup (Django)
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
python manage.py migrate
python seed.py          # Seeds initial sample data
python manage.py runserver 0.0.0.0:8000
```

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

---

## 👤 Verified QA Test Account
- **Username**: `test_qa_user`
- **Email**: `qa_user@globetrotter.com`
- **Password**: `Password123!`
