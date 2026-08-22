import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import BookingDetails from './pages/BookingDetails';
import Payment from './pages/Payment';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Contact from './pages/Contact';
import About from './pages/About';
import Services from './pages/Services';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';
import TripList from './pages/TripList';
import CreateTrip from './pages/CreateTrip';
import ItineraryBuilder from './pages/ItineraryBuilder';
import ItineraryView from './pages/ItineraryView';
import SharedItineraryView from './pages/SharedItineraryView';

import { FaSun, FaMoon } from 'react-icons/fa';

function ScrollToNavbar() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const scrollTarget = location.state?.scrollTo || params.get('scroll');

    const doScroll = () => {
      if (scrollTarget) {
        const el = document.getElementById(scrollTarget);
        if (el) {
          if (scrollTarget === 'travel-banner' || scrollTarget === 'search-tabs') {
            const rect = el.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            window.scrollTo({ top: rect.top + scrollTop - 100, behavior: 'smooth' });
          } else {
            el.scrollIntoView({ behavior: 'smooth' });
          }
          return;
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Fire immediately and after a short delay to handle async page renders
    doScroll();
    const t = setTimeout(doScroll, 150);
    return () => clearTimeout(t);
  }, [location]);

  return null;
}

function GlobalThemeToggle() {
  const [theme, setTheme] = React.useState(() => localStorage.getItem('theme') || 'light');

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn rounded-circle shadow-lg d-flex align-items-center justify-content-center p-0"
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '50px',
        height: '50px',
        zIndex: 99999,
        backgroundColor: theme === 'light' ? '#1f352b' : '#f5d7a6',
        color: theme === 'light' ? '#ffffff' : '#070a08',
        border: '2px solid rgba(255,255,255,0.2)',
        fontSize: '20px',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
    >
      {theme === 'light' ? <FaMoon /> : <FaSun />}
    </button>
  );
}

function App() {
  return (
    <Router>
      <ScrollToNavbar />
      <div className="d-flex flex-column min-vh-100 bg-light">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/flights" element={<SearchResults type="flights" />} />
            <Route path="/hotels" element={<SearchResults type="hotels" />} />
            <Route path="/trains" element={<SearchResults type="trains" />} />
            <Route path="/buses" element={<SearchResults type="buses" />} />
            <Route path="/packages" element={<SearchResults type="packages" />} />
            <Route path="/cars" element={<SearchResults type="cars" />} />
            <Route path="/booking-details" element={<BookingDetails />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/trips" element={<TripList />} />
            <Route path="/trips/new" element={<CreateTrip />} />
            <Route path="/trips/:id" element={<ItineraryView />} />
            <Route path="/trips/:id/edit" element={<ItineraryBuilder />} />
            <Route path="/trips/shared/:id" element={<SharedItineraryView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <GlobalThemeToggle />
      </div>
    </Router>
  );
}

export default App;
