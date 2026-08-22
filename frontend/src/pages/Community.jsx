import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { FaSearch, FaFilter, FaUserCircle, FaHeart, FaComment, FaCopy } from 'react-icons/fa';
import { communityPosts, mockTrips } from '../data/mockData';

const Community = () => {
  const [publicTrips, setPublicTrips] = useState([]);
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    setLoading(true);
    try {
      const tripsRes = await api.get('trips/public/');
      setPublicTrips(tripsRes.data?.length ? tripsRes.data : mockTrips.filter((t) => t.is_public));
    } catch {
      setPublicTrips(mockTrips.filter((t) => t.is_public));
    }
    setPosts(communityPosts);
    setLoading(false);
  };

  const filteredTrips = publicTrips.filter(trip => {
    const matchesSearch = !searchTerm || 
      trip.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (trip.description && trip.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="container py-5" style={{ maxWidth: '1000px' }}>
      {/* Header & Search matching Screen 10 Excalidraw Mockup */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-dark-blue mb-1">Globe Trotter Community</h2>
          <p className="text-muted small mb-0">Share your travel experiences and discover inspiring itineraries curated by Globe Trotter members.</p>
        </div>
        <Link to="/trips/new" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
          + Share Your Trip
        </Link>
      </div>

      {/* Control Bar: Search bar, Group by, Filter, Sort by... */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-2 align-items-center">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><FaSearch className="text-muted" /></span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search bar ....."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-2 col-4">
            <select className="form-select bg-light fw-medium small" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="All">Group by: All</option>
              <option value="Europe">Group by: Europe</option>
              <option value="Asia">Group by: Asia</option>
            </select>
          </div>
          <div className="col-md-2 col-4">
            <button className="btn btn-outline-secondary w-100 rounded-3 d-flex align-items-center justify-content-center gap-1 small fw-semibold">
              <FaFilter size={12} /> Filter
            </button>
          </div>
          <div className="col-md-3 col-4">
            <select className="form-select bg-light fw-medium small" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Sort by: Newest</option>
              <option value="popular">Sort by: Most Popular</option>
              <option value="budget">Sort by: Budget (Low-High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Community Feed Items matching Screen 10 mockup */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <p className="text-muted fs-5 mb-3">No community trips found matching your search.</p>
          <Link to="/trips/new" className="btn btn-outline-primary rounded-pill px-4 fw-bold">Be the first to share a trip</Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {posts.filter((p) => !searchTerm || p.content.toLowerCase().includes(searchTerm.toLowerCase()) || p.trip.toLowerCase().includes(searchTerm.toLowerCase())).map((post) => (
            <div key={post.id} className="card border-0 shadow-sm rounded-4 p-4 dash-card hover-shadow" style={{ transition: 'all 0.25s ease' }}>
              <div className="d-flex align-items-start gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center border border-2 shadow-sm flex-shrink-0 fw-bold"
                  style={{ width: '60px', height: '60px', backgroundColor: 'rgba(56,189,248,0.15)', color: 'var(--primary-sage)', fontSize: '18px' }}
                >
                  {post.avatar}
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start flex-wrap">
                    <div>
                      <h5 className="fw-bold mb-1">@{post.user}</h5>
                      <span className="text-muted small">Shared from <strong>{post.trip}</strong> · {post.time}</span>
                    </div>
                  </div>
                  <p className="text-muted mt-2 mb-3">{post.content}</p>
                  <div className="d-flex align-items-center justify-content-between pt-2 border-top flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-3 text-muted small">
                      <span className="d-flex align-items-center gap-1"><FaHeart className="text-danger" /> {post.likes} Likes</span>
                      <span className="d-flex align-items-center gap-1"><FaComment style={{ color: 'var(--primary-sage)' }} /> {post.comments} Comments</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredTrips.map((trip) => (
            <div key={trip.id} className="card border-0 shadow-sm rounded-4 p-4 bg-white hover-shadow" style={{ transition: 'all 0.25s ease' }}>
              <div className="d-flex align-items-start gap-3">
                {/* User Avatar Circle */}
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center border border-2 shadow-sm text-secondary flex-shrink-0"
                  style={{ width: '60px', height: '60px', backgroundColor: '#eef2f5', fontSize: '24px' }}
                >
                  <FaUserCircle className="text-primary-blue" />
                </div>

                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start flex-wrap">
                    <div>
                      <h5 className="fw-bold text-dark-blue mb-1">{trip.name}</h5>
                      <span className="text-muted small">Shared by <strong>@{trip.user_username || 'Traveler'}</strong> • {trip.start_date} to {trip.end_date}</span>
                    </div>
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-1.5 fw-bold">
                      Budget: ₹{trip.budget_limit ? Number(trip.budget_limit).toLocaleString('en-IN') : 'Flexible'}
                    </span>
                  </div>

                  <p className="text-muted small mt-2 mb-3">
                    {trip.description || 'An amazing collaborative itinerary shared on Globe Trotter community.'}
                  </p>

                  <div className="d-flex align-items-center justify-content-between pt-2 border-top flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-3 text-muted small">
                      <span className="d-flex align-items-center gap-1 cursor-pointer"><FaHeart className="text-danger" /> 24 Likes</span>
                      <span className="d-flex align-items-center gap-1 cursor-pointer"><FaComment className="text-primary" /> 8 Comments</span>
                    </div>
                    <div className="d-flex gap-2">
                      <Link to={`/trips/shared/${trip.id}`} className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold">
                        View Itinerary
                      </Link>
                      <Link to={`/trips/shared/${trip.id}`} className="btn btn-sm btn-primary rounded-pill px-3 fw-bold d-flex align-items-center gap-1">
                        <FaCopy size={11} /> Copy Trip
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Community;
