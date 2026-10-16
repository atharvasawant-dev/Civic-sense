// client/src/pages/MyActivity.js
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import IssueCard from '../components/IssueCard';
import { API_BASE_URL } from '../config';

export const MyActivity = () => {
  const [tab, setTab] = useState('upvotes'); // 'upvotes' | 'comments'
  const [upvotedIssues, setUpvotedIssues] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivity = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/users/activity`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUpvotedIssues(data.upvotedIssues || []);
          setComments(data.comments || []);
        }
      } catch (err) {
        console.error('Activity fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '90px 16px', textAlign: 'center' }}>
        <p style={{ fontSize: '24px' }}>⚡</p>
        <p style={{ color: '#86868b' }}>Loading civic activity...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '74px 14px 80px 14px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 6px 0', wordBreak: 'break-word' }}>My Activity</h1>
        <p style={{ color: '#86868b', fontSize: '14px', margin: 0, lineHeight: 1.4 }}>
          Track civic problems you have championed with upvotes and community discussions.
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #e5e5e7',
          paddingBottom: '8px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setTab('upvotes')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: '999px',
            fontSize: '14px',
            fontWeight: '600',
            backgroundColor: tab === 'upvotes' ? '#ffefe6' : 'transparent',
            color: tab === 'upvotes' ? '#ff4500' : '#787c7e',
          }}
        >
          ▲ Upvoted Reports ({upvotedIssues.length})
        </button>

        <button
          onClick={() => setTab('comments')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: '999px',
            fontSize: '14px',
            fontWeight: '600',
            backgroundColor: tab === 'comments' ? '#ffefe6' : 'transparent',
            color: tab === 'comments' ? '#ff4500' : '#787c7e',
          }}
        >
          💬 My Comments ({comments.length})
        </button>
      </div>

      {/* Tab content */}
      {tab === 'upvotes' && (
        <div>
          {upvotedIssues.length === 0 ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e5e7',
                borderRadius: '12px',
                padding: '40px',
                textAlign: 'center',
              }}
            >
              <p style={{ color: '#86868b', fontSize: '14px' }}>
                You haven't upvoted any reports yet. Explore the feed and upvote issues that require municipal attention!
              </p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/')}
                style={{ marginTop: '12px', padding: '8px 20px', fontSize: '13px' }}
              >
                Explore Feed
              </button>
            </div>
          ) : (
            upvotedIssues.map((issue) => <IssueCard key={issue._id} issue={issue} />)
          )}
        </div>
      )}

      {tab === 'comments' && (
        <div>
          {comments.length === 0 ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e5e7',
                borderRadius: '12px',
                padding: '40px',
                textAlign: 'center',
              }}
            >
              <p style={{ color: '#86868b', fontSize: '14px' }}>
                You haven't commented on any civic reports yet.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {comments.map((c) => (
                <div
                  key={c._id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e5e7',
                    borderRadius: '10px',
                    padding: '16px',
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#787c7e', marginBottom: '6px' }}>
                    Commented on{' '}
                    {c.issue ? (
                      <Link
                        to={`/issues/${c.issue._id}`}
                        style={{ color: '#0071e3', textDecoration: 'none', fontWeight: '600' }}
                      >
                        "{c.issue.title}"
                      </Link>
                    ) : (
                      'an issue'
                    )}
                    <span> • {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1c1c1c', lineHeight: 1.5 }}>
                    "{c.content}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyActivity;
