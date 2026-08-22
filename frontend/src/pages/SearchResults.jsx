import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { FaPlane, FaHotel, FaBus, FaSuitcase, FaCar, FaStar, FaChevronRight, FaFilter, FaHeart, FaRegHeart, FaWifi, FaSwimmingPool, FaSpa, FaDumbbell, FaUtensils, FaParking, FaConciergeBell, FaGlassMartiniAlt, FaSearch, FaCheckCircle } from 'react-icons/fa';
import api from '../api';

// Deterministic helper functions for client-side filters and visual tags
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
  const match = durationStr.match(/(\d+)\s*Day/i);
  if (match) {
    const days = parseInt(match[1]);
    if (days <= 3) return 'Short (1-3 Days)';
    if (days <= 6) return 'Medium (4-6 Days)';
    return 'Long (7+ Days)';
  }
  return 'Medium (4-6 Days)';
};

const SkeletonLoader = () => (
  <div className="row g-4">
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </div>
);

const SkeletonCard = () => (
  <div className="col-md-6 mb-2">
    <div className="skeleton-card">
      <div className="skeleton-image skeleton"></div>
      <div className="skeleton-content">
        <div className="skeleton-title skeleton"></div>
        <div className="skeleton-text skeleton"></div>
        <div className="skeleton-text skeleton"></div>
        <div className="skeleton-text-short skeleton mt-2"></div>
        <div className="skeleton-footer">
          <div className="skeleton-price skeleton"></div>
          <div className="skeleton-btn skeleton"></div>
        </div>
      </div>
    </div>
  </div>
);

const SearchResults = ({ type }) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [maxPrice, setMaxPrice] = useState(150000);
  const [selectedAirline, setSelectedAirline] = useState('All');
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedTrainType, setSelectedTrainType] = useState('All');
  const [selectedCarType, setSelectedCarType] = useState('All');
  const [selectedBusType, setSelectedBusType] = useState('All');

  // Extra filter states & pagination limit & debounce
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedStars, setSelectedStars] = useState([]);
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [selectedDurations, setSelectedDurations] = useState([]);
  const [selectedInclusions, setSelectedInclusions] = useState([]);
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('all');
  const [showLimit, setShowLimit] = useState(8);
  const [keywordInput, setKeywordInput] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  // Sort state
  const [sortBy, setSortBy] = useState('price_low'); // price_low, price_high, rating

  // Wishlist state
  const [wishlist, setWishlist] = useState([]);

  // URL Parameters
  const fromCity = searchParams.get('from_city') || '';
  const toCity = searchParams.get('to_city') || '';
  const depDate = searchParams.get('departure_date') || searchParams.get('date') || '';
  const city = searchParams.get('city') || '';
  const destination = searchParams.get('destination') || '';
  const category = searchParams.get('category') || '';
  const rentalType = searchParams.get('rental_type') || '';

  // Load wishlist from local storage
  useEffect(() => {
    const savedWish = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlist(savedWish);
  }, []);

  const toggleWishlist = (item) => {
    let updated;
    const isSaved = wishlist.some(w => w.id === item.id && w.type === type);
    if (isSaved) {
      updated = wishlist.filter(w => !(w.id === item.id && w.type === type));
    } else {
      updated = [...wishlist, { ...item, type }];
    }
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
  };

  const fetchResults = async () => {
    setLoading(true);
    setError('');
    try {
      let endpoint = '';
      if (type === 'flights') {
        endpoint = `flights/?from_city=${fromCity}&to_city=${toCity}&departure_date=${depDate}`;
      } else if (type === 'hotels') {
        endpoint = `hotels/?city=${city}`;
      } else if (type === 'trains') {
        endpoint = `trains/?from_city=${fromCity}&to_city=${toCity}&departure_date=${depDate}`;
      } else if (type === 'buses') {
        endpoint = `buses/?source_city=${fromCity}&destination_city=${toCity}`;
      } else if (type === 'packages') {
        endpoint = `packages/?destination=${destination}&category=${category}`;
      } else if (type === 'cars') {
        endpoint = `cars/?city=${city}&rental_type=${rentalType}`;
      }

      const response = await api.get(endpoint);
      setResults(response.data);
      setFilteredResults(response.data);
    } catch (err) {
      setError('Failed to fetch search results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keywordInput);
    }, 250);
    return () => clearTimeout(handler);
  }, [keywordInput]);

  useEffect(() => {
    fetchResults();
    setShowLimit(8);
    setKeywordInput('');
    setDebouncedKeyword('');
    setSelectedAmenities([]);
    setSelectedStars([]);
    setSelectedThemes([]);
    setSelectedDurations([]);
  }, [location, type]);

  // Apply filters and sorting
  useEffect(() => {
    let temp = [...results];

    // Price Filter
    if (type === 'flights' || type === 'trains' || type === 'buses') {
      temp = temp.filter(item => parseFloat(item.price) <= maxPrice);
    } else if (type === 'hotels') {
      temp = temp.filter(item => parseFloat(item.price_per_night) <= maxPrice);
    } else if (type === 'packages') {
      temp = temp.filter(item => parseFloat(item.price) <= maxPrice);
    } else if (type === 'cars') {
      temp = temp.filter(item => parseFloat(item.daily_rate) <= maxPrice);
    }

    // Airline Filter
    if (type === 'flights' && selectedAirline !== 'All') {
      temp = temp.filter(item => item.airline === selectedAirline);
    }

    // Rating Filter
    if ((type === 'hotels' || type === 'packages') && selectedRating > 0) {
      temp = temp.filter(item => item.rating >= selectedRating);
    }

    // Debounced Keyword Filter (Hotels & Packages)
    if (debouncedKeyword.trim() !== '') {
      const term = debouncedKeyword.toLowerCase();
      if (type === 'hotels') {
        temp = temp.filter(hotel =>
          hotel.name.toLowerCase().includes(term) ||
          hotel.city.toLowerCase().includes(term) ||
          hotel.address.toLowerCase().includes(term)
        );
      } else if (type === 'packages') {
        temp = temp.filter(pkg =>
          pkg.title.toLowerCase().includes(term) ||
          pkg.destination.toLowerCase().includes(term) ||
          pkg.description.toLowerCase().includes(term)
        );
      }
    }

    // Hotel Amenities Filter
    if (type === 'hotels' && selectedAmenities.length > 0) {
      temp = temp.filter(hotel => {
        const hotelAm = getHotelAmenities(hotel.id);
        return selectedAmenities.every(am => hotelAm.includes(am));
      });
    }

    // Hotel Stars Filter
    if (type === 'hotels' && selectedStars.length > 0) {
      temp = temp.filter(hotel => {
        const rating = hotel.rating;
        return selectedStars.some(star => {
          if (star === 5) return rating >= 4.7;
          if (star === 4) return rating >= 4.0 && rating < 4.7;
          if (star === 3) return rating >= 3.0 && rating < 4.0;
          return false;
        });
      });
    }

    // Package Themes Filter
    if (type === 'packages' && selectedThemes.length > 0) {
      temp = temp.filter(pkg => {
        const theme = getPackageTheme(pkg);
        return selectedThemes.includes(theme);
      });
    }

    // Package Durations Filter
    if (type === 'packages' && selectedDurations.length > 0) {
      temp = temp.filter(pkg => {
        const durCat = getPackageDurationCategory(pkg.duration);
        return selectedDurations.includes(durCat);
      });
    }

    // Package Inclusions Filter
    if (type === 'packages' && selectedInclusions.length > 0) {
      temp = temp.filter(pkg => {
        const inclusions = getPackageInclusions(pkg.id);
        return selectedInclusions.every(inc => inclusions.includes(inc));
      });
    }

    // Train Type Filter
    if (type === 'trains' && selectedTrainType !== 'All') {
      temp = temp.filter(item => item.train_type.includes(selectedTrainType));
    }

    // Bus Type Filter
    if (type === 'buses' && selectedBusType !== 'All') {
      temp = temp.filter(item => item.bus_type.includes(selectedBusType));
    }

    // Car Type Filter
    if (type === 'cars' && selectedCarType !== 'All') {
      temp = temp.filter(item => item.car_type === selectedCarType);
    }

    // Sorting
    temp.sort((a, b) => {
      const getVal = (item, field) => parseFloat(item[field] || 0);
      if (sortBy === 'price_low') {
        const field = type === 'hotels' ? 'price_per_night' : type === 'cars' ? 'daily_rate' : 'price';
        return getVal(a, field) - getVal(b, field);
      } else if (sortBy === 'price_high') {
        const field = type === 'hotels' ? 'price_per_night' : type === 'cars' ? 'daily_rate' : 'price';
        return getVal(b, field) - getVal(a, field);
      } else if (sortBy === 'rating') {
        return getVal(b, 'rating') - getVal(a, 'rating');
      }
      return 0;
    });

    setFilteredResults(temp);
  }, [results, maxPrice, selectedAirline, selectedRating, selectedTrainType, selectedBusType, selectedCarType, selectedAmenities, selectedStars, selectedThemes, selectedDurations, selectedInclusions, debouncedKeyword, sortBy]);

  const handleSelect = (item) => {
    // Navigate to booking-details with type and id
    navigate(`/booking-details?type=${type}&id=${item.id}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Unique airlines for dropdown
  const airlines = ['All', ...new Set(results.map(r => r.airline))];
  // Unique car types
  const carTypes = ['All', ...new Set(results.map(r => r.car_type))];

  const visibleResults = filteredResults.slice(0, showLimit);

  return (
    <div className={(type === 'hotels' || type === 'packages') ? "search-results-page container-fluid px-md-5 px-3 py-5" : "search-results-page container py-5"}>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold text-dark-blue mb-1">
            {type === 'flights' && `Flights: ${fromCity} ➔ ${toCity}`}
            {type === 'hotels' && `Premium Stays in ${city}`}
            {type === 'trains' && `Train Routes: ${fromCity} ➔ ${toCity}`}
            {type === 'buses' && `Bus Routes: ${fromCity} ➔ ${toCity}`}
            {type === 'packages' && `Holidays in ${destination || 'Destinations'}`}
            {type === 'cars' && `Car Rentals in ${city}`}
          </h2>
          <p className="text-muted mb-0 small">
            {depDate && `Date: ${new Date(depDate).toDateString()}`}
            {category && `Category: ${category}`}
            {rentalType && `Rental Type: ${rentalType}`}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="row g-4 text-start">
          <div className="col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <div className="skeleton w-75 mb-3" style={{ height: '24px' }}></div>
              <div className="skeleton w-100 mb-2" style={{ height: '35px' }}></div>
              <div className="skeleton w-100 mb-3" style={{ height: '14px' }}></div>
              <div className="skeleton w-100" style={{ height: '100px' }}></div>
            </div>
          </div>
          <div className="col-lg-9">
            <SkeletonLoader />
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger p-4 rounded-3 shadow-sm">{error}</div>
      ) : (
        <div className="row g-4">
          {/* Filters Sidebar */}
          <div className="col-lg-3 text-start">
            <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: '100px', zIndex: 5 }}>
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark-blue">
                <FaFilter size={14} className="text-coral-orange" /> Filters
              </h5>

              {/* Text Search Input (Hotels & Packages) */}
              {(type === 'hotels' || type === 'packages') && (
                <div className="sidebar-search-container">
                  <FaSearch className="sidebar-search-icon" />
                  <input
                    type="text"
                    className="sidebar-search-input"
                    placeholder={type === 'hotels' ? "Search Hotel / City..." : "Search Destination..."}
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                  />
                </div>
              )}

              {/* Price range */}
              <div className="mb-4">
                <span className="filter-section-header">
                  <span>Max Price</span>
                  <span className="text-success font-monospace">₹{maxPrice.toLocaleString('en-IN')}</span>
                </span>
                <input
                  type="range"
                  className="form-range"
                  min={type === 'trains' || type === 'buses' ? 400 : 1000}
                  max={type === 'packages' ? 200000 : 25000}
                  step={50}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                />
                <div className="d-flex justify-content-between text-muted" style={{ fontSize: '10px' }}>
                  <span>₹{type === 'trains' || type === 'buses' ? '400' : '1,000'}</span>
                  <span>₹{type === 'packages' ? '2,00,000' : '25,000'}</span>
                </div>
              </div>

              {/* Hotel Star Category Filter */}
              {type === 'hotels' && (
                <div className="mb-4">
                  <span className="filter-section-header">Star Category</span>
                  <div className="d-flex flex-column gap-2">
                    {[5, 4, 3].map(stars => {
                      const isActive = selectedStars.includes(stars);
                      return (
                        <button
                          key={stars}
                          type="button"
                          className={`star-rating-filter ${isActive ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedStars(prev =>
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
              )}

              {/* Hotel Amenities Filter */}
              {type === 'hotels' && (
                <div className="mb-4">
                  <span className="filter-section-header">Amenities</span>
                  <div className="d-flex flex-column gap-2" style={{ maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                    {["Free Wi-Fi", "Swimming Pool", "Spa & Wellness", "Fitness Gym", "Restaurant", "Free Parking", "Room Service", "Bar & Lounge"].map(am => {
                      const isChecked = selectedAmenities.includes(am);
                      return (
                        <label key={am} className="d-flex align-items-center gap-2 cursor-pointer small text-muted hover-text-dark">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedAmenities(prev =>
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
              )}

              {/* Room Type & Occupancy Filter */}
              {type === 'hotels' && (
                <div className="mb-4">
                  <span className="filter-section-header">Room Type & Capacity</span>
                  <div className="d-flex flex-column gap-1.5">
                    {[
                      { label: 'All Room Types', val: 'all' },
                      { label: '👩‍❤️‍👨 Couple Room (2 Guests)', val: 'couple' },
                      { label: '👨‍👩‍👧‍👦 Family Room (4 Guests)', val: 'family' },
                      { label: '🥳 Friends Room (6 Guests)', val: 'friends' }
                    ].map(rt => {
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
              )}

              {/* Holiday Packages Themes Filter */}
              {type === 'packages' && (
                <div className="mb-4">
                  <span className="filter-section-header">Package Theme</span>
                  <div className="filter-tags-grid">
                    {['Family', 'Honeymoon', 'Beach', 'Nature', 'Adventure', 'Luxury'].map(theme => {
                      const isActive = selectedThemes.includes(theme);
                      return (
                        <button
                          key={theme}
                          type="button"
                          className={`filter-tag-btn ${isActive ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedThemes(prev =>
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
              )}

              {/* Holiday Packages Duration Filter */}
              {type === 'packages' && (
                <div className="mb-4">
                  <span className="filter-section-header">Duration</span>
                  <div className="d-flex flex-column gap-2">
                    {['Short (1-3 Days)', 'Medium (4-6 Days)', 'Long (7+ Days)'].map(dur => {
                      const isChecked = selectedDurations.includes(dur);
                      return (
                        <label key={dur} className="d-flex align-items-center gap-2 cursor-pointer small text-muted hover-text-dark">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedDurations(prev =>
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
              )}

              {/* Holiday Packages Inclusions Filter */}
              {type === 'packages' && (
                <div className="mb-4">
                  <span className="filter-section-header">Inclusions</span>
                  <div className="d-flex flex-column gap-2" style={{ maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                    {["Flights", "Luxury Stay", "Meals Included", "Private Cab", "Tour Guide", "Sightseeing"].map(inc => {
                      const isChecked = selectedInclusions.includes(inc);
                      return (
                        <label key={inc} className="d-flex align-items-center gap-2 cursor-pointer small text-muted hover-text-dark">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedInclusions(prev =>
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
              )}

              {/* Flight Specific Filter */}
              {type === 'flights' && (
                <div className="mb-4">
                  <span className="filter-section-header">Airline</span>
                  <select className="form-select rounded-3" value={selectedAirline} onChange={(e) => setSelectedAirline(e.target.value)}>
                    {airlines.map(airline => <option key={airline} value={airline}>{airline}</option>)}
                  </select>
                </div>
              )}

              {/* Train specific filter */}
              {type === 'trains' && (
                <div className="mb-4">
                  <span className="filter-section-header">Train Coach Type</span>
                  <select className="form-select rounded-3" value={selectedTrainType} onChange={(e) => setSelectedTrainType(e.target.value)}>
                    <option value="All">All Coach Types</option>
                    <option value="1AC">1AC (First Class)</option>
                    <option value="2AC">2AC (Two Tier)</option>
                    <option value="3AC">3AC (Three Tier)</option>
                    <option value="SL">SL (Sleeper Class)</option>
                  </select>
                </div>
              )}

              {/* Bus specific filter */}
              {type === 'buses' && (
                <div className="mb-4">
                  <span className="filter-section-header">Bus Type</span>
                  <select className="form-select rounded-3" value={selectedBusType} onChange={(e) => setSelectedBusType(e.target.value)}>
                    <option value="All">All Types</option>
                    <option value="Sleeper">AC/Non-AC Sleeper</option>
                    <option value="Seater">Seater / SemiSleeper</option>
                    <option value="Volvo">Volvo</option>
                  </select>
                </div>
              )}

              {/* Car specific filter */}
              {type === 'cars' && (
                <div className="mb-4">
                  <span className="filter-section-header">Car Category</span>
                  <select className="form-select rounded-3" value={selectedCarType} onChange={(e) => setSelectedCarType(e.target.value)}>
                    {carTypes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              {/* Sort by */}
              <div className="mb-3">
                <span className="filter-section-header">Sort By</span>
                <select className="form-select rounded-3" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  {(type === 'hotels' || type === 'packages') && <option value="rating">User Rating</option>}
                </select>
              </div>

              {/* Reset Filters Link */}
              {(maxPrice < (type === 'packages' ? 200000 : 25000) || selectedAirline !== 'All' || selectedRating > 0 || selectedTrainType !== 'All' || selectedBusType !== 'All' || selectedCarType !== 'All' || selectedAmenities.length > 0 || selectedStars.length > 0 || selectedThemes.length > 0 || selectedDurations.length > 0 || selectedInclusions.length > 0 || keywordInput !== '') && (
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm rounded-pill w-100 fw-bold py-2 mt-2"
                  onClick={() => {
                    setMaxPrice(type === 'packages' ? 200000 : 25000);
                    setSelectedAirline('All');
                    setSelectedRating(0);
                    setSelectedTrainType('All');
                    setSelectedBusType('All');
                    setSelectedCarType('All');
                    setSelectedAmenities([]);
                    setSelectedStars([]);
                    setSelectedThemes([]);
                    setSelectedDurations([]);
                    setSelectedInclusions([]);
                    setKeywordInput('');
                    setDebouncedKeyword('');
                  }}
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>

          {/* Results List */}
          <div className="col-lg-9">
            {filteredResults.length === 0 ? (
              <div className="text-center py-5 bg-white rounded-4 shadow-sm p-4">
                <p className="fs-5 text-muted mb-2">No matching listings found.</p>
                <p className="small text-muted">Try widening your price range or removing filter conditions.</p>
              </div>
            ) : (
              <div>
                <p className="text-muted small mb-3 text-start">Showing {visibleResults.length} of {filteredResults.length} options</p>

                {type === 'flights' && (
                  visibleResults.map((flight) => {
                    const isWish = wishlist.some(w => w.id === flight.id && w.type === type);
                    return (
                      <div key={flight.id} className="listing-card animate-fade-in p-4 position-relative">
                        <div className="row align-items-center">
                          <div className="col-md-3 d-flex align-items-center gap-3">
                            <div className="airline-logo-placeholder">
                              {flight.airline[0]}
                            </div>
                            <div>
                              <h5 className="fw-bold mb-0">{flight.airline}</h5>
                              <small className="text-muted">{flight.flight_number}</small>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="fw-bold fs-5">{formatDate(flight.departure_time)}</div>
                            <small className="text-muted">{flight.departure_city}</small>
                            <div className="small text-muted mt-1">{formatDateShort(flight.departure_time)}</div>
                          </div>
                          <div className="col-md-3">
                            <div className="fw-bold fs-5">{formatDate(flight.arrival_time)}</div>
                            <small className="text-muted">{flight.arrival_city}</small>
                            <div className="small text-muted mt-1">{formatDateShort(flight.arrival_time)}</div>
                          </div>
                          <div className="col-md-3 text-md-end mt-3 mt-md-0 d-flex flex-md-column justify-content-between align-items-center align-items-md-end">
                            <button
                              onClick={() => toggleWishlist(flight)}
                              className="btn btn-link text-danger p-0 mb-2 align-self-md-end"
                              title={isWish ? "Remove from Wishlist" : "Save to Wishlist"}
                            >
                              {isWish ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
                            </button>
                            <div className="mb-2 text-md-end">
                              <span className="fs-4 fw-bold text-primary-blue">₹{Math.floor(flight.price)}</span>
                              <span className="small text-muted d-block">Free Cancellation</span>
                            </div>
                            <button onClick={() => handleSelect(flight)} className="btn btn-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2">
                              Book Now <FaChevronRight size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {type === 'hotels' && (
                  <div className="row g-4 text-start">
                    {visibleResults.map((hotel) => {
                      const isWish = wishlist.some(w => w.id === hotel.id && w.type === type);
                      const amenities = getHotelAmenities(hotel.id);
                      return (
                        <div key={hotel.id} className="col-xxl-4 col-xl-4 col-md-6 animate-fade-in">
                          <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative hover-up d-flex flex-column justify-content-between" style={{ transition: 'all 0.3s ease', background: '#ffffff' }}>
                            <div>
                              <div className="hotel-img-container" style={{ height: '200px', overflow: 'hidden' }}>
                                <img src={hotel.image_url || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'} alt={hotel.name} className="hotel-img w-100 h-100" style={{ objectFit: 'cover' }} />
                              </div>
                              <button
                                onClick={() => toggleWishlist(hotel)}
                                className={`btn btn-light shadow-sm text-danger rounded-circle p-2 position-absolute wishlist-heart-btn ${isWish ? 'active' : ''}`}
                                style={{ top: '10px', right: '10px', zIndex: 10 }}
                                title={isWish ? "Remove from Wishlist" : "Save to Wishlist"}
                              >
                                {isWish ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
                              </button>
                              {hotel.id % 3 === 0 && (
                                <span className="deal-tag position-absolute m-3 px-2 py-1" style={{ top: '10px', left: '10px', zIndex: 10 }}>
                                  15% OFF
                                </span>
                              )}
                              <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <h6 className="fw-bold text-dark-blue mb-0 text-truncate" title={hotel.name} style={{ maxWidth: '75%' }}>{hotel.name}</h6>
                                  <span className="badge bg-warning text-dark d-flex align-items-center gap-1 fw-bold">
                                    ★ {hotel.rating}
                                  </span>
                                </div>
                                <p className="text-muted small mb-2 text-truncate" title={hotel.address}>{hotel.address}</p>
                                <span className="badge bg-light text-muted border px-2.5 py-1 rounded-3 fw-bold small mb-3">📍 {hotel.city}</span>

                                {/* Amenities Tray */}
                                <div className="border-top pt-2.5 mt-2">
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

                                {/* Room Configurations Tray */}
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
                            <div className="p-4 pt-0 d-flex justify-content-between align-items-center border-top-0">
                              <div>
                                <span className="fs-5 fw-bold text-primary-blue">₹{Math.floor(hotel.price_per_night).toLocaleString('en-IN')}</span>
                                <small className="text-muted"> / night</small>
                              </div>
                              <button onClick={() => handleSelect(hotel)} className="btn btn-primary rounded-pill px-3 py-1.5 btn-sm fw-bold">
                                Book Stay
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {type === 'trains' && (
                  visibleResults.map((train) => {
                    const isWish = wishlist.some(w => w.id === train.id && w.type === type);
                    return (
                      <div key={train.id} className="listing-card animate-fade-in p-4 position-relative">
                        <div className="row align-items-center">
                          <div className="col-md-3">
                            <h5 className="fw-bold mb-1">🚂 {train.name}</h5>
                            <span className="small text-muted d-block">{train.train_number}</span>
                            <span className="badge bg-light text-muted border px-2 py-1 rounded-2 small mt-1">
                              {train.train_type}
                            </span>
                          </div>
                          <div className="col-md-3">
                            <div className="fw-bold fs-5">{formatDate(train.departure_time)}</div>
                            <small className="text-muted">{train.source_city}</small>
                            <div className="small text-muted mt-1">{formatDateShort(train.departure_time)}</div>
                          </div>
                          <div className="col-md-3">
                            <div className="fw-bold fs-5">{formatDate(train.arrival_time)}</div>
                            <small className="text-muted">{train.destination_city}</small>
                            <div className="small text-muted mt-1">{formatDateShort(train.arrival_time)}</div>
                          </div>
                          <div className="col-md-3 text-md-end mt-3 mt-md-0 d-flex flex-md-column justify-content-between align-items-center align-items-md-end">
                            <button
                              onClick={() => toggleWishlist(train)}
                              className="btn btn-link text-danger p-0 mb-2 align-self-md-end"
                              title={isWish ? "Remove from Wishlist" : "Save to Wishlist"}
                            >
                              {isWish ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
                            </button>
                            <div className="mb-2">
                              <span className="fs-4 fw-bold text-primary-blue">₹{Math.floor(train.price)}</span>
                              <small className="text-muted d-block">{train.available_seats} berths left</small>
                            </div>
                            <button onClick={() => handleSelect(train)} className="btn btn-primary rounded-pill px-4 fw-bold">
                              Book Train
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {type === 'buses' && (
                  visibleResults.map((bus) => {
                    const isWish = wishlist.some(w => w.id === bus.id && w.type === type);
                    return (
                      <div key={bus.id} className="listing-card animate-fade-in p-4 position-relative">
                        <div className="row align-items-center">
                          <div className="col-md-3">
                            <h5 className="fw-bold mb-1">🚌 {bus.operator}</h5>
                            <span className="small text-muted d-block">{bus.bus_number}</span>
                            <span className="badge bg-light text-muted border px-2 py-1 rounded-2 small mt-1">
                              {bus.bus_type}
                            </span>
                          </div>
                          <div className="col-md-3">
                            <div className="fw-bold fs-5">{formatDate(bus.departure_time)}</div>
                            <small className="text-muted">{bus.source_city}</small>
                            <div className="small text-muted mt-1">{formatDateShort(bus.departure_time)}</div>
                          </div>
                          <div className="col-md-3">
                            <div className="fw-bold fs-5">{formatDate(bus.arrival_time)}</div>
                            <small className="text-muted">{bus.destination_city}</small>
                            <div className="small text-muted mt-1">{formatDateShort(bus.arrival_time)}</div>
                          </div>
                          <div className="col-md-3 text-md-end mt-3 mt-md-0 d-flex flex-md-column justify-content-between align-items-center align-items-md-end">
                            <button
                              onClick={() => toggleWishlist(bus)}
                              className="btn btn-link text-danger p-0 mb-2 align-self-md-end"
                              title={isWish ? "Remove from Wishlist" : "Save to Wishlist"}
                            >
                              {isWish ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
                            </button>
                            <div className="mb-2">
                              <span className="fs-4 fw-bold text-primary-blue">₹{Math.floor(bus.price)}</span>
                              <small className="text-muted d-block">{bus.available_seats} seats left</small>
                            </div>
                            <button onClick={() => handleSelect(bus)} className="btn btn-primary rounded-pill px-4 fw-bold">
                              Book Bus
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {type === 'packages' && (
                  <div className="row g-4 text-start">
                    {visibleResults.map((pkg) => {
                      const isWish = wishlist.some(w => w.id === pkg.id && w.type === type);
                      const itineraryItems = JSON.parse(pkg.itinerary || '[]');
                      const inclusions = getPackageInclusions(pkg.id);
                      return (
                        <div key={pkg.id} className="col-xxl-4 col-xl-4 col-md-6 animate-fade-in">
                          <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative hover-up d-flex flex-column justify-content-between" style={{ transition: 'all 0.3s ease', background: '#ffffff' }}>
                            <div>
                              <div className="hotel-img-container" style={{ height: '220px', overflow: 'hidden' }}>
                                <img
                                  src={pkg.image_url || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'}
                                  alt={pkg.title}
                                  className="hotel-img w-100 h-100"
                                  style={{ objectFit: 'cover' }}
                                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'; }}
                                />
                              </div>
                              <button
                                onClick={() => toggleWishlist(pkg)}
                                className={`btn btn-light shadow-sm text-danger rounded-circle p-2 position-absolute wishlist-heart-btn ${isWish ? 'active' : ''}`}
                                style={{ top: '10px', right: '10px', zIndex: 10 }}
                                title={isWish ? "Remove from Wishlist" : "Save to Wishlist"}
                              >
                                {isWish ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
                              </button>
                              <span className="deal-tag position-absolute m-3 px-2 py-1" style={{ top: '10px', left: '10px', zIndex: 10 }}>
                                Featured
                              </span>
                              <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h6 className="fw-bold text-dark-blue mb-0 text-truncate" title={pkg.title} style={{ maxWidth: '75%' }}>{pkg.title}</h6>
                                  <span className="badge bg-warning text-dark d-flex align-items-center gap-1 fw-bold">
                                    ★ {pkg.rating}
                                  </span>
                                </div>
                                <div className="d-flex flex-wrap gap-1.5 mb-2.5">
                                  <span className="badge bg-info-subtle text-info px-2.5 py-1 rounded small fw-bold">🕒 {pkg.duration}</span>
                                  <span className="badge bg-primary-subtle text-primary px-2.5 py-1 rounded small fw-bold">✨ {getPackageTheme(pkg)}</span>
                                </div>
                                <p className="text-muted small mb-2 text-truncate-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px', lineHeight: '1.4' }}>{pkg.description}</p>

                                {/* Itinerary Highlight */}
                                <div className="border-top pt-2 mt-2">
                                  <small className="fw-bold d-block text-muted mb-1.5" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>ITINERARY HIGHLIGHT:</small>
                                  <ul className="list-unstyled mb-0 pl-0">
                                    {itineraryItems.slice(0, 2).map((it, idx) => (
                                      <li key={idx} className="small text-muted mb-1 text-truncate" style={{ fontSize: '11px' }}>
                                        🗓️ Day {it.day}: {it.title}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Inclusions Tray */}
                                <div className="border-top pt-2 mt-2">
                                  <small className="text-muted fw-bold d-block mb-1.5" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>INCLUSIONS:</small>
                                  <div className="d-flex flex-wrap gap-1">
                                    {inclusions.slice(0, 3).map((inc, idx) => (
                                      <span key={idx} className="badge bg-light text-secondary border px-2 py-1.5 small rounded-pill fw-semibold" style={{ fontSize: '10px' }}>
                                        ✓ {inc}
                                      </span>
                                    ))}
                                    {inclusions.length > 3 && (
                                      <span className="badge bg-light text-muted border px-2 py-1.5 small rounded-pill">+{inclusions.length - 3}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 pt-0 d-flex justify-content-between align-items-center border-top-0">
                              <div>
                                <span className="fs-5 fw-bold text-primary-blue">₹{Math.floor(pkg.price).toLocaleString('en-IN')}</span>
                                <small className="text-muted"> / person</small>
                              </div>
                              <button onClick={() => handleSelect(pkg)} className="btn btn-primary rounded-pill px-3 py-1.5 btn-sm fw-bold">
                                Book Holiday
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {type === 'cars' && (
                  visibleResults.map((car) => {
                    const isWish = wishlist.some(w => w.id === car.id && w.type === type);
                    const features = JSON.parse(car.features || '[]');
                    return (
                      <div key={car.id} className="listing-card animate-fade-in p-4 position-relative mb-3 bg-white rounded-4 border">
                        <div className="row align-items-center">
                          <div className="col-md-3">
                            <img src={car.image_url} alt={car.name} className="img-fluid rounded-3" style={{ height: '100px', width: '100%', objectFit: 'cover' }} />
                          </div>
                          <div className="col-md-3 text-start">
                            <h5 className="fw-bold mb-1 text-dark-blue">{car.name}</h5>
                            <div className="d-flex flex-wrap gap-1 mt-1">
                              <span className="badge bg-light text-muted border small">{car.car_type}</span>
                              <span className="badge bg-light text-muted border small">{car.transmission}</span>
                            </div>
                            <small className="text-muted d-block mt-2">Fuel: {car.fuel_type}</small>
                          </div>
                          <div className="col-md-3 text-start">
                            <small className="fw-bold text-muted d-block mb-1">Key Features:</small>
                            <div className="d-flex flex-wrap gap-1">
                              {features.map((feat, idx) => (
                                <span key={idx} className="badge bg-success-subtle text-success small">✓ {feat}</span>
                              ))}
                            </div>
                          </div>
                          <div className="col-md-3 text-md-end mt-3 mt-md-0 d-flex flex-md-column justify-content-between align-items-center align-items-md-end">
                            <button
                              onClick={() => toggleWishlist(car)}
                              className={`btn btn-link text-danger p-0 mb-2 align-self-md-end wishlist-heart-btn ${isWish ? 'active' : ''}`}
                              title={isWish ? "Remove from Wishlist" : "Save to Wishlist"}
                            >
                              {isWish ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
                            </button>
                            <div className="mb-2">
                              <span className="fs-4 fw-bold text-primary-blue">₹{Math.floor(car.daily_rate)}</span>
                              <small className="text-muted d-block"> / daily rate</small>
                            </div>
                            <button onClick={() => handleSelect(car)} className="btn btn-primary rounded-pill px-4 fw-bold">
                              Rent Car
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Smooth paginated Load More button */}
                {filteredResults.length > showLimit && (
                  <div className="load-more-container animate-fade-in">
                    <button
                      type="button"
                      className="btn btn-load-more shadow-sm"
                      onClick={() => setShowLimit(prev => prev + 8)}
                    >
                      Show More Results <FaChevronRight size={10} className="ms-1" />
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
