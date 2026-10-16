// client/src/pages/MyIssues.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IssueCard from '../components/IssueCard';
import { API_BASE_URL } from '../config';

const statuses = ['All', 'Pending', 'In Progress', 'Resolved'];

const MyIssues = () => {
  const [issues, setIssues] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchIssues = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/issues/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setIssues(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching issues:', err);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = issues.filter((i) =>
    statusFilter === 'All' ? true : i.status === statusFilter
  );

  if (loading) {
    return (
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '90px 16px', textAlign: 'center' }}>
        <p style={{ fontSize: '24px' }}>📋</p>
        <p style={{ color: '#86868b' }}>Loading your civic reports...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '74px 14px 80px 14px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0', wordBreak: 'break-word' }}>My Reports</h1>
          <p style={{ color: '#86868b', fontSize: '14px', margin: 0, lineHeight: 1.4 }}>
            Track progress and municipal action on grievances you reported.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/report-issue')}
          style={{ padding: '8px 18px', fontSize: '13px', minHeight: '40px' }}
        >
          ➕ Report New Issue
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {statuses.map((st) => {
          const count = st === 'All' ? issues.length : issues.filter((i) => i.status === st).length;
          return (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                backgroundColor: statusFilter === st ? '#1c1c1c' : '#ffffff',
                color: statusFilter === st ? '#ffffff' : '#555',
                border: '1px solid #d2d2d7',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {st} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e5e7',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>📭</span>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            No reports found in this status
          </h3>
          <p style={{ color: '#86868b', fontSize: '14px', marginBottom: '20px' }}>
            Have you spotted another pothole, water leak, or street problem?
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/report-issue')}
            style={{ padding: '8px 20px', fontSize: '14px' }}
          >
            Report an Issue
          </button>
        </div>
      ) : (
        <div>
          {filtered.map((issue) => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyIssues;
