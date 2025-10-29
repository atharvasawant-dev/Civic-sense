import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  // ---------- Hero slideshow (crystal clear images, no overlay) ----------
  const slides = [
    // City / community themed images — high quality
    'https://images.unsplash.com/photo-1526481280698-8fcc13fd79b1?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1487956382158-bb926046304a?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1600&q=80',
  ];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((p) => (p + 1) % slides.length);
    }, 4500);
    return () => clearInterval(id);
  }, [slides.length]); // ✅ no ESLint warning

  // ---------- Live stats from backend ----------
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0, users: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('http://localhost:5000/api/stats');
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

  // ---------- Simple “recently resolved” stories (feel real) ----------
  const stories = [
    {
      title: 'Pothole fixed in Tilak Nagar',
      text: 'A major pothole reported by 8 residents is now resolved within 36 hours.',
      img: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1200&q=70',
    },
    {
      title: 'Streetlight restored in Sector 5',
      text: 'Dark street section lit again — improved safety for evening commuters.',
      img: 'https://images.unsplash.com/photo-1521151716396-b2da9f5a32d5?auto=format&fit=crop&w=1200&q=70',
    },
    {
      title: 'Garbage cleaned at Bhaskar Chowk',
      text: 'Overflowing garbage area cleared and pickup schedule updated.',
      img: 'https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=1200&q=70',
    },
  ];

  return (
    <div className="home-container">
      {/* ========== HERO ========== */}
      <section className="hero">
        <img key={current} src={slides[current]} alt="City" className="hero-img fade" />
        <div className="hero-text">
          <h1>Civic Sense Grievance System</h1>
          <p>Report civic issues, track progress, and help improve your city.</p>

          <div className="hero-cta">
            <button className="btn btn-primary" onClick={() => navigate('/report-issue')}>
              Report Issue
            </button>
            <button className="btn btn-white" onClick={() => navigate('/my-reports')}>
              Track My Reports
            </button>
          </div>
        </div>
      </section>

      {/* ========== STATS ========== */}
      <section className="stats-section" id="insights">
        <h2 className="section-title">📊 Live City Insights</h2>
        <div className="stats-grid">
          <div className="stat-card total">
            <h3>🏙️ Total Issues</h3>
            <p>{stats.total}</p>
          </div>
          <div className="stat-card resolved">
            <h3>✅ Resolved</h3>
            <p>{stats.resolved}</p>
          </div>
          <div className="stat-card pending">
            <h3>🕓 Pending</h3>
            <p>{stats.pending}</p>
          </div>
          <div className="stat-card users">
            <h3>👥 Active Users</h3>
            <p>{stats.users}</p>
          </div>
        </div>
      </section>

      {/* ========== CATEGORIES (quick shortcuts) ========== */}
      <section className="categories" id="categories">
        <h2 className="section-title">🧭 Popular Categories</h2>
        <div className="cat-grid">
          {[
            { icon: '🕳️', label: 'Pothole' },
            { icon: '🗑️', label: 'Garbage' },
            { icon: '💡', label: 'Streetlight' },
            { icon: '🚰', label: 'Water Supply' },
            { icon: '🕳️', label: 'Drainage' },
            { icon: '📢', label: 'Other' },
          ].map((c) => (
            <div key={c.label} className="cat-card" onClick={() => navigate('/report-issue')}>
              <span className="cat-ico">{c.icon}</span>
              <div className="cat-label">{c.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== SUCCESS STORIES (light carousel) ========== */}
      <section className="stories">
        <h2 className="section-title">🌟 Recently Resolved</h2>
        <div className="story-row">
          {stories.map((s) => (
            <article className="story-card" key={s.title}>
              <img src={s.img} alt={s.title} />
              <div className="story-body">
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ========== ABOUT ========== */}
      <section className="about-section" id="about">
        <h2>🌍 Our Mission</h2>
        <p>
          Civic Sense empowers citizens to report civic problems and track their resolution. We connect
          residents with local authorities, making cities smarter, cleaner, and more accountable.
          Together, we build a better everyday life.
        </p>
      </section>

      {/* ========== CONTACT ========== */}
      <section className="contact-section" id="contact">
        <h2>📬 Contact</h2>
        <div className="contact-box">
          <div>
            <strong>Email:</strong> support@civicsense.app
          </div>
          <div>
            <strong>Helpline:</strong> +91-98765-43210
          </div>
          <div>
            <strong>Office Hours:</strong> Mon–Sat, 9:30 AM – 6 PM
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
