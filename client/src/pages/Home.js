// client/src/pages/Home.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import IssueCard from '../components/IssueCard';
import { API_BASE_URL } from '../config';

const categories = [
  { id: 'All', label: 'All Issues', icon: '🌐' },
  { id: 'Pothole', label: 'Potholes', icon: '🕳️' },
  { id: 'Garbage', label: 'Garbage', icon: '🗑️' },
  { id: 'Streetlight', label: 'Streetlights', icon: '💡' },
  { id: 'Water Supply', label: 'Water Supply', icon: '🚰' },
  { id: 'Drainage', label: 'Drainage', icon: '🌊' },
  { id: 'Other', label: 'Other', icon: '📢' },
];

const statuses = ['All', 'Pending', 'In Progress', 'Resolved'];

const Home = ({ defaultSort = 'latest' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const searchParam = queryParams.get('search') || '';

  const [sort, setSort] = useState(defaultSort);
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, resolved: 0, users: 0 });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Sync defaultSort if prop changes (e.g. /popular vs /)
  useEffect(() => {
    setSort(defaultSort);
  }, [defaultSort]);

  // Fetch stats for community sidebar
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/stats`);
        if (res.ok) {
          const d = await res.json();
          setStats({
            total: d.totalIssues || 0,
            resolved: d.resolvedIssues || 0,
            users: d.activeUsers || 0,
          });
        }
      } catch (e) {
        // Ignore stats fetch errors
      }
    };
    fetchStats();
  }, []);

  // Fetch issues
  const fetchFeed = async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const params = new URLSearchParams({
        sort,
        page: pageNum,
        limit: 10,
      });

      if (category !== 'All') params.set('category', category);
      if (status !== 'All') params.set('status', status);
      if (searchParam) params.set('search', searchParam);

      const res = await fetch(`${API_BASE_URL}/issues?${params.toString()}`, { headers });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data.issues) ? data.issues : [];
        if (append) {
          setIssues((prev) => [...prev, ...list]);
        } else {
          setIssues(list);
        }
        setHasMore(data.hasMore || false);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Feed fetch error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchFeed(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, category, status, searchParam]);

  const handleVoteSuccess = (issueId, newScore, newUserVote) => {
    setIssues((prev) =>
      prev.map((i) =>
        i._id === issueId ? { ...i, score: newScore, userVote: newUserVote } : i
      )
    );
  };

  const clearSearch = () => {
    navigate('/');
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '74px 14px 80px 14px', boxSizing: 'border-box', width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(260px, 310px)', gap: '24px' }} className="feed-layout">
        {/* Main Feed Column */}
        <main style={{ minWidth: 0, maxWidth: '100%' }}>
          {/* Create Post Bar (Reddit style) */}
          <div
            onClick={() => navigate('/report-issue')}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e5e7',
              borderRadius: '12px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              cursor: 'pointer',
              boxSizing: 'border-box',
              maxWidth: '100%',
            }}
          >
            <span style={{ fontSize: '20px', flexShrink: 0 }}>📢</span>
            <input
              type="text"
              readOnly
              placeholder="Report a civic issue in your area..."
              style={{
                backgroundColor: '#f6f7f8',
                border: '1px solid #edeff1',
                borderRadius: '999px',
                padding: '0 12px',
                width: '100%',
                minWidth: 0,
                fontSize: '13px',
                color: '#555',
                cursor: 'pointer',
                outline: 'none',
                height: '36px',
                minHeight: '36px',
                margin: 0,
              }}
            />
            <button
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: '13px', flexShrink: 0, minHeight: '34px' }}
            >
              Post
            </button>
          </div>

          {/* Search Active Notification */}
          {searchParam && (
            <div
              style={{
                backgroundColor: '#e6f7ff',
                border: '1px solid #91d5ff',
                borderRadius: '8px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#096dd9',
                boxSizing: 'border-box',
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '8px' }}>
                Search: <strong>"{searchParam}"</strong>
              </span>
              <button
                onClick={clearSearch}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '700',
                  color: '#096dd9',
                  flexShrink: 0,
                  padding: '4px',
                }}
              >
                Clear ✕
              </button>
            </div>
          )}

          {/* Sort & Filter Controls Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e5e7',
              borderRadius: '12px',
              padding: '10px 12px',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxSizing: 'border-box',
              maxWidth: '100%',
            }}
          >
            {/* Top row: Sort buttons & Status select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#878a8c', textTransform: 'uppercase' }}>
                  Sort:
                </span>
                <button
                  onClick={() => setSort('latest')}
                  style={{
                    backgroundColor: sort === 'latest' ? '#ffefe6' : '#f6f7f8',
                    color: sort === 'latest' ? '#ff4500' : '#555',
                    border: sort === 'latest' ? '1px solid #ffd8c2' : '1px solid transparent',
                    padding: '5px 10px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minHeight: '30px',
                  }}
                >
                  🕒 Latest
                </button>
                <button
                  onClick={() => setSort('popular')}
                  style={{
                    backgroundColor: sort === 'popular' ? '#ffefe6' : '#f6f7f8',
                    color: sort === 'popular' ? '#ff4500' : '#555',
                    border: sort === 'popular' ? '1px solid #ffd8c2' : '1px solid transparent',
                    padding: '5px 10px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minHeight: '30px',
                  }}
                >
                  🔥 Popular
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', color: '#878a8c' }}>
                  Status:
                </span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '8px',
                    border: '1px solid #d2d2d7',
                    fontSize: '12px',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    cursor: 'pointer',
                    margin: 0,
                    minHeight: '30px',
                    height: '30px',
                    width: 'auto',
                  }}
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>
                      {st === 'All' ? 'All Statuses' : st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bottom row: Category Filter Pills */}
            <div
              className="no-scrollbar"
              style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                paddingBottom: '2px',
                WebkitOverflowScrolling: 'touch',
                maxWidth: '100%',
              }}
            >
              {categories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    style={{
                      whiteSpace: 'nowrap',
                      backgroundColor: isSelected ? '#1c1c1c' : '#f6f7f8',
                      color: isSelected ? '#ffffff' : '#555',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                      minHeight: '30px',
                    }}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feed Content */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#86868b' }}>
              <p style={{ fontSize: '24px', marginBottom: '8px' }}>🏛️</p>
              <p style={{ fontSize: '16px', fontWeight: '500' }}>Loading civic feed...</p>
            </div>
          ) : issues.length === 0 ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e5e7',
                borderRadius: '12px',
                padding: '48px 24px',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>🍃</span>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                No civic issues found
              </h3>
              <p style={{ color: '#86868b', fontSize: '14px', marginBottom: '24px' }}>
                Be the first citizen to report an issue in this category or search area.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/report-issue')}
                style={{ padding: '10px 24px', fontSize: '14px' }}
              >
                Report a Grievance
              </button>
            </div>
          ) : (
            <div>
              {issues.map((issue) => (
                <IssueCard key={issue._id} issue={issue} onVoteSuccess={handleVoteSuccess} />
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <button
                    onClick={() => fetchFeed(page + 1, true)}
                    disabled={loadingMore}
                    className="btn btn-secondary"
                    style={{
                      width: '100%',
                      maxWidth: '300px',
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    {loadingMore ? 'Loading more issues...' : 'Load More Issues'}
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Sidebar Column (Desktop) */}
        <aside className="feed-sidebar">
          {/* Community Info Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e5e7',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '24px' }}>🏛️</span>
              <div>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>c/CivicSense</h4>
                <span style={{ fontSize: '11px', color: '#787c7e' }}>Public Accountability Feed</span>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#3c3c43', lineHeight: 1.5, marginBottom: '16px' }}>
              Empowering citizens to report potholes, water leaks, broken streetlights, and sanitation problems directly for civic action.
            </p>

            {/* Quick Metrics */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                padding: '12px',
                backgroundColor: '#f6f7f8',
                borderRadius: '8px',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              <div>
                <span style={{ display: 'block', fontSize: '18px', fontWeight: '700', color: '#1c1c1c' }}>
                  {stats.total}
                </span>
                <span style={{ fontSize: '11px', color: '#878a8c' }}>Total Reports</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '18px', fontWeight: '700', color: '#389e0d' }}>
                  {stats.resolved}
                </span>
                <span style={{ fontSize: '11px', color: '#878a8c' }}>Resolved</span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => navigate('/report-issue')}
              style={{ width: '100%', padding: '10px', fontSize: '14px' }}
            >
              Report Grievance
            </button>
          </div>

          {/* Civic Guidelines Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e5e7',
              borderRadius: '12px',
              padding: '20px',
            }}
          >
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: '#1c1c1c' }}>
              📜 Citizen Guidelines
            </h4>
            <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#555', lineHeight: 1.6 }}>
              <li style={{ marginBottom: '6px' }}>Provide accurate landmarks and 6-digit pin codes.</li>
              <li style={{ marginBottom: '6px' }}>Attach clear photos of the issue for authority verification.</li>
              <li style={{ marginBottom: '6px' }}>Upvote urgent issues to elevate municipal response priority.</li>
              <li>Keep comments respectful, civic-minded, and constructive.</li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Home;
