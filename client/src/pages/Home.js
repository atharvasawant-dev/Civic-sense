import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import './Home.css';
import { API_BASE_URL } from '../config';

const Home = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0, users: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/stats`);
        const d = await r.json();
        setStats({
          total: d.totalIssues || 0,
          resolved: d.resolvedIssues || 0,
          pending: d.pendingIssues || 0,
          users: d.activeUsers || 0,
        });
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    load();
  }, []);

  const categories = [
    { icon: '🕳️', label: 'Pothole' },
    { icon: '🗑️', label: 'Garbage' },
    { icon: '💡', label: 'Streetlight' },
    { icon: '🚰', label: 'Water Supply' },
    { icon: '🕳️', label: 'Drainage' },
    { icon: '📢', label: 'Other' },
  ];

  return (
    <div className="home-container">
      {/* ========== HERO ========== */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Civic Sense.</h1>
          <h2 className="hero-subtitle">Empowering communities to build better cities.</h2>
          <div className="hero-cta">
            <button className="btn btn-primary" onClick={() => navigate('/report-issue')}>
              Report an Issue
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/my-reports')}>
              Track Progress
            </button>
          </div>
        </div>
      </section>

      {/* ========== STATS ========== */}
      <section className="section stats-section">
        <div className="grid-4">
          <div className="stat-item">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Issues Reported</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.resolved}</span>
            <span className="stat-label">Issues Resolved</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Pending Action</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.users}</span>
            <span className="stat-label">Active Citizens</span>
          </div>
        </div>
      </section>

      {/* ========== CATEGORIES ========== */}
      <section className="section">
        <h3 className="section-title">Common Categories</h3>
        <div className="grid-6">
          {categories.map((c) => (
            <div key={c.label} className="category-card" onClick={() => navigate('/report-issue')}>
              <span className="category-icon">{c.icon}</span>
              <span className="category-label">{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ========== MISSION ========== */}
      <section className="section mission-section">
        <div className="mission-content">
          <h3 className="section-title">Our Mission</h3>
          <p className="mission-text">
            We believe that every citizen should have a voice in the maintenance and improvement of their city.
            Civic Sense provides a seamless, transparent platform to report grievances directly to local authorities
            and track their resolution in real-time. Together, we can make our cities smarter, cleaner, and more accountable.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
