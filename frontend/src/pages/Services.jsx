import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlane, FaHotel, FaSuitcase, FaTrain, FaBus, FaCar, FaCrown, FaCompass, FaHeadphones } from 'react-icons/fa';

const Services = () => {
  const serviceList = [
    {
      icon: <FaPlane size={26} style={{ color: 'var(--primary-sage)' }} />,
      title: "Flight Booking & Itineraries",
      desc: "Instant search and booking across hundreds of domestic and international airlines. Enjoy real-time seating mappers, flexible rescheduling, and dynamic pricing."
    },
    {
      icon: <FaHotel size={26} style={{ color: 'var(--primary-sage)' }} />,
      title: "Luxury & Budget Hotels",
      desc: "Unlock premium stays at handpicked hotels, boutique villas, and resorts worldwide. Benefit from free cancellations, verified reviews, and member discounts."
    },
    {
      icon: <FaSuitcase size={26} style={{ color: 'var(--primary-sage)' }} />,
      title: "Fix Tour Packages",
      desc: "Tailored multi-day travel itineraries and all-inclusive holiday packages. Combines flights, hotels, tour guides, and sightseeing excursions seamlessly."
    },
    {
      icon: <FaTrain size={26} style={{ color: 'var(--primary-sage)' }} />,
      title: "Train Berths & Bookings",
      desc: "Fast and reliable reservation systems for nationwide express and superfast trains. Select your coach berths visually using interactive seat layouts."
    },
    {
      icon: <FaBus size={26} style={{ color: 'var(--primary-sage)' }} />,
      title: "Express Bus Bookings",
      desc: "Instant seat reservations on premier intercity routes. Select sleeper berths or executive multi-axle coach seats visually with instant confirmation."
    },
    {
      icon: <FaCar size={26} style={{ color: 'var(--primary-sage)' }} />,
      title: "Premium Car Rentals",
      desc: "Book self-drive or chauffeur-driven vehicles for city transits, airport transfers, and outstation trips. Includes economical hatchbacks to luxury SUVs."
    },
    {
      icon: <FaCrown size={26} style={{ color: 'var(--primary-sage)' }} />,
      title: "VIP Loyalty Member Club",
      desc: "Join our exclusive Globe Trotter Member Club (Black VIP level) to gain instant wallet credits, double reward points, and zero booking cancellation fees."
    },
    {
      icon: <FaCompass size={26} style={{ color: 'var(--primary-sage)' }} />,
      title: "AI Route & Budget Planner",
      desc: "Calculate cost-effective travel routes and estimate complete trip budgets dynamically using our built-in smart context-aware itinerary engine."
    },
    {
      icon: <FaHeadphones size={26} style={{ color: 'var(--primary-sage)' }} />,
      title: "24/7 Dedicated Support",
      desc: "Get round-the-clock live assistance from our expert help desk agents. Reschedule, cancel, or modify bookings easily with priority ticketing."
    }
  ];

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="text-center mb-5 mx-auto" style={{ maxWidth: '700px' }}>
        <h2 className="fw-bold text-dark-blue mb-2" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '2.5rem', letterSpacing: '-0.5px' }}>Our Premium Travel Services</h2>
        <p className="text-muted fs-5">Explore the array of digital booking engines and exclusive membership perks designed to elevate your travel adventures.</p>
      </div>

      {/* Services Grid */}
      <div className="row g-4">
        {serviceList.map((service, index) => (
          <div className="col-md-6 col-lg-4" key={index}>
            <div className="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white hover-up transition-all" style={{ border: '1px solid #ede8e1' }}>
              <div className="d-flex align-items-center justify-content-center bg-light rounded-circle border mb-3 shadow-sm" style={{ width: '56px', height: '56px', background: '#fdfbf7', borderColor: '#f2edd5' }}>
                {service.icon}
              </div>
              <h5 className="fw-bold text-dark-blue mb-2" style={{ fontSize: '18px' }}>{service.title}</h5>
              <p className="text-muted small mb-0" style={{ lineHeight: '1.6', fontSize: '13.5px' }}>
                {service.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-5">
        <Link to="/" className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm" style={{ background: 'var(--primary-sage)', border: 'none' }}>
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default Services;
