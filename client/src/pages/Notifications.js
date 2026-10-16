// client/src/pages/Notifications.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const typeIcons = {
  status_change: '🛠️',
  comment: '💬',
  upvote: '▲',
  general: '🔔',
};

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchNotifications = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (e) {
      console.error('Mark read error:', e);
    }
  };

  const handleClickNotification = async (notif) => {
    if (!notif.read) {
      fetch(`${API_BASE_URL}/notifications/${notif._id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    if (notif.issue?._id || notif.issue) {
      const issueId = notif.issue._id || notif.issue;
      navigate(`/issues/${issueId}`);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '90px 16px', textAlign: 'center' }}>
        <p style={{ fontSize: '24px' }}>🔔</p>
        <p style={{ color: '#86868b' }}>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '74px 14px 80px 14px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0', wordBreak: 'break-word' }}>Notifications</h1>
          <p style={{ color: '#86868b', fontSize: '14px', margin: 0, lineHeight: 1.4 }}>
            Stay updated on your reported grievances and community feedback.
          </p>
        </div>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px', minHeight: '36px' }}
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e5e7',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>🔕</span>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '6px' }}>No notifications yet</h3>
          <p style={{ color: '#86868b', fontSize: '14px' }}>
            When authorities update your report status or citizens upvote and comment, you'll see alerts here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleClickNotification(n)}
              style={{
                backgroundColor: n.read ? '#ffffff' : '#f0f7ff',
                border: n.read ? '1px solid #e5e5e7' : '1px solid #bae0ff',
                borderRadius: '10px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '20px', lineHeight: 1 }}>{typeIcons[n.type] || '🔔'}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#1c1c1c', fontWeight: n.read ? '400' : '600' }}>
                  {n.message}
                </p>
                <span style={{ fontSize: '11px', color: '#878a8c' }}>
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
              {!n.read && (
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '999px',
                    backgroundColor: '#ff4500',
                    marginTop: '6px',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
