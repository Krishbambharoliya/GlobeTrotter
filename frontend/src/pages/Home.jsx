import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FaPlane, FaHotel, FaBus, FaSuitcase, FaCar, FaPercentage, FaSignOutAlt, FaStar, FaChevronRight, FaHeart, FaRegHeart, FaWifi, FaSwimmingPool, FaSpa, FaDumbbell, FaUtensils, FaParking, FaConciergeBell, FaGlassMartiniAlt, FaSearch, FaFilter, FaTimes, FaCheck, FaSun, FaMoon, FaMapMarkerAlt, FaTrain, FaCrown, FaClock, FaCalendarAlt } from 'react-icons/fa';
import api from '../api';
import AuthModal from '../components/AuthModal';
import poolVideo from '../assets/Pool_Woman.mp4';
import p1Image from '../assets/p1.png';
import { useTheme } from '../context/ThemeContext';

// Deterministic helper functions for client-side filters on homepage
const getHotelAmenities = (hotelId) => {
  const allAmenities = ["Free Wi-Fi", "Swimming Pool", "Spa & Wellness", "Fitness Gym", "Restaurant", "Free Parking", "Room Service", "Bar & Lounge"];
  const count = (hotelId % 3) + 3; // 3 to 5 amenities
  const amenities = [];
  for (let i = 0; i < count; i++) {
    amenities.push(allAmenities[(hotelId + i * 2) % allAmenities.length]);
  }
  return amenities;
};

const getAmenityIcon = (name) => {
  switch (name) {
    case "Free Wi-Fi": return <FaWifi className="me-1" />;
    case "Swimming Pool": return <FaSwimmingPool className="me-1" />;
    case "Spa & Wellness": return <FaSpa className="me-1" />;
    case "Fitness Gym": return <FaDumbbell className="me-1" />;
    case "Restaurant": return <FaUtensils className="me-1" />;
    case "Free Parking": return <FaParking className="me-1" />;
    case "Room Service": return <FaConciergeBell className="me-1" />;
    case "Bar & Lounge": return <FaGlassMartiniAlt className="me-1" />;
    default: return null;
  }
};

const getPackageInclusions = (pkgId) => {
  const allInclusions = ["Flights", "Luxury Stay", "Meals Included", "Private Cab", "Tour Guide", "Sightseeing", "Activities"];
  const count = (pkgId % 3) + 4; // 4 to 6 inclusions
  const inclusions = [];
  for (let i = 0; i < count; i++) {
    inclusions.push(allInclusions[(pkgId + i * 3) % allInclusions.length]);
  }
  return inclusions;
};

const getPackageTheme = (pkg) => {
  const title = pkg.title.toLowerCase();
  if (title.includes('beach') || title.includes('goa') || title.includes('maldives') || title.includes('island')) return 'Beach';
  if (title.includes('adventure') || title.includes('trek') || title.includes('snow') || title.includes('safari')) return 'Adventure';
  if (title.includes('honeymoon') || title.includes('romantic') || title.includes('couple')) return 'Honeymoon';
  if (title.includes('palace') || title.includes('luxury') || title.includes('heritage') || title.includes('royal')) return 'Luxury';
  if (title.includes('kerala') || title.includes('nature') || title.includes('paradise') || title.includes('hill')) return 'Nature';
  return 'Family';
};

const getPackageDurationCategory = (durationStr) => {
  if (!durationStr) return 'Medium (4-6 Days)';
  const match = durationStr.match(/(\d+)\s*Day/i);
  if (match) {
    const days = parseInt(match[1]);
    if (days <= 3) return 'Short (1-3 Days)';
    if (days <= 6) return 'Medium (4-6 Days)';
    return 'Long (7+ Days)';
  }
  return 'Medium (4-6 Days)';
};

const SkeletonCard = () => (
  <div className="col-md-6 mb-3">
    <div className="skeleton-card">
      <div className="skeleton-image skeleton" style={{ height: '180px' }}></div>
      <div className="skeleton-content p-4">
        <div className="skeleton-title skeleton w-75"></div>
        <div className="skeleton-text skeleton w-100 mb-2"></div>
        <div className="skeleton-text skeleton w-50"></div>
        <div className="skeleton-footer border-0 pt-3">
          <div className="skeleton-price skeleton w-40" style={{ height: '24px' }}></div>
          <div className="skeleton-btn skeleton w-40" style={{ height: '36px' }}></div>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonGridLoader = () => (
  <div className="row g-4">
    <SkeletonCard />
    <SkeletonCard />
  </div>
);

const getAvailableDates = (pkgId) => {
  const today = new Date();
  const dates = [];
  const offsets = [
    ((pkgId * 3) % 7) + 3,
    ((pkgId * 7) % 7) + 10,
    ((pkgId * 11) % 7) + 18,
    ((pkgId * 13) % 7) + 25
  ];

  offsets.forEach((offset) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    dates.push(d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }));
  });

  return dates;
};

const FlightsIcon = () => (
  <svg viewBox="0 0 100 80" width="60" height="60" style={{ overflow: 'visible' }}>
    {/* Shadow */}
    <ellipse cx="48" cy="68" rx="28" ry="5" fill="rgba(0,0,0,0.06)" />
    <g transform="translate(5, 5)">
      {/* Back Wing */}
      <path d="M 42,32 L 68,10 C 69,9 71,10 70,12 L 53,35 Z" fill="#0084ff" />
      {/* Tail fin */}
      <path d="M 22,43 L 13,22 C 12,20 15,19 17,21 L 27,40 Z" fill="#0056b3" />
      <path d="M 24,21 L 18,31 L 16,29 Z" fill="#0084ff" />
      {/* Fuselage / Main Body */}
      <path d="M 18,48 C 16,46 22,38 42,32 C 62,26 80,26 82,31 C 84,36 72,42 52,48 C 32,54 20,50 18,48 Z" fill="#ffffff" stroke="#102a43" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Cockpit / Nose glass */}
      <path d="M 75,29 C 78,29 80,30 81,31 C 79,33 76,32 75,29 Z" fill="#102a43" />
      {/* Front Wing */}
      <path d="M 44,43 L 48,68 C 49,70 46,71 44,68 L 34,46 Z" fill="#0084ff" stroke="#102a43" strokeWidth="2" strokeLinejoin="round" />
    </g>
  </svg>
);

const HotelsIcon = () => (
  <svg viewBox="0 0 100 80" width="60" height="60" style={{ overflow: 'visible' }}>
    {/* Shadow */}
    <ellipse cx="50" cy="72" rx="30" ry="5" fill="rgba(0,0,0,0.06)" />
    <g transform="translate(10, 5)">
      {/* Small Block */}
      <path d="M 52,45 L 64,51 L 64,68 L 52,62 Z" fill="#ffffff" stroke="#102a43" strokeWidth="2" strokeLinejoin="round" />
      <path d="M 64,51 L 74,45 L 74,62 L 64,68 Z" fill="#0084ff" stroke="#102a43" strokeWidth="2" strokeLinejoin="round" />
      <path d="M 52,45 L 62,39 L 74,45 L 64,51 Z" fill="#ffffff" stroke="#102a43" strokeWidth="2" strokeLinejoin="round" />
      {/* Main Tower */}
      <path d="M 22,30 L 44,42 L 44,72 L 22,60 Z" fill="#ffffff" stroke="#102a43" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M 44,42 L 58,34 L 58,64 L 44,72 Z" fill="#0084ff" stroke="#102a43" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M 22,30 L 36,22 L 58,34 L 44,42 Z" fill="#ffffff" stroke="#102a43" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Windows on Tower Left Face */}
      <path d="M 27,37 L 31,39 L 31,44 L 27,42 Z" fill="#0084ff" />
      <path d="M 27,47 L 31,49 L 31,54 L 27,52 Z" fill="#0084ff" />
      <path d="M 35,41 L 39,43 L 39,48 L 35,46 Z" fill="#0084ff" />
      <path d="M 35,51 L 39,53 L 39,58 L 35,56 Z" fill="#0084ff" />
    </g>
  </svg>
);

const PackagesIcon = () => (
  <svg viewBox="0 0 100 80" width="60" height="60" style={{ overflow: 'visible' }}>
    {/* Sand Shadow */}
    <ellipse cx="50" cy="70" rx="25" ry="6" fill="rgba(0,0,0,0.06)" />
    <g transform="translate(10, 5)">
      {/* Umbrella Pole */}
      <path d="M 52,70 L 44,40" stroke="#708090" strokeWidth="3" strokeLinecap="round" />
      {/* Beach Ball */}
      <g transform="translate(28, 56)">
        <circle cx="10" cy="10" r="10" fill="#ffffff" stroke="#102a43" strokeWidth="2" />
        <path d="M 10,0 C 6,4 6,16 10,20" fill="none" stroke="#102a43" strokeWidth="1.5" />
        <path d="M 10,0 C 14,4 14,16 10,20" fill="none" stroke="#102a43" strokeWidth="1.5" />
        <path d="M 0,10 C 4,6 16,6 20,10" fill="none" stroke="#102a43" strokeWidth="1.5" />
      </g>
      {/* Umbrella Canopy */}
      <g transform="translate(44, 40) rotate(15)">
        <path d="M -30,5 C -30,-22 30,-22 30,5 C 18,1 8,3 0,5 C -8,3 -18,1 -30,5 Z" fill="#0084ff" stroke="#102a43" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M -20,3.5 Q -10,-15 0,-20 Q -15,-10 -20,3.5 Z" fill="#ffffff" stroke="#102a43" strokeWidth="1.5" />
        <path d="M 20,3.5 Q 10,-15 0,-20 Q 15,-10 20,3.5 Z" fill="#ffffff" stroke="#102a43" strokeWidth="1.5" />
        <circle cx="0" cy="-20" r="2.5" fill="#102a43" />
      </g>
    </g>
  </svg>
);

const TrainsIcon = () => (
  <svg viewBox="0 0 100 80" width="60" height="60" style={{ overflow: 'visible' }}>
    {/* Shadow */}
    <ellipse cx="50" cy="72" rx="25" ry="5" fill="rgba(0,0,0,0.06)" />

    {/* Train Group centered */}
    <g transform="translate(32, 5)">
      {/* Train tracks background */}
      <path d="M 12,68 L 35,56" stroke="#cbd5e1" strokeWidth="2.5" />
      <path d="M 20,72 L 43,60" stroke="#cbd5e1" strokeWidth="2.5" />
      {/* Train */}
      <path d="M 8,50 L 26,41 L 26,59 L 8,68 Z" fill="#ffffff" stroke="#102a43" strokeWidth="2" strokeLinejoin="round" />
      <path d="M 8,56 L 26,47 L 26,51 L 8,60 Z" fill="#0084ff" />
      <path d="M 26,41 L 38,35 L 38,53 L 26,59 Z" fill="#ffffff" stroke="#102a43" strokeWidth="2" strokeLinejoin="round" />
      <path d="M 28,43 L 36,39 L 36,45 L 28,49 Z" fill="#102a43" />
      <path d="M 8,50 L 20,44 L 38,35 L 26,41 Z" fill="#ffffff" stroke="#102a43" strokeWidth="2" strokeLinejoin="round" />
    </g>
  </svg>
);

const CarsIcon = () => (
  <svg viewBox="0 0 100 80" width="60" height="60" style={{ overflow: 'visible' }}>
    <ellipse cx="50" cy="70" rx="28" ry="5" fill="rgba(0,0,0,0.06)" />
    <g transform="translate(10, 5)">
      {/* Car Body */}
      <path d="M 15,52 C 15,52 30,42 50,42 L 72,50 L 72,60 C 72,60 55,64 35,64 C 20,64 15,58 15,52 Z" fill="#0084ff" stroke="#102a43" strokeWidth="2" strokeLinejoin="round" />
      {/* Cabin */}
      <path d="M 30,43 L 42,28 C 45,26 50,26 60,26 L 68,34 L 70,45 Z" fill="#ffffff" stroke="#102a43" strokeWidth="2" strokeLinejoin="round" />
      {/* Front Windshield */}
      <path d="M 60,26 L 68,34 L 66,42 L 53,37 Z" fill="#102a43" />
      {/* Side Windows */}
      <path d="M 34,41 L 42,31 L 50,31 L 48,39 Z" fill="#ffffff" stroke="#102a43" strokeWidth="1" />
      <path d="M 52,38 L 53,31 L 58,31 L 62,37 Z" fill="#ffffff" stroke="#102a43" strokeWidth="1" />
      {/* Wheels */}
      <circle cx="32" cy="62" r="7" fill="#102a43" />
      <circle cx="32" cy="62" r="3" fill="#cbd5e1" />
      <circle cx="62" cy="56" r="7" fill="#102a43" />
      <circle cx="62" cy="56" r="3" fill="#cbd5e1" />
    </g>
  </svg>
);

const BusesIcon = () => (
  <svg viewBox="0 0 100 80" width="60" height="60" style={{ overflow: 'visible' }}>
    <ellipse cx="50" cy="72" rx="25" ry="5" fill="rgba(0,0,0,0.06)" />
    <g transform="translate(25, 5)">
      <path d="M 8,10 L 42,10 C 45,10 46,12 46,15 L 46,60 C 46,62 44,64 42,64 L 8,64 C 6,64 4,62 4,60 L 4,15 C 4,12 5,10 8,10 Z" fill="#ffffff" stroke="#102a43" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M 4,28 L 46,28" stroke="#102a43" strokeWidth="2.5" />
      <path d="M 8,14 L 42,14 L 42,24 L 8,24 Z" fill="#0084ff" stroke="#102a43" strokeWidth="2" strokeLinejoin="round" />
      <path d="M 8,34 L 21,34 L 21,44 L 8,44 Z" fill="#0084ff" stroke="#102a43" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M 29,34 L 42,34 L 42,44 L 29,44 Z" fill="#0084ff" stroke="#102a43" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="56" r="3.5" fill="#ffd700" stroke="#102a43" strokeWidth="1.5" />
      <circle cx="38" cy="56" r="3.5" fill="#ffd700" stroke="#102a43" strokeWidth="1.5" />
      <path d="M 12,64 L 12,68 L 18,68 L 18,64" stroke="#102a43" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 32,64 L 32,68 L 38,68 L 38,64" stroke="#102a43" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  </svg>
);

const Home = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('flights');
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [userReviews, setUserReviews] = useState([]);

  // Local Navbar states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [maxPrice, setMaxPrice] = useState(150000);
  const [hotels, setHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [hotelSearchTerm, setHotelSearchTerm] = useState('');
  const [hotelMaxPrice, setHotelMaxPrice] = useState(25000);

  // Extra rich filter states for Hotels
  const [selectedHotelStars, setSelectedHotelStars] = useState([]);
  const [selectedHotelAmenities, setSelectedHotelAmenities] = useState([]);
  const [selectedHotelMinRating, setSelectedHotelMinRating] = useState(0);
  const [hotelSortBy, setHotelSortBy] = useState('price_low');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('all');

  // Extra rich filter states for Holiday Packages
  const [selectedPkgThemes, setSelectedPkgThemes] = useState([]);
  const [selectedPkgDurations, setSelectedPkgDurations] = useState([]);
  const [selectedPkgInclusions, setSelectedPkgInclusions] = useState([]);
  const [selectedPkgMinRating, setSelectedPkgMinRating] = useState(0);
  const [pkgSortBy, setPkgSortBy] = useState('price_low');

  // Theme state from Context
  const { theme, toggleTheme } = useTheme();

  // Extra states for homepage limit pagination & debouncing
  const [homeHotelLimit, setHomeHotelLimit] = useState(6);
  const [homePkgLimit, setHomePkgLimit] = useState(6);
  const [debouncedHotelSearchTerm, setDebouncedHotelSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Flight search states
  const [flightType, setFlightType] = useState('oneway'); // oneway, roundtrip, multicity
  const [fromCity, setFromCity] = useState('New Delhi');
  const [toCity, setToCity] = useState('Mumbai');
  const [depDate, setDepDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState('');
  const [flightClass, setFlightClass] = useState('Economy');

  // Hotel search states
  const [hotelCity, setHotelCity] = useState('New Delhi');
  const [checkIn, setCheckIn] = useState(new Date().toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [guests, setGuests] = useState('2 Guests, 1 Room');

  // Train search states
  const [trainFrom, setTrainFrom] = useState('New Delhi');
  const [trainTo, setTrainTo] = useState('Goa');
  const [trainDate, setTrainDate] = useState(new Date().toISOString().split('T')[0]);

  // Bus search states
  const [busFrom, setBusFrom] = useState('New Delhi');
  const [busTo, setBusTo] = useState('Mumbai');
  const [busDate, setBusDate] = useState(new Date().toISOString().split('T')[0]);

  // Holiday packages search states
  const [pkgDest, setPkgDest] = useState('');
  const [pkgCat, setPkgCat] = useState('');

  // Car rental search states
  const [carCity, setCarCity] = useState('New Delhi');
  const [carRentalType, setCarRentalType] = useState('Self Drive');
  const [carDate, setCarDate] = useState(new Date().toISOString().split('T')[0]);
  const [carTime, setCarTime] = useState('17:00');
  const [carDropDate, setCarDropDate] = useState(new Date().toISOString().split('T')[0]);
  const [carDropTime, setCarDropTime] = useState('05:00');

  const checkAuth = () => {
    const token = localStorage.getItem('access_token');
    const name = localStorage.getItem('first_name') || localStorage.getItem('username');
    const isStaff = localStorage.getItem('is_staff') === 'true';
    const username = localStorage.getItem('username');

    if (token && name) {
      setIsLoggedIn(true);
      setFirstName(name);
      setIsAdmin(isStaff || username === 'admin');
    } else {
      setIsLoggedIn(false);
      setFirstName('');
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkAuth();
    const handleProfileUpdate = () => {
      checkAuth();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (['flights', 'hotels', 'trains', 'buses', 'packages', 'cars'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await api.get('promotions/offers/');
        setOffers(response.data);
      } catch (err) {
        console.error("Failed to load offers", err);
      } finally {
        setLoadingOffers(false);
      }
    };
    const fetchReviews = async () => {
      try {
        const response = await api.get('reviews/');
        setUserReviews(response.data);
      } catch (err) {
        console.error("Failed to load reviews", err);
      }
    };
    fetchOffers();
    fetchReviews();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedHotelSearchTerm(hotelSearchTerm);
    }, 250);
    return () => clearTimeout(handler);
  }, [hotelSearchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setHomeHotelLimit(6);
    setHomePkgLimit(6);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'packages' && packages.length === 0) {
      const fetchPackages = async () => {
        setLoadingPackages(true);
        try {
          const response = await api.get('packages/');
          setPackages(response.data);
        } catch (err) {
          console.error("Failed to load packages", err);
        } finally {
          setLoadingPackages(false);
        }
      };
      fetchPackages();
    }
  }, [activeTab, packages.length]);

  const filteredPackages = packages.filter((pkg) => {
    const term = debouncedSearchTerm.toLowerCase().trim();
    const matchesSearch =
      term === '' ||
      pkg.title.toLowerCase().includes(term) ||
      pkg.destination.toLowerCase().includes(term) ||
      (pkg.description && pkg.description.toLowerCase().includes(term));

    const matchesPrice = parseFloat(pkg.price) <= maxPrice;

    const theme = getPackageTheme(pkg);
    const matchesTheme = selectedPkgThemes.length === 0 || selectedPkgThemes.includes(theme);

    const durCat = getPackageDurationCategory(pkg.duration || '');
    const matchesDuration = selectedPkgDurations.length === 0 || selectedPkgDurations.includes(durCat);

    const inclusions = getPackageInclusions(pkg.id);
    const matchesInclusions = selectedPkgInclusions.length === 0 || selectedPkgInclusions.every(inc => inclusions.includes(inc));

    const rating = parseFloat(pkg.rating || 0);
    const matchesMinRating = selectedPkgMinRating === 0 || rating >= selectedPkgMinRating;

    return matchesSearch && matchesPrice && matchesTheme && matchesDuration && matchesInclusions && matchesMinRating;
  }).sort((a, b) => {
    if (pkgSortBy === 'price_low') return parseFloat(a.price) - parseFloat(b.price);
    if (pkgSortBy === 'price_high') return parseFloat(b.price) - parseFloat(a.price);
    if (pkgSortBy === 'rating') return parseFloat(b.rating || 0) - parseFloat(a.rating || 0);
    return 0;
  });
  const visibleHomePkgs = filteredPackages.slice(0, homePkgLimit);

  useEffect(() => {
    if (activeTab === 'hotels' && hotels.length === 0) {
      const fetchHotels = async () => {
        setLoadingHotels(true);
        try {
          const response = await api.get('hotels/');
          setHotels(response.data);
        } catch (err) {
          console.error("Failed to load hotels", err);
        } finally {
          setLoadingHotels(false);
        }
      };
      fetchHotels();
    }
  }, [activeTab, hotels.length]);

  const filteredHotels = hotels.filter((hotel) => {
    const term = debouncedHotelSearchTerm.toLowerCase().trim();
    const matchesSearch =
      term === '' ||
      hotel.name.toLowerCase().includes(term) ||
      hotel.city.toLowerCase().includes(term) ||
      (hotel.address && hotel.address.toLowerCase().includes(term));

    const matchesPrice = parseFloat(hotel.price_per_night) <= hotelMaxPrice;

    const rating = parseFloat(hotel.rating || 0);
    const matchesStars = selectedHotelStars.length === 0 || selectedHotelStars.some(star => {
      if (star === 5) return rating >= 4.7;
      if (star === 4) return rating >= 4.0 && rating < 4.7;
      if (star === 3) return rating >= 3.0 && rating < 4.0;
      return false;
    });

    const matchesMinRating = selectedHotelMinRating === 0 || rating >= selectedHotelMinRating;

    const amenities = getHotelAmenities(hotel.id);
    const matchesAmenities = selectedHotelAmenities.length === 0 || selectedHotelAmenities.every(am => amenities.includes(am));

    return matchesSearch && matchesPrice && matchesStars && matchesMinRating && matchesAmenities;
  }).sort((a, b) => {
    if (hotelSortBy === 'price_low') return parseFloat(a.price_per_night) - parseFloat(b.price_per_night);
    if (hotelSortBy === 'price_high') return parseFloat(b.price_per_night) - parseFloat(a.price_per_night);
    if (hotelSortBy === 'rating') return parseFloat(b.rating || 0) - parseFloat(a.rating || 0);
    return 0;
  });
  const visibleHomeHotels = filteredHotels.slice(0, homeHotelLimit);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('first_name');
    setIsLoggedIn(false);
    setFirstName('');
    setIsAdmin(false);
    navigate('/');
  };

  const handleSearch = () => {
    if (activeTab === 'flights') {
      if (fromCity === toCity) {
        alert('Departure and Arrival cities cannot be the same!');
        return;
      }
      navigate(`/flights?from_city=${fromCity}&to_city=${toCity}&departure_date=${depDate}&type=${flightType}&class=${flightClass}&return_date=${returnDate}`);
    } else if (activeTab === 'hotels') {
      navigate(`/hotels?city=${hotelCity}&check_in=${checkIn}&check_out=${checkOut}&guests=${guests}`);
    } else if (activeTab === 'trains') {
      if (trainFrom === trainTo) {
        alert('Origin and Destination cities cannot be the same!');
        return;
      }
      navigate(`/trains?from_city=${trainFrom}&to_city=${trainTo}&departure_date=${trainDate}`);
    } else if (activeTab === 'buses') {
      if (busFrom === busTo) {
        alert('Origin and Destination cities cannot be the same!');
        return;
      }
      navigate(`/buses?from_city=${busFrom}&to_city=${busTo}&departure_date=${busDate}`);
    } else if (activeTab === 'packages') {
      navigate(`/packages?destination=${pkgDest}&category=${pkgCat}`);
    } else if (activeTab === 'cars') {
      navigate(`/cars?city=${carCity}&rental_type=${carRentalType}&pickup_date=${carDate}&pickup_time=${carTime}&drop_date=${carDropDate}&drop_time=${carDropTime}`);
    }
  };

  const cities = ['New Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Chennai', 'Goa'];

  return (
    <div>
      {/* 1. Full Screen Video Hero */}
      <section className="home-hero">
        <video autoPlay muted loop playsInline className="home-hero-video">
          <source src={poolVideo} type="video/mp4" />
        </video>
        <div className="home-hero-text d-flex flex-column align-items-center justify-content-center text-center gap-3 px-3" style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)' }}>
          <div className="d-flex align-items-center justify-content-center flex-wrap gap-2">
            <div className="d-inline-flex align-items-center" style={{ verticalAlign: 'middle', textShadow: 'none' }}>
              <span style={{ fontSize: '3.2em', letterSpacing: '-2px', fontWeight: '800', color: '#ffffff', fontFamily: "'Poppins', sans-serif" }}>Globe</span>
              <span style={{ fontSize: '3.2em', letterSpacing: '-2px', fontWeight: '800', color: '#ff3838', fontFamily: "'Poppins', sans-serif", marginLeft: '4px' }}>Trotter</span>
            </div>
          </div>
          <p style={{ fontSize: '22px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', fontFamily: "'Poppins', sans-serif", letterSpacing: '0.5px', margin: '0' }}>
            Empowering Personalized Travel Planning across India & Worldwide 🌴🎒
          </p>
          <button
            onClick={() => {
              const token = localStorage.getItem('access_token');
              if (token) {
                navigate('/trips/new');
              } else {
                setIsAuthOpen(true);
              }
            }}
            className="btn rounded-pill px-4 py-2.5 fw-bold text-white border-0 mt-2 d-inline-flex align-items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #ff3838 0%, #d63031 100%)',
              fontSize: '16px',
              letterSpacing: '0.3px',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(255, 56, 56, 0.55)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(255, 56, 56, 0.75)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 56, 56, 0.55)';
            }}
          >
            <FaSuitcase size={18} /> Make a Trip
          </button>
        </div>
      </section>

      {/* 2. Parallax Sticky Navbar */}
      <nav
        id="navbar"
        className="navbar navbar-expand-lg navbar-gt sticky-top home-navbar"
      >
        <div className="container">
          <Link
            className="navbar-brand d-flex align-items-center"
            to="/"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('travel-banner');
              if (el) {
                const rect = el.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                window.scrollTo({ top: rect.top + scrollTop - 100, behavior: 'smooth' });
              }
            }}
            style={{ textDecoration: 'none' }}
          >
            <span style={{ fontSize: '28px', letterSpacing: '-1.5px', fontWeight: '800', color: 'var(--primary-sage)', fontFamily: "'Poppins', sans-serif" }}>Globe</span>
            <span style={{ fontSize: '28px', letterSpacing: '-1.5px', fontWeight: '800', color: '#ff3838', fontFamily: "'Poppins', sans-serif" }}>Trotter</span>
          </Link>

          <div className="d-flex align-items-center gap-2 order-lg-last">
            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center p-2 border shadow-sm"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              style={{
                width: '38px',
                height: '38px',
                backgroundColor: theme === 'light' ? '#f1f5f9' : '#334155',
                color: theme === 'light' ? '#0f172a' : '#f8fafc',
                cursor: 'pointer'
              }}
            >
              {theme === 'light' ? <FaMoon size={16} /> : <FaSun size={16} />}
            </button>

            {isLoggedIn ? (
              <>
                <Link
                  to={isAdmin ? "/admin-dashboard" : "/dashboard"}
                  className="d-flex align-items-center gap-2 px-3 py-2 fw-semibold text-decoration-none"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '14px',
                    color: 'var(--primary-sage)',
                    backgroundColor: 'rgba(45, 74, 62, 0.06)',
                    border: '1px solid rgba(45, 74, 62, 0.15)',
                    borderRadius: '50px',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(45, 74, 62, 0.12)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(45, 74, 62, 0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <i className='bx bx-user' style={{ fontSize: '18px' }}></i>
                  <span>Hi, {firstName}</span>
                  {isAdmin && (
                    <span style={{
                      fontSize: '10px',
                      backgroundColor: 'var(--primary-sage)',
                      color: '#ffffff',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      marginLeft: '4px',
                      fontWeight: '700'
                    }}>
                      Admin
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="d-flex align-items-center justify-content-center border-0 ms-2"
                  title="Logout"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(220, 53, 69, 0.08)',
                    color: '#dc3545',
                    border: '1px solid rgba(220, 53, 69, 0.15)',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.16)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.08)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <FaSignOutAlt size={16} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="navbar-profile-btn"
                title="Login / Signup"
              >
                <i className='bx bx-user'></i>
              </button>
            )}

            <button className="navbar-toggler border-0 d-lg-none bg-transparent p-0 ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#navbarHomeText">
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          <div className="collapse navbar-collapse justify-content-between" id="navbarHomeText">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-1 d-flex flex-nowrap align-items-center">
              <li className="nav-item">
                <button
                  className="nav-link px-3 py-1.5 fw-semibold border-0 bg-transparent active"
                  onClick={() => {
                    const el = document.getElementById('travel-banner');
                    if (el) {
                      const rect = el.getBoundingClientRect();
                      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                      window.scrollTo({ top: rect.top + scrollTop - 95, behavior: 'smooth' });
                    }
                  }}
                >
                  Home
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link px-3 py-1.5 fw-semibold border-0 bg-transparent text-muted"
                  onClick={() => { document.getElementById('search-tabs')?.scrollIntoView({ behavior: 'smooth' }); }}
                >
                  Explore
                </button>
              </li>
              <li className="nav-item">
                <Link
                  to="/trips"
                  className="nav-link px-3 py-1.5 fw-semibold text-decoration-none text-muted"
                >
                  Plan Trips
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/trips"
                  className="nav-link px-3 py-1.5 fw-semibold text-decoration-none text-muted"
                >
                  Community
                </Link>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link px-3 py-1.5 fw-semibold border-0 bg-transparent text-muted"
                  onClick={() => {
                    navigate('/about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  About
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link px-3 py-1.5 fw-semibold border-0 bg-transparent text-muted"
                  onClick={() => {
                    navigate('/contact');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* 3. Main Content Wrapper */}
      <div className="home-content-wrapper pb-5">
        <div className={(activeTab === 'hotels' || activeTab === 'packages') ? "container-fluid px-md-5 px-4 pt-5" : "container px-4 pt-5"}>
          {/* TravelEase Ad Banner */}
          <div
            id="travel-banner"
            className="travel-banner-card mx-auto mb-4 position-relative overflow-hidden shadow-sm"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${p1Image})`
            }}
          >
            <div className="travel-banner-overlay d-flex flex-column justify-content-center align-items-center text-center p-4">
              <h1 className="travel-banner-title mb-2 text-white d-flex align-items-center justify-content-center flex-wrap gap-2">
                <span style={{ fontFamily: "'Poppins', sans-serif" }}>Explore India with</span>
                <div className="d-inline-flex align-items-center" style={{ verticalAlign: 'middle', textShadow: 'none' }}>
                  <span style={{ fontSize: '1.0em', letterSpacing: '-1.5px', fontWeight: '800', color: '#ffffff', fontFamily: "'Poppins', sans-serif" }}>Globe</span>
                  <span style={{ fontSize: '1.0em', letterSpacing: '-1.5px', fontWeight: '800', color: '#ff3838', fontFamily: "'Poppins', sans-serif" }}>Trotter</span>
                </div>
              </h1>
              <p className="travel-banner-subtitle text-white-50 mb-0">Find the best deals on flights, hotels, and more for your next adventure.</p>
            </div>
          </div>

          {/* Search Category Tabs floating above the Card */}
          <div id="search-tabs" className="search-tabs-container">
            <button
              className={`search-card-tab ${activeTab === 'flights' ? 'active' : ''}`}
              onClick={() => setActiveTab('flights')}
            >
              <FlightsIcon />
              <span>Flights</span>
            </button>
            <button
              className={`search-card-tab ${activeTab === 'hotels' ? 'active' : ''}`}
              onClick={() => setActiveTab('hotels')}
            >
              <HotelsIcon />
              <span>Hotels</span>
            </button>
            <button
              className={`search-card-tab ${activeTab === 'packages' ? 'active' : ''}`}
              onClick={() => setActiveTab('packages')}
            >
              <PackagesIcon />
              <span>Holiday Packages</span>
            </button>
            <button
              className={`search-card-tab ${activeTab === 'trains' ? 'active' : ''}`}
              onClick={() => setActiveTab('trains')}
            >
              <TrainsIcon />
              <span>Trains</span>
            </button>
            <button
              className={`search-card-tab ${activeTab === 'buses' ? 'active' : ''}`}
              onClick={() => setActiveTab('buses')}
            >
              <BusesIcon />
              <span>Buses</span>
            </button>
            <button
              className={`search-card-tab ${activeTab === 'cars' ? 'active' : ''}`}
              onClick={() => setActiveTab('cars')}
            >
              <CarsIcon />
              <span>Car Rentals</span>
            </button>
          </div>

          <div className="search-widget-card mx-auto shadow-lg border p-4" style={{ maxWidth: (activeTab === 'hotels' || activeTab === 'packages') ? '100%' : '1100px', marginTop: '15px' }}>
            {activeTab === 'packages' ? (
              /* Render all packages directly */
              <div className="animate-fade-in text-start">
                <div className="text-center mb-4 border-bottom pb-3">
                  <h4 className="fw-bold text-dark-blue mb-1">Holiday Packages</h4>
                  <span className="text-muted small">{filteredPackages.length} Packages Found</span>
                </div>

                {loadingPackages ? (
                  <div className="row g-4">
                    <div className="col-lg-3 col-md-4">
                      <div className="p-4 rounded-4 bg-white shadow-sm border border-light-subtle">
                        <div className="skeleton w-75 mb-3" style={{ height: '20px' }}></div>
                        <div className="skeleton w-100 mb-3" style={{ height: '35px' }}></div>
                        <div className="skeleton w-100" style={{ height: '80px' }}></div>
                      </div>
                    </div>
                    <div className="col-lg-9 col-md-8">
                      <SkeletonGridLoader />
                    </div>
                  </div>
                ) : (
                  <div className="row g-4">
                    {/* Left Sticky Sidebar for Package filters */}
                    <div className="col-lg-3 col-md-4 text-start">
                      <div className="p-4 rounded-4 bg-white shadow-sm border border-light-subtle position-sticky" style={{ top: '100px', zIndex: 10 }}>
                        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                          <h5 className="fw-bold text-dark-blue mb-0 d-flex align-items-center gap-2">
                            <FaFilter size={14} className="text-coral-orange" /> Filter Options
                          </h5>
                          {(searchTerm || maxPrice < 150000 || selectedPkgThemes.length > 0 || selectedPkgDurations.length > 0 || selectedPkgInclusions.length > 0 || selectedPkgMinRating > 0 || pkgSortBy !== 'price_low') && (
                            <button
                              type="button"
                              className="btn btn-link btn-sm text-decoration-none p-0 text-danger fw-bold"
                              style={{ fontSize: '12px' }}
                              onClick={() => {
                                setSearchTerm('');
                                setDebouncedSearchTerm('');
                                setMaxPrice(150000);
                                setSelectedPkgThemes([]);
                                setSelectedPkgDurations([]);
                                setSelectedPkgInclusions([]);
                                setSelectedPkgMinRating(0);
                                setPkgSortBy('price_low');
                              }}
                            >
                              Reset All
                            </button>
                          )}
                        </div>

                        {/* Search Destination */}
                        <div className="mb-4">
                          <span className="filter-section-header">Search Destination</span>
                          <div className="sidebar-search-container">
                            <FaSearch className="sidebar-search-icon" />
                            <input
                              type="text"
                              className="sidebar-search-input"
                              placeholder="e.g. Goa, Kashmir..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                              <button
                                type="button"
                                className="btn p-0 border-0 text-muted position-absolute end-0 me-3"
                                style={{ top: '50%', transform: 'translateY(-50%)', background: 'none' }}
                                onClick={() => setSearchTerm('')}
                              >
                                <FaTimes size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Sort By */}
                        <div className="mb-4">
                          <span className="filter-section-header">Sort By</span>
                          <select
                            className="form-select rounded-3 small fw-semibold"
                            value={pkgSortBy}
                            onChange={(e) => setPkgSortBy(e.target.value)}
                            style={{ fontSize: '13px' }}
                          >
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                            <option value="rating">Highest Rated</option>
                          </select>
                        </div>

                        {/* Price Range Slider */}
                        <div className="mb-4">
                          <span className="filter-section-header">
                            <span>Max Budget / Person</span>
                            <span className="text-success font-monospace fw-bold">₹{maxPrice.toLocaleString('en-IN')}</span>
                          </span>
                          <input
                            type="range"
                            className="form-range"
                            min="5000"
                            max="150000"
                            step="2500"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                          />
                          <div className="d-flex justify-content-between text-muted" style={{ fontSize: '10px' }}>
                            <span>₹5,000</span>
                            <span>₹1,50,000</span>
                          </div>
                        </div>

                        {/* Package Theme Tags */}
                        <div className="mb-4">
                          <span className="filter-section-header">Package Theme</span>
                          <div className="filter-tags-grid">
                            {['Family', 'Honeymoon', 'Beach', 'Nature', 'Adventure', 'Luxury'].map(theme => {
                              const isActive = selectedPkgThemes.includes(theme);
                              return (
                                <button
                                  key={theme}
                                  type="button"
                                  className={`filter-tag-btn ${isActive ? 'active' : ''}`}
                                  onClick={() => {
                                    setSelectedPkgThemes(prev =>
                                      prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
                                    );
                                  }}
                                >
                                  {theme}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Duration Category */}
                        <div className="mb-4">
                          <span className="filter-section-header">Trip Duration</span>
                          <div className="d-flex flex-column gap-2">
                            {['Short (1-3 Days)', 'Medium (4-6 Days)', 'Long (7+ Days)'].map(dur => {
                              const isChecked = selectedPkgDurations.includes(dur);
                              return (
                                <label key={dur} className="d-flex align-items-center gap-2 cursor-pointer small text-muted hover-text-dark">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={isChecked}
                                    onChange={() => {
                                      setSelectedPkgDurations(prev =>
                                        prev.includes(dur) ? prev.filter(d => d !== dur) : [...prev, dur]
                                      );
                                    }}
                                  />
                                  <span style={{ fontSize: '12px' }}>{dur}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* Inclusions Filter */}
                        <div className="mb-4">
                          <span className="filter-section-header">Inclusions</span>
                          <div className="d-flex flex-column gap-2" style={{ maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                            {["Flights", "Luxury Stay", "Meals Included", "Private Cab", "Tour Guide", "Sightseeing"].map(inc => {
                              const isChecked = selectedPkgInclusions.includes(inc);
                              return (
                                <label key={inc} className="d-flex align-items-center gap-2 cursor-pointer small text-muted hover-text-dark">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={isChecked}
                                    onChange={() => {
                                      setSelectedPkgInclusions(prev =>
                                        prev.includes(inc) ? prev.filter(i => i !== inc) : [...prev, inc]
                                      );
                                    }}
                                  />
                                  <span style={{ fontSize: '12px' }}>✓ {inc}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* Minimum User Rating */}
                        <div className="mb-3">
                          <span className="filter-section-header">Guest Rating</span>
                          <div className="d-flex flex-wrap gap-1.5">
                            {[
                              { label: 'Any', val: 0 },
                              { label: '4.5+ ★', val: 4.5 },
                              { label: '4.0+ ★', val: 4.0 }
                            ].map((r) => {
                              const isActive = selectedPkgMinRating === r.val;
                              return (
                                <button
                                  key={r.val}
                                  type="button"
                                  className={`filter-tag-btn ${isActive ? 'active' : ''}`}
                                  style={{ padding: '4px 10px', fontSize: '11.5px' }}
                                  onClick={() => setSelectedPkgMinRating(r.val)}
                                >
                                  {r.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Right column for packages */}
                    <div className="col-lg-9 col-md-8">
                      {filteredPackages.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                          <h5>No packages match your search filters.</h5>
                          <button className="btn btn-outline-primary btn-sm mt-3 rounded-pill" onClick={() => { setSearchTerm(''); setMaxPrice(50000); }}>Clear Filters</button>
                        </div>
                      ) : (
                        <div>
                          <div className="row g-4">
                            {visibleHomePkgs.map((pkg) => {
                              const inclusions = getPackageInclusions(pkg.id);
                              return (
                                <div key={pkg.id} className="col-xxl-4 col-xl-4 col-md-6">
                                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative hover-up" style={{ transition: 'all 0.3s ease', background: '#ffffff' }}>
                                    <div className="hotel-img-container" style={{ height: '180px' }}>
                                      <img
                                        src={pkg.image_url || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'}
                                        alt={pkg.title}
                                        className="hotel-img w-100 h-100"
                                        style={{ objectFit: 'cover' }}
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'; }}
                                      />
                                    </div>
                                    <span className="badge bg-warning text-dark position-absolute end-0 m-3 px-3 py-1.5 rounded-pill fw-bold small shadow-sm" style={{ top: '0px', zIndex: 10 }}>
                                      ★ {pkg.rating}
                                    </span>
                                    <div className="deal-tag position-absolute m-3 px-2 py-1" style={{ top: '0px', left: '0px', zIndex: 10 }}>
                                      Featured
                                    </div>
                                    <div className="card-body p-4 text-start d-flex flex-column justify-content-between">
                                      <div>
                                        <div className="d-flex flex-wrap gap-1.5 mb-2.5">
                                          <span className="badge bg-info-subtle text-info px-2.5 py-1 rounded small fw-bold">
                                            🕒 {pkg.duration}
                                          </span>
                                          <span className="badge bg-primary-subtle text-primary px-2.5 py-1 rounded small fw-bold">
                                            ✨ {getPackageTheme(pkg)}
                                          </span>
                                        </div>

                                        <h6 className="card-title fw-bold text-dark-blue mb-2 text-truncate" title={pkg.title}>{pkg.title}</h6>
                                        <p className="text-muted small mb-3" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px', lineHeight: '1.4' }}>
                                          {pkg.description}
                                        </p>

                                        {/* Inclusions list */}
                                        <div className="border-top pt-2 mt-2 mb-3">
                                          <small className="text-muted fw-bold d-block mb-1" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>INCLUSIONS:</small>
                                          <div className="d-flex flex-wrap gap-1">
                                            {inclusions.slice(0, 3).map((inc, idx) => (
                                              <span key={idx} className="badge bg-light text-secondary border px-2 py-1.5 small rounded-pill fw-semibold" style={{ fontSize: '10px' }}>
                                                ✓ {inc}
                                              </span>
                                            ))}
                                            {inclusions.length > 3 && (
                                              <span className="badge bg-light text-muted border px-2 py-1 small rounded-pill" style={{ fontSize: '10px' }}>+{inclusions.length - 3}</span>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="mt-auto">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                          <span className="text-muted small">Price / person:</span>
                                          <span className="fw-bold text-success fs-5">
                                            ₹{parseFloat(pkg.price).toLocaleString('en-IN')}
                                          </span>
                                        </div>
                                        <Link
                                          to={`/booking-details?type=packages&id=${pkg.id}`}
                                          className="btn btn-primary btn-sm rounded-pill w-100 fw-bold py-2 shadow-sm"
                                        >
                                          Book Package
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Pagination show more */}
                          {filteredPackages.length > homePkgLimit && (
                            <div className="text-center mt-4 load-more-container">
                              <button
                                type="button"
                                className="btn btn-load-more shadow-sm"
                                onClick={() => setHomePkgLimit(prev => prev + 6)}
                              >
                                View More Packages <FaChevronRight size={10} className="ms-1" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : activeTab === 'hotels' ? (
              /* Render all hotels directly */
              <div className="animate-fade-in text-start">
                <div className="text-center mb-4 border-bottom pb-3">
                  <h4 className="fw-bold text-dark-blue mb-1">Premium Stays & Luxury Hotels</h4>
                  <span className="text-muted small">{filteredHotels.length} Hotels Found</span>
                </div>

                {loadingHotels ? (
                  <div className="row g-4">
                    <div className="col-lg-3 col-md-4">
                      <div className="p-4 rounded-4 bg-white shadow-sm border border-light-subtle">
                        <div className="skeleton w-75 mb-3" style={{ height: '20px' }}></div>
                        <div className="skeleton w-100 mb-3" style={{ height: '35px' }}></div>
                        <div className="skeleton w-100" style={{ height: '80px' }}></div>
                      </div>
                    </div>
                    <div className="col-lg-9 col-md-8">
                      <SkeletonGridLoader />
                    </div>
                  </div>
                ) : (
                  <div className="row g-4">
                    {/* Left Sticky Sidebar for Hotel filters */}
                    <div className="col-lg-3 col-md-4 text-start">
                      <div className="p-4 rounded-4 bg-white shadow-sm border border-light-subtle position-sticky" style={{ top: '100px', zIndex: 10 }}>
                        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                          <h5 className="fw-bold text-dark-blue mb-0 d-flex align-items-center gap-2">
                            <FaFilter size={14} className="text-coral-orange" /> Filter Options
                          </h5>
                          {(hotelSearchTerm || hotelMaxPrice < 25000 || selectedHotelStars.length > 0 || selectedHotelAmenities.length > 0 || selectedHotelMinRating > 0 || hotelSortBy !== 'price_low') && (
                            <button
                              type="button"
                              className="btn btn-link btn-sm text-decoration-none p-0 text-danger fw-bold"
                              style={{ fontSize: '12px' }}
                              onClick={() => {
                                setHotelSearchTerm('');
                                setDebouncedHotelSearchTerm('');
                                setHotelMaxPrice(25000);
                                setSelectedHotelStars([]);
                                setSelectedHotelAmenities([]);
                                setSelectedHotelMinRating(0);
                                setHotelSortBy('price_low');
                              }}
                            >
                              Reset All
                            </button>
                          )}
                        </div>

                        {/* Search Hotel / City */}
                        <div className="mb-4">
                          <span className="filter-section-header">Search Hotel / City</span>
                          <div className="sidebar-search-container">
                            <FaSearch className="sidebar-search-icon" />
                            <input
                              type="text"
                              className="sidebar-search-input"
                              placeholder="e.g. Taj, Goa..."
                              value={hotelSearchTerm}
                              onChange={(e) => setHotelSearchTerm(e.target.value)}
                            />
                            {hotelSearchTerm && (
                              <button
                                type="button"
                                className="btn p-0 border-0 text-muted position-absolute end-0 me-3"
                                style={{ top: '50%', transform: 'translateY(-50%)', background: 'none' }}
                                onClick={() => setHotelSearchTerm('')}
                              >
                                <FaTimes size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Sort By */}
                        <div className="mb-4">
                          <span className="filter-section-header">Sort By</span>
                          <select
                            className="form-select rounded-3 small fw-semibold"
                            value={hotelSortBy}
                            onChange={(e) => setHotelSortBy(e.target.value)}
                            style={{ fontSize: '13px' }}
                          >
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                            <option value="rating">Top Rated (Stars)</option>
                          </select>
                        </div>

                        {/* Price Range Slider */}
                        <div className="mb-4">
                          <span className="filter-section-header">
                            <span>Max Price / Night</span>
                            <span className="text-success font-monospace fw-bold">₹{hotelMaxPrice.toLocaleString('en-IN')}</span>
                          </span>
                          <input
                            type="range"
                            className="form-range"
                            min="3000"
                            max="25000"
                            step="500"
                            value={hotelMaxPrice}
                            onChange={(e) => setHotelMaxPrice(parseInt(e.target.value))}
                          />
                          <div className="d-flex justify-content-between text-muted" style={{ fontSize: '10px' }}>
                            <span>₹3,000</span>
                            <span>₹25,000</span>
                          </div>
                        </div>

                        {/* Star Rating Category */}
                        <div className="mb-4">
                          <span className="filter-section-header">Star Category</span>
                          <div className="d-flex flex-column gap-1.5">
                            {[5, 4, 3].map(stars => {
                              const isActive = selectedHotelStars.includes(stars);
                              return (
                                <button
                                  key={stars}
                                  type="button"
                                  className={`star-rating-filter ${isActive ? 'active' : ''}`}
                                  onClick={() => {
                                    setSelectedHotelStars(prev =>
                                      prev.includes(stars) ? prev.filter(s => s !== stars) : [...prev, stars]
                                    );
                                  }}
                                >
                                  <span className="d-flex align-items-center gap-1 text-warning">
                                    {Array.from({ length: stars }).map((_, i) => <FaStar key={i} size={13} />)}
                                  </span>
                                  <span className="small text-muted ms-auto">
                                    {stars === 5 ? '4.7+' : stars === 4 ? '4.0-4.6' : '3.0-3.9'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Room Type & Occupancy Filter */}
                        <div className="mb-4">
                          <span className="filter-section-header">Room Type & Capacity</span>
                          <div className="d-flex flex-column gap-1.5">
                            {[
                              { label: 'All Room Types', val: 'all' },
                              { label: '👩‍❤️‍👨 Couple Room (2 Guests)', val: 'couple' },
                              { label: '👨‍👩‍👧‍👦 Family Room (4 Guests)', val: 'family' },
                              { label: '🥳 Friends Room (6 Guests)', val: 'friends' }
                            ].map((rt) => {
                              const isActive = selectedRoomFilter === rt.val;
                              return (
                                <button
                                  key={rt.val}
                                  type="button"
                                  className={`filter-tag-btn w-100 text-start ${isActive ? 'active' : ''}`}
                                  style={{ padding: '6px 12px', fontSize: '11.5px' }}
                                  onClick={() => setSelectedRoomFilter(rt.val)}
                                >
                                  {rt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Minimum User Rating */}
                        <div className="mb-4">
                          <span className="filter-section-header">Guest Rating</span>
                          <div className="d-flex flex-wrap gap-1.5">
                            {[
                              { label: 'Any', val: 0 },
                              { label: '4.5+ ★', val: 4.5 },
                              { label: '4.0+ ★', val: 4.0 },
                              { label: '3.5+ ★', val: 3.5 }
                            ].map((r) => {
                              const isActive = selectedHotelMinRating === r.val;
                              return (
                                <button
                                  key={r.val}
                                  type="button"
                                  className={`filter-tag-btn ${isActive ? 'active' : ''}`}
                                  style={{ padding: '4px 10px', fontSize: '11.5px' }}
                                  onClick={() => setSelectedHotelMinRating(r.val)}
                                >
                                  {r.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Amenities Filter */}
                        <div className="mb-3">
                          <span className="filter-section-header">Amenities</span>
                          <div className="d-flex flex-column gap-2" style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                            {["Free Wi-Fi", "Swimming Pool", "Spa & Wellness", "Fitness Gym", "Restaurant", "Free Parking", "Room Service", "Bar & Lounge"].map(am => {
                              const isChecked = selectedHotelAmenities.includes(am);
                              return (
                                <label key={am} className="d-flex align-items-center gap-2 cursor-pointer small text-muted hover-text-dark">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={isChecked}
                                    onChange={() => {
                                      setSelectedHotelAmenities(prev =>
                                        prev.includes(am) ? prev.filter(a => a !== am) : [...prev, am]
                                      );
                                    }}
                                  />
                                  <span className="d-flex align-items-center gap-1" style={{ fontSize: '12px' }}>
                                    {getAmenityIcon(am)} {am}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Right column for hotels */}
                    <div className="col-lg-9 col-md-8">
                      {filteredHotels.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                          <h5>No hotels match your search filters.</h5>
                          <button className="btn btn-outline-primary btn-sm mt-3 rounded-pill" onClick={() => { setHotelSearchTerm(''); setHotelMaxPrice(20000); }}>Clear Filters</button>
                        </div>
                      ) : (
                        <div>
                          <div className="row g-4">
                            {visibleHomeHotels.map((hotel) => {
                              const amenities = getHotelAmenities(hotel.id);
                              return (
                                <div key={hotel.id} className="col-xxl-4 col-xl-4 col-md-6">
                                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative hover-up d-flex flex-column justify-content-between" style={{ transition: 'all 0.3s ease', background: '#ffffff' }}>
                                    <div>
                                      <div className="hotel-img-container" style={{ height: '180px' }}>
                                        <img
                                          src={hotel.image_url || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'}
                                          alt={hotel.name}
                                          className="hotel-img w-100 h-100"
                                          style={{ objectFit: 'cover' }}
                                        />
                                      </div>
                                      <span className="badge bg-warning text-dark position-absolute end-0 m-3 px-3 py-1.5 rounded-pill fw-bold small shadow-sm" style={{ top: '0px', zIndex: 10 }}>
                                        ★ {hotel.rating}
                                      </span>
                                      {hotel.id % 3 === 0 && (
                                        <span className="deal-tag position-absolute m-3 px-2 py-1" style={{ top: '0px', left: '0px', zIndex: 10 }}>
                                          15% OFF
                                        </span>
                                      )}
                                      <div className="card-body p-4 text-start">
                                        <span className="badge bg-light text-muted border px-2.5 py-1 rounded-3 fw-bold small mb-2">
                                          📍 {hotel.city}
                                        </span>
                                        <h6 className="card-title fw-bold text-dark-blue mb-1 mt-1 text-truncate" title={hotel.name}>{hotel.name}</h6>
                                        <p className="text-muted small mb-3 text-truncate" style={{ fontSize: '12px' }}>
                                          {hotel.address}
                                        </p>

                                        {/* Amenities list */}
                                        <div className="border-top pt-2 mt-2">
                                          <small className="text-muted fw-bold d-block mb-1.5" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>AMENITIES:</small>
                                          <div className="d-flex flex-wrap gap-1">
                                            {amenities.slice(0, 3).map((am, idx) => (
                                              <span key={idx} className="hotel-amenity-tag" style={{ fontSize: '10px' }}>
                                                {getAmenityIcon(am)} {am}
                                              </span>
                                            ))}
                                            {amenities.length > 3 && (
                                              <span className="badge bg-light text-muted border px-2 py-1.5 small font-monospace rounded-pill">+{amenities.length - 3}</span>
                                            )}
                                          </div>
                                        </div>

                                        {/* Available Room Options */}
                                        <div className="border-top pt-2 mt-2">
                                          <small className="text-muted fw-bold d-block mb-1.5" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>ROOM CONFIGURATIONS:</small>
                                          <div className="d-flex flex-wrap gap-1">
                                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 rounded-pill fw-semibold" style={{ fontSize: '9.5px' }}>
                                              👩‍❤️‍👨 Couple (2P)
                                            </span>
                                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 rounded-pill fw-semibold" style={{ fontSize: '9.5px' }}>
                                              👨‍👩‍👧‍👦 Family (4P)
                                            </span>
                                            <span className="badge bg-warning-subtle text-dark border border-warning-subtle px-2 py-1 rounded-pill fw-semibold" style={{ fontSize: '9.5px' }}>
                                              🥳 Friends (6P)
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="p-4 pt-0">
                                      <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-muted small">Price per night:</span>
                                        <span className="fw-bold text-success fs-5">
                                          ₹{parseFloat(hotel.price_per_night).toLocaleString('en-IN')}
                                        </span>
                                      </div>
                                      <Link
                                        to={`/booking-details?type=hotels&id=${hotel.id}`}
                                        className="btn btn-primary btn-sm rounded-pill w-100 fw-bold py-2 shadow-sm"
                                      >
                                        Book Hotel
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Pagination show more */}
                          {filteredHotels.length > homeHotelLimit && (
                            <div className="text-center mt-4 load-more-container">
                              <button
                                type="button"
                                className="btn btn-load-more shadow-sm"
                                onClick={() => setHomeHotelLimit(prev => prev + 6)}
                              >
                                View More Hotels <FaChevronRight size={10} className="ms-1" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Render standard search forms */
              <>
                {/* Flights Widget */}
                {activeTab === 'flights' && (
                  <div>
                    <div className="d-flex gap-3 mb-3 small fw-semibold text-muted">
                      <label className="d-flex align-items-center gap-1 cursor-pointer">
                        <input type="radio" name="flight_type" checked={flightType === 'oneway'} onChange={() => setFlightType('oneway')} /> One Way
                      </label>
                      <label className="d-flex align-items-center gap-1 cursor-pointer">
                        <input type="radio" name="flight_type" checked={flightType === 'roundtrip'} onChange={() => setFlightType('roundtrip')} /> Round Trip
                      </label>
                    </div>

                    <div className="search-fields-grid">
                      <div className="search-field-box">
                        <label className="text-uppercase"><FaMapMarkerAlt className="text-primary me-1.5" /> From</label>
                        <input
                          type="text"
                          value={fromCity}
                          onChange={(e) => setFromCity(e.target.value)}
                          placeholder="e.g. New Delhi"
                          className="w-100 fw-bold border-0 bg-transparent"
                          style={{ outline: 'none', fontSize: '17px' }}
                        />
                        <span className="small text-muted d-block mt-1">Departure City</span>
                      </div>

                      <div className="search-field-box">
                        <label className="text-uppercase"><FaMapMarkerAlt className="text-danger me-1.5" /> To</label>
                        <input
                          type="text"
                          value={toCity}
                          onChange={(e) => setToCity(e.target.value)}
                          placeholder="e.g. Mumbai"
                          className="w-100 fw-bold border-0 bg-transparent"
                          style={{ outline: 'none', fontSize: '17px' }}
                        />
                        <span className="small text-muted d-block mt-1">Arrival City</span>
                      </div>

                      <div className="search-field-box">
                        <label className="text-uppercase"><FaCalendarAlt className="text-info me-1.5" /> Departure Date</label>
                        <input type="date" value={depDate} onChange={(e) => setDepDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                        <span className="small text-muted d-block mt-1">Choose Date</span>
                      </div>

                      <div className="search-field-box">
                        <label className="text-uppercase"><FaCrown className="text-warning me-1.5" /> Class</label>
                        <select value={flightClass} onChange={(e) => setFlightClass(e.target.value)}>
                          <option value="Economy">Economy</option>
                          <option value="Premium Economy">Premium Economy</option>
                          <option value="Business">Business</option>
                        </select>
                        <span className="small text-muted d-block mt-1">Class Cabin</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Trains Widget */}
                {activeTab === 'trains' && (
                  <div className="search-fields-grid">
                    <div className="search-field-box">
                      <label className="text-uppercase"><FaTrain className="text-success me-1.5" /> From</label>
                      <input
                        type="text"
                        value={trainFrom}
                        onChange={(e) => setTrainFrom(e.target.value)}
                        placeholder="e.g. New Delhi"
                        className="w-100 fw-bold border-0 bg-transparent"
                        style={{ outline: 'none', fontSize: '17px' }}
                      />
                      <span className="small text-muted d-block mt-1">Origin City / Station</span>
                    </div>

                    <div className="search-field-box">
                      <label className="text-uppercase"><FaMapMarkerAlt className="text-danger me-1.5" /> To</label>
                      <input
                        type="text"
                        value={trainTo}
                        onChange={(e) => setTrainTo(e.target.value)}
                        placeholder="e.g. Goa"
                        className="w-100 fw-bold border-0 bg-transparent"
                        style={{ outline: 'none', fontSize: '17px' }}
                      />
                      <span className="small text-muted d-block mt-1">Destination City / Station</span>
                    </div>

                    <div className="search-field-box">
                      <label className="text-uppercase"><FaCalendarAlt className="text-info me-1.5" /> Travel Date</label>
                      <input type="date" value={trainDate} onChange={(e) => setTrainDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                      <span className="small text-muted d-block mt-1">Select Journey Date</span>
                    </div>
                  </div>
                )}

                {/* Buses Widget */}
                {activeTab === 'buses' && (
                  <div className="search-fields-grid">
                    <div className="search-field-box">
                      <label className="text-uppercase"><FaBus className="text-warning me-1.5" /> From</label>
                      <input
                        type="text"
                        value={busFrom}
                        onChange={(e) => setBusFrom(e.target.value)}
                        placeholder="e.g. New Delhi"
                        className="w-100 fw-bold border-0 bg-transparent"
                        style={{ outline: 'none', fontSize: '17px' }}
                      />
                      <span className="small text-muted d-block mt-1">Origin City</span>
                    </div>

                    <div className="search-field-box">
                      <label className="text-uppercase"><FaMapMarkerAlt className="text-danger me-1.5" /> To</label>
                      <input
                        type="text"
                        value={busTo}
                        onChange={(e) => setBusTo(e.target.value)}
                        placeholder="e.g. Mumbai"
                        className="w-100 fw-bold border-0 bg-transparent"
                        style={{ outline: 'none', fontSize: '17px' }}
                      />
                      <span className="small text-muted d-block mt-1">Destination City</span>
                    </div>

                    <div className="search-field-box">
                      <label className="text-uppercase"><FaCalendarAlt className="text-info me-1.5" /> Travel Date</label>
                      <input type="date" value={busDate} onChange={(e) => setBusDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                      <span className="small text-muted d-block mt-1">Choose Journey Date</span>
                    </div>
                  </div>
                )}

                {/* Cars Widget */}
                {activeTab === 'cars' && (
                  <div className="search-fields-grid">
                    <div className="search-field-box">
                      <label className="text-uppercase"><FaCar className="text-primary me-1.5" /> Rental City</label>
                      <input
                        type="text"
                        value={carCity}
                        onChange={(e) => setCarCity(e.target.value)}
                        placeholder="e.g. New Delhi"
                        className="w-100 fw-bold border-0 bg-transparent mb-1"
                        style={{ outline: 'none', fontSize: '17px' }}
                      />
                      <select
                        value={carRentalType}
                        onChange={(e) => setCarRentalType(e.target.value)}
                        className="w-100 border-0 bg-transparent fw-semibold text-primary mt-1"
                        style={{ fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="Self Drive">Self Drive (No Driver)</option>
                        <option value="With Driver">Chauffeur Driven (With Driver)</option>
                      </select>
                      <span className="small text-muted d-block mt-1">Location & Rental Option</span>
                    </div>

                    <div className="search-field-box">
                      <label className="text-uppercase"><FaClock className="text-success me-1.5" /> Pick-up Slot</label>
                      <input
                        type="date"
                        value={carDate}
                        onChange={(e) => setCarDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-100 fw-bold border-0 bg-transparent mb-1"
                        style={{ outline: 'none', fontSize: '16px' }}
                      />
                      <input
                        type="time"
                        value={carTime}
                        onChange={(e) => setCarTime(e.target.value)}
                        className="w-100 border-0 bg-transparent text-muted mt-1 fw-semibold"
                        style={{ outline: 'none', fontSize: '14px', cursor: 'pointer' }}
                      />
                      <span className="small text-muted d-block mt-1">Pick up Date & Time</span>
                    </div>

                    <div className="search-field-box">
                      <label className="text-uppercase"><FaClock className="text-danger me-1.5" /> Drop-off Slot</label>
                      <input
                        type="date"
                        value={carDropDate}
                        onChange={(e) => setCarDropDate(e.target.value)}
                        min={carDate}
                        className="w-100 fw-bold border-0 bg-transparent mb-1"
                        style={{ outline: 'none', fontSize: '16px' }}
                      />
                      <input
                        type="time"
                        value={carDropTime}
                        onChange={(e) => setCarDropTime(e.target.value)}
                        className="w-100 border-0 bg-transparent text-muted mt-1 fw-semibold"
                        style={{ outline: 'none', fontSize: '14px', cursor: 'pointer' }}
                      />
                      <span className="small text-muted d-block mt-1">Drop off Date & Time</span>
                    </div>
                  </div>
                )}

                {/* Search Action Button */}
                <div className="text-center mt-3">
                  <button onClick={handleSearch} className="btn btn-search-gt px-5 py-3 shadow-lg">
                    <FaSearch size={16} /> SEARCH NOW
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Why Choose GlobeTrotter Section */}
        <div className="card mx-auto mt-5 border-0 rounded-4 shadow-sm p-4 p-md-5" style={{ maxWidth: '1100px', background: 'var(--warm-cream)' }}>
          <div className="text-center mb-5">
            <h3 className="fw-bold mb-2 text-dark-blue" style={{ fontSize: '2.2rem' }}>Why Choose GlobeTrotter</h3>
            <p className="text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Setting the gold standard for luxury travel with personalized service and unmatched expertise.
            </p>
          </div>

          <div className="row g-4 text-center">
            {/* Feature 1 */}
            <div className="col-md-4">
              <div className="d-flex flex-column align-items-center">
                <div className="d-flex align-items-center justify-content-center rounded-3 mb-3 bg-secondary-subtle" style={{ width: '60px', height: '60px' }}>
                  <i className="bx bx-globe" style={{ fontSize: '28px', color: 'var(--primary-sage)' }}></i>
                </div>
                <h5 className="fw-bold text-dark-blue mb-2">Global Reach</h5>
                <p className="text-muted small px-3">
                  Access to over 500+ exclusive luxury properties and private tours worldwide.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="col-md-4">
              <div className="d-flex flex-column align-items-center">
                <div className="d-flex align-items-center justify-content-center rounded-3 mb-3 bg-secondary-subtle" style={{ width: '60px', height: '60px' }}>
                  <i className="bx bx-support" style={{ fontSize: '28px', color: 'var(--primary-sage)' }}></i>
                </div>
                <h5 className="fw-bold text-dark-blue mb-2">24/7 Support</h5>
                <p className="text-muted small px-3">
                  Our dedicated travel concierges are available around the clock for any request.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="col-md-4">
              <div className="d-flex flex-column align-items-center">
                <div className="d-flex align-items-center justify-content-center rounded-3 mb-3 bg-secondary-subtle" style={{ width: '60px', height: '60px' }}>
                  <i className="bx bx-badge-check" style={{ fontSize: '28px', color: 'var(--primary-sage)' }}></i>
                </div>
                <h5 className="fw-bold text-dark-blue mb-2">Best Price Guarantee</h5>
                <p className="text-muted small px-3">
                  We ensure the most competitive rates for high-end luxury experiences.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Traveler Reviews Section */}
        <div className="mx-auto mt-5" style={{ maxWidth: '1100px' }}>
          <div className="text-center mb-5">
            <h3 className="fw-bold mb-2 text-dark-blue" style={{ fontSize: '2.2rem' }}>Traveler Reviews</h3>
            <p className="text-muted small">Real feedback from our travelers</p>
          </div>

          {userReviews.length === 0 ? (
            <div className="card border-0 rounded-4 shadow-sm p-5 bg-white text-center">
              <div className="d-flex align-items-center justify-content-center rounded-circle mb-3 mx-auto"
                style={{ width: '60px', height: '60px', background: 'rgba(45, 74, 62, 0.05)' }}>
                <i className="bx bx-comment-detail" style={{ fontSize: '28px', color: 'var(--primary-sage)' }}></i>
              </div>
              <h5 className="fw-bold text-dark-blue mb-2">No Reviews Yet</h5>
              <p className="text-muted small mb-0">
                Be the first one to share your travel experience!
              </p>
            </div>
          ) : (
            <div
              className={userReviews.length > 6 ? "reviews-scroll-container px-3" : "px-3"}
              style={userReviews.length > 6
                ? { maxHeight: '420px', overflowY: 'auto', overflowX: 'hidden', paddingRight: '8px' }
                : { overflowX: 'hidden' }
              }
            >
              <div className="row g-4 text-start">
                {userReviews.map((review) => {
                  const initials = (review.username || 'U').slice(0, 2).toUpperCase();
                  return (
                    <div key={review.id} className="col-md-4 mb-3">
                      <div className="card h-100 border-0 rounded-4 shadow-sm p-4 bg-white hover-shadow" style={{ transition: 'all 0.3s ease' }}>
                        <div className="card-body p-0 d-flex flex-column justify-content-between h-100">
                          <div>
                            <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
                              <span className="badge bg-light text-muted border px-2.5 py-1 rounded-3 fw-bold small">
                                📍 {review.category ? review.category.toUpperCase() : 'GENERAL'}
                              </span>
                              {review.rating && (
                                <div className="text-warning small" style={{ letterSpacing: '2px' }}>
                                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                </div>
                              )}
                            </div>
                            <p className="text-dark-blue mb-4 text-start" style={{ fontSize: '14.5px', lineHeight: '1.6', fontStyle: 'italic' }}>
                              "{review.comment}"
                            </p>
                          </div>

                          <div className="d-flex align-items-center justify-content-between mt-auto pt-3 border-top border-light-subtle">
                            <div className="d-flex align-items-center gap-2">
                              <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                style={{ width: '36px', height: '36px', minWidth: '36px', background: 'var(--primary-sage, #2d4a3e)', color: '#ffffff', fontSize: '12px' }}>
                                {initials}
                              </div>
                              <div className="text-start">
                                <div className="fw-bold text-dark-blue" style={{ fontSize: '13px' }}>{review.username || 'User'}</div>
                              </div>
                            </div>
                            <small className="text-muted font-monospace" style={{ fontSize: '10px' }}>
                              {new Date(review.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={checkAuth}
      />
    </div>
  );
};

export default Home;
