// client/src/pages/Profile.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [form, setForm] = useState({ name: '', bio: '', pincode: '' });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const fetchProfile = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setStats(data.stats || {});
        setForm({
          name: data.user.name || '',
          bio: data.user.bio || '',
          pincode: data.user.pincode || '',
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setEditing(false);
        setMessage('Profile updated successfully!');
        // Update local storage user name
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        stored.name = data.user.name;
        localStorage.setItem('user', JSON.stringify(stored));
      } else {
        setMessage('Failed to update profile.');
      }
    } catch (e) {
      setMessage('Error updating profile.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '90px 16px', textAlign: 'center' }}>
        <p style={{ fontSize: '24px' }}>👤</p>
        <p style={{ color: '#86868b' }}>Loading profile...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '74px 14px 80px 14px', width: '100%', boxSizing: 'border-box' }}>
      {/* Header Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5e7',
          borderRadius: '16px',
          padding: '20px 16px',
          marginBottom: '20px',
          boxSizing: 'border-box',
          maxWidth: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '999px',
              backgroundColor: '#ff4500',
              color: '#fff',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              flexShrink: 0,
            }}
          >
            {profile.name ? profile.name[0].toUpperCase() : 'C'}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 4px 0', wordBreak: 'break-word' }}>{profile.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#787c7e', flexWrap: 'wrap' }}>
              <span style={{ wordBreak: 'break-all' }}>{profile.email}</span>
              <span>•</span>
              <span
                style={{
                  backgroundColor: profile.role === 'admin' ? '#e6f7ff' : '#f6ffed',
                  color: profile.role === 'admin' ? '#096dd9' : '#389e0d',
                  padding: '1px 8px',
                  borderRadius: '999px',
                  fontWeight: '700',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                {profile.role === 'admin' ? 'Municipal Authority' : 'Verified Citizen'}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p style={{ fontSize: '14px', color: '#3c3c43', margin: '0 0 16px 0', lineHeight: 1.5, wordBreak: 'break-word' }}>
            "{profile.bio}"
          </p>
        )}

        {/* Civic Karma & Engagement Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(65px, 1fr))',
            gap: '8px',
            backgroundColor: '#f6f7f8',
            borderRadius: '12px',
            padding: '12px 8px',
            textAlign: 'center',
          }}
        >
          <div>
            <span style={{ display: 'block', fontSize: '18px', fontWeight: '700', color: '#ff4500' }}>
              {stats.totalKarma || 0}
            </span>
            <span style={{ fontSize: '10px', color: '#787c7e', fontWeight: '600' }}>Karma</span>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '18px', fontWeight: '700', color: '#1c1c1c' }}>
              {stats.totalReports || 0}
            </span>
            <span style={{ fontSize: '10px', color: '#787c7e', fontWeight: '600' }}>Reports</span>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '18px', fontWeight: '700', color: '#389e0d' }}>
              {stats.resolvedReports || 0}
            </span>
            <span style={{ fontSize: '10px', color: '#787c7e', fontWeight: '600' }}>Resolved</span>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '18px', fontWeight: '700', color: '#1c1c1c' }}>
              {stats.totalVotesCast || 0}
            </span>
            <span style={{ fontSize: '10px', color: '#787c7e', fontWeight: '600' }}>Votes</span>
          </div>
        </div>
      </div>

      {/* Edit Profile / Settings */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5e7',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Account Settings</h3>
          <button
            onClick={() => setEditing(!editing)}
            className="btn btn-secondary"
            style={{ padding: '6px 14px', fontSize: '13px' }}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {message && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: message.includes('success') ? '#f6ffed' : '#fff1f0',
              color: message.includes('success') ? '#389e0d' : '#cf1322',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {message}
          </div>
        )}

        {editing ? (
          <form onSubmit={handleUpdate}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
              Display Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d2d2d7',
                marginBottom: '14px',
                fontSize: '14px',
              }}
            />

            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
              Bio / Area Focus
            </label>
            <textarea
              placeholder="e.g. Concerned resident of Dahisar East focusing on road quality"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d2d2d7',
                marginBottom: '14px',
                fontSize: '14px',
                resize: 'vertical',
              }}
            />

            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
              Primary Area Pin Code
            </label>
            <input
              type="text"
              placeholder="6-digit pin code"
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d2d2d7',
                marginBottom: '16px',
                fontSize: '14px',
              }}
            />

            <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px', fontSize: '14px' }}>
              Save Changes
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#555' }}>
            <div><strong>Email:</strong> {profile.email}</div>
            <div><strong>Area Pin Code:</strong> {profile.pincode || 'Not specified'}</div>
            <div><strong>Role:</strong> {profile.role}</div>
          </div>
        )}
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="btn btn-secondary"
        style={{ width: '100%', color: '#d32f2f', fontWeight: '600' }}
      >
        Sign Out of Civic Sense
      </button>
    </div>
  );
};

export default Profile;
