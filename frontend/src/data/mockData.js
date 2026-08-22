export const regionalCards = [
  { id: 1, name: 'India', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80', trips: 28 },
  { id: 2, name: 'Asia', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80', trips: 18 },
  { id: 3, name: 'Europe', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80', trips: 12 },
  { id: 4, name: 'Americas', image: 'https://images.unsplash.com/photo-1485738422979-f2995ccbf3ba?auto=format&fit=crop&w=600&q=80', trips: 9 },
  { id: 5, name: 'Middle East', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80', trips: 8 },
];

export const mockTrips = [
  {
    id: 1,
    name: 'Goa Beach Vacation',
    description: 'Sunny beaches, water sports, historic churches, and vibrant nightlife.',
    start_date: '2026-03-10',
    end_date: '2026-03-17',
    budget_limit: 15000,
    total_cost: 8999,
    cover_photo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    is_public: true,
    user_username: 'raj_traveler',
    stops: [{ city_name: 'Goa', country_name: 'India', activities: [] }],
  },
  {
    id: 2,
    name: 'Kashmir Paradise Tour',
    description: 'Shikara rides on Dal Lake, snow activities in Gulmarg, and houseboats in Srinagar.',
    start_date: '2026-05-01',
    end_date: '2026-05-08',
    budget_limit: 25000,
    total_cost: 15999,
    cover_photo: 'https://images.unsplash.com/photo-1566837430420-9de97abaf222?auto=format&fit=crop&w=800&q=80',
    is_public: false,
    user_username: 'demo_user',
    stops: [{ city_name: 'Srinagar', country_name: 'India', activities: [] }],
  },
  {
    id: 3,
    name: 'Kerala Backwaters & Tea Gardens',
    description: 'Houseboats in Alleppey, tea plantations in Munnar, and spices in Thekkady.',
    start_date: '2026-09-15',
    end_date: '2026-09-22',
    budget_limit: 20000,
    total_cost: 14999,
    cover_photo: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
    is_public: true,
    user_username: 'priya_explorer',
    stops: [
      { city_name: 'Munnar', country_name: 'India', activities: [] },
      { city_name: 'Alleppey', country_name: 'India', activities: [] },
    ],
  },
  {
    id: 4,
    name: 'Royal Rajasthan Heritage',
    description: 'Forts and palaces of Jaipur, blue streets of Jodhpur, and lake cruises in Udaipur.',
    start_date: '2025-11-01',
    end_date: '2025-11-08',
    budget_limit: 30000,
    total_cost: 16999,
    cover_photo: 'https://images.unsplash.com/photo-1477584305590-38772ba65545?auto=format&fit=crop&w=800&q=80',
    is_public: false,
    user_username: 'demo_user',
    stops: [{ city_name: 'Jaipur', country_name: 'India', activities: [] }],
  },
  {
    id: 5,
    name: 'Manali Snow & Solang Expedition',
    description: 'Snowboarding at Rohtang Pass, paragliding in Solang Valley, and river rafting in Kullu.',
    start_date: '2026-04-10',
    end_date: '2026-04-16',
    budget_limit: 22000,
    total_cost: 13500,
    cover_photo: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    is_public: true,
    user_username: 'manali_hiker',
    stops: [{ city_name: 'Manali', country_name: 'India', activities: [] }],
  },
  {
    id: 6,
    name: 'Dubai Luxury & Desert Safari',
    description: 'Burj Khalifa observation deck, dune bashing desert safari, and Dubai Mall fountain show.',
    start_date: '2026-06-01',
    end_date: '2026-06-06',
    budget_limit: 75000,
    total_cost: 58000,
    cover_photo: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    is_public: true,
    user_username: 'dubai_glam',
    stops: [{ city_name: 'Dubai', country_name: 'UAE', activities: [] }],
  },
  {
    id: 7,
    name: 'Switzerland Alps & Glacier Express',
    description: 'Scenic train rides through Zermatt, Matterhorn views, and Interlaken lake cruises.',
    start_date: '2026-07-15',
    end_date: '2026-07-23',
    budget_limit: 140000,
    total_cost: 112000,
    cover_photo: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
    is_public: true,
    user_username: 'alps_nomad',
    stops: [{ city_name: 'Interlaken', country_name: 'Switzerland', activities: [] }],
  },
  {
    id: 8,
    name: 'Bali Sanctuary & Rice Terraces',
    description: 'Ubud jungle swings, Tegenungan waterfall, and Uluwatu sunset temple Kecak dance.',
    start_date: '2026-08-05',
    end_date: '2026-08-12',
    budget_limit: 45000,
    total_cost: 32000,
    cover_photo: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    is_public: true,
    user_username: 'island_vibes',
    stops: [{ city_name: 'Ubud', country_name: 'Indonesia', activities: [] }],
  },
];

export const placeSuggestions = [
  { id: 1, name: 'Eiffel Tower', city: 'Paris', type: 'Sightseeing', image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Louvre Museum', city: 'Paris', type: 'Culture', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Taj Mahal', city: 'Agra', type: 'Sightseeing', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Burj Khalifa', city: 'Dubai', type: 'Sightseeing', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Solang Valley', city: 'Manali', type: 'Adventure', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Gulmarg Gondola', city: 'Gulmarg', type: 'Adventure', image: 'https://images.unsplash.com/photo-1566837430420-9de97abaf222?auto=format&fit=crop&w=400&q=80' },
  { id: 7, name: 'Central Park', city: 'New York', type: 'Nature', image: 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?auto=format&fit=crop&w=400&q=80' },
  { id: 8, name: 'Senso-ji Temple', city: 'Tokyo', type: 'Culture', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80' },
];

export const activitySearchResults = [
  { id: 1, name: 'Paris', country: 'France', type: 'City', rating: 4.9, activities: 128, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Eiffel Tower Tour', city: 'Paris', country: 'France', type: 'Activity', rating: 4.8, price: 45, duration: '2h', image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Taj Mahal Sunrise Tour', city: 'Agra', country: 'India', type: 'Sightseeing', rating: 4.9, price: 25, duration: '3h', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Gulmarg Gondola Ride', city: 'Gulmarg', country: 'India', type: 'Adventure', rating: 4.9, price: 30, duration: '4h', image: 'https://images.unsplash.com/photo-1566837430420-9de97abaf222?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Burj Khalifa At The Top', city: 'Dubai', country: 'UAE', type: 'Sightseeing', rating: 4.9, price: 65, duration: '2h', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Manali Solang Paragliding', city: 'Manali', country: 'India', type: 'Adventure', rating: 4.8, price: 35, duration: '2h', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=400&q=80' },
  { id: 7, name: 'Scuba Diving in Havelock', city: 'Andaman', country: 'India', type: 'Water Sports', rating: 4.9, price: 60, duration: '3h', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80' },
  { id: 8, name: 'Desert Safari & Quad Biking', city: 'Dubai', country: 'UAE', type: 'Adventure', rating: 4.8, price: 55, duration: '6h', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80' },
  { id: 9, name: 'Ubud Swing & Rice Terraces', city: 'Bali', country: 'Indonesia', type: 'Nature', rating: 4.9, price: 20, duration: '4h', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80' },
  { id: 10, name: 'New York City', country: 'USA', type: 'City', rating: 4.7, activities: 210, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=400&q=80' },
  { id: 11, name: 'Statue of Liberty Cruise', city: 'New York', country: 'USA', type: 'Activity', rating: 4.6, price: 35, duration: '3h', image: 'https://images.unsplash.com/photo-1485875437342-9b39470b3f95?auto=format&fit=crop&w=400&q=80' },
  { id: 12, name: 'Tokyo City', country: 'Japan', type: 'City', rating: 4.9, activities: 185, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80' },
  { id: 13, name: 'Sushi Making Masterclass', city: 'Tokyo', country: 'Japan', type: 'Culture', rating: 4.9, price: 80, duration: '2.5h', image: 'https://images.unsplash.com/photo-1579871494447-81be0ae75b7a?auto=format&fit=crop&w=400&q=80' },
  { id: 14, name: 'Kyoto Bamboo Forest', city: 'Kyoto', country: 'Japan', type: 'Nature', rating: 4.7, price: 0, duration: '1.5h', image: 'https://images.unsplash.com/photo-1491884662610-dfcd2f83025a?auto=format&fit=crop&w=400&q=80' },
  { id: 15, name: 'Alleppey Houseboat Cruise', city: 'Alleppey', country: 'India', type: 'Relaxation', rating: 4.9, price: 90, duration: '24h', image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=400&q=80' },
];

export const communityPosts = [
  { id: 1, user: 'alex_travels', avatar: 'AT', trip: 'Paris Adventure', content: 'Just finished an incredible week in Paris! The Louvre at sunrise is magical. Highly recommend the Montmartre food tour.', likes: 42, comments: 12, time: '2h ago' },
  { id: 2, user: 'sakura_fan', avatar: 'SF', trip: 'Japan Adventure', content: 'Pro tip: Get a JR Pass before landing in Tokyo. Saved us hundreds on the Shinkansen rides to Kyoto and Osaka.', likes: 67, comments: 23, time: '5h ago' },
  { id: 3, user: 'wanderlust_j', avatar: 'WJ', trip: 'NYC Getaway', content: 'Hidden gem alert: Walk the High Line at golden hour, then grab pizza at Juliana\'s in DUMBO. Perfect evening!', likes: 31, comments: 8, time: '1d ago' },
  { id: 4, user: 'beach_lover', avatar: 'BL', trip: 'Bali Retreat', content: 'Ubud rice terraces at 6 AM — no crowds, misty mornings, and the most peaceful start to any trip I\'ve had.', likes: 89, comments: 34, time: '2d ago' },
];

export const calendarEvents = [
  { id: 1, title: 'PARIS TRIP', start: '2026-03-10', end: '2026-03-17', color: '#38bdf8' },
  { id: 2, title: 'NYC GETAWAY', start: '2026-05-01', end: '2026-05-08', color: '#fbbf24' },
  { id: 3, title: 'JAPAN ADVENTURE', start: '2026-09-15', end: '2026-09-28', color: '#a78bfa' },
];

export const mockItineraryDays = [
  {
    day: 1,
    date: '2026-03-10',
    activities: [
      { name: 'Arrive CDG & Metro to Hotel', physical: 'Moderate', expense: 35 },
      { name: 'Evening Seine River Walk', physical: 'Light', expense: 0 },
    ],
  },
  {
    day: 2,
    date: '2026-03-11',
    activities: [
      { name: 'Eiffel Tower Summit', physical: 'Moderate', expense: 45 },
      { name: 'Lunch at Café de Flore', physical: 'Light', expense: 55 },
      { name: 'Louvre Museum', physical: 'Heavy', expense: 22 },
    ],
  },
  {
    day: 3,
    date: '2026-03-12',
    activities: [
      { name: 'Versailles Day Trip', physical: 'Heavy', expense: 80 },
      { name: 'Dinner in Le Marais', physical: 'Light', expense: 65 },
    ],
  },
];

export const adminStats = {
  totalUsers: 1248,
  activeTrips: 342,
  popularTrips: [
    { name: 'Paris Adventure', count: 89 },
    { name: 'Japan Adventure', count: 76 },
    { name: 'NYC Getaway', count: 54 },
  ],
  popularActivities: [
    { name: 'Eiffel Tower Tour', count: 234 },
    { name: 'Sushi Making Class', count: 189 },
    { name: 'Central Park Bike Ride', count: 156 },
  ],
  userTrends: [
    { month: 'Jan', users: 820, trips: 145 },
    { month: 'Feb', users: 890, trips: 168 },
    { month: 'Mar', users: 950, trips: 192 },
    { month: 'Apr', users: 1020, trips: 210 },
    { month: 'May', users: 1100, trips: 245 },
    { month: 'Jun', users: 1248, trips: 342 },
  ],
};

export function getTripStatus(trip) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(trip.start_date);
  const end = new Date(trip.end_date);
  if (today >= start && today <= end) return 'ongoing';
  if (today < start) return 'upcoming';
  return 'completed';
}

export function categorizeTrips(trips) {
  return {
    ongoing: trips.filter((t) => getTripStatus(t) === 'ongoing'),
    upcoming: trips.filter((t) => getTripStatus(t) === 'upcoming'),
    completed: trips.filter((t) => getTripStatus(t) === 'completed'),
  };
}
