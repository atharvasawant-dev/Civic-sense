// client/src/components/IssueCard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryPlaceholder, { getCategoryMeta } from './CategoryPlaceholder';
import { API_BASE_URL, BASE_URL } from '../config';

const statusBadges = {
  Pending: { bg: '#fff7e6', color: '#d46b08', border: '#ffd591' },
  'In Progress': { bg: '#e6f7ff', color: '#096dd9', border: '#91d5ff' },
  Resolved: { bg: '#f6ffed', color: '#389e0d', border: '#b7eb8f' },
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

export const IssueCard = ({ issue, onVoteSuccess }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [score, setScore] = useState(issue.score || 0);
  const [userVote, setUserVote] = useState(issue.userVote || 0);
  const [voting, setVoting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleVote = async (e, value) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    if (voting) return;

    // Optimistic UI update
    const previousScore = score;
    const previousVote = userVote;
    let targetVote = value;

    if (userVote === value) {
      targetVote = 0; // Toggle off
    }

    let delta = 0;
    if (targetVote === 1) delta = previousVote === -1 ? 2 : 1;
    else if (targetVote === -1) delta = previousVote === 1 ? -2 : -1;
    else if (targetVote === 0) delta = previousVote === 1 ? -1 : 1;

    setUserVote(targetVote);
    setScore(previousScore + delta);
    setVoting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/issues/${issue._id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value: targetVote }),
      });

      if (!res.ok) {
        throw new Error('Vote failed');
      }

      const data = await res.json();
      setScore(data.score);
      setUserVote(data.userVote);
      if (onVoteSuccess) onVoteSuccess(issue._id, data.score, data.userVote);
    } catch (err) {
      // Revert on error
      setUserVote(previousVote);
      setScore(previousScore);
    } finally {
      setVoting(false);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/issues/${issue._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const categoryMeta = getCategoryMeta(issue.category);
  const statusMeta = statusBadges[issue.status] || statusBadges.Pending;

  return (
    <article
      onClick={() => navigate(`/issues/${issue._id}`)}
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e5e7',
        borderRadius: '12px',
        marginBottom: '16px',
        cursor: 'pointer',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        display: 'flex',
        overflow: 'hidden',
        boxSizing: 'border-box',
        maxWidth: '100%',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#86868b';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e5e5e7';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Reddit-style Left Vote Column */}
      <div
        style={{
          width: '44px',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '10px 2px',
          gap: '2px',
          borderRight: '1px solid #f0f0f2',
          flexShrink: 0,
          boxSizing: 'border-box',
        }}
      >
        {/* Upvote Button */}
        <button
          onClick={(e) => handleVote(e, 1)}
          aria-label="Upvote"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 4px',
            borderRadius: '4px',
            color: userVote === 1 ? '#ff4500' : '#878a8c',
            backgroundColor: userVote === 1 ? '#ffefe6' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '17px',
            lineHeight: 1,
            transition: 'all 0.15s ease',
            minHeight: '32px',
            minWidth: '32px',
          }}
          title="Upvote (Citizen Priority)"
        >
          ▲
        </button>

        {/* Vote Score */}
        <span
          style={{
            fontSize: '13px',
            fontWeight: '700',
            color:
              userVote === 1
                ? '#ff4500'
                : userVote === -1
                ? '#7193ff'
                : '#1c1c1c',
          }}
        >
          {score}
        </span>

        {/* Downvote Button */}
        <button
          onClick={(e) => handleVote(e, -1)}
          aria-label="Downvote"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 4px',
            borderRadius: '4px',
            color: userVote === -1 ? '#7193ff' : '#878a8c',
            backgroundColor: userVote === -1 ? '#f0f4ff' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '17px',
            lineHeight: 1,
            transition: 'all 0.15s ease',
            minHeight: '32px',
            minWidth: '32px',
          }}
          title="Downvote"
        >
          ▼
        </button>
      </div>

      {/* Main Post Content */}
      <div style={{ flex: 1, minWidth: 0, padding: '12px 14px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        {/* Post Metadata Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#787c7e',
            flexWrap: 'wrap',
            marginBottom: '8px',
          }}
        >
          {/* Category Chip */}
          <span
            style={{
              fontWeight: '700',
              color: categoryMeta.text,
              backgroundColor: categoryMeta.bg,
              padding: '2px 8px',
              borderRadius: '999px',
              border: `1px solid ${categoryMeta.border}`,
              whiteSpace: 'nowrap',
              fontSize: '11px',
            }}
          >
            {categoryMeta.icon} c/{issue.category}
          </span>

          <span style={{ color: '#c4c4c6' }}>•</span>
          <span
            style={{
              display: 'inline-block',
              maxWidth: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              verticalAlign: 'middle',
            }}
            title={`u/${issue.user?.name || 'Citizen'}`}
          >
            u/{issue.user?.name || 'Citizen'}
          </span>
          <span style={{ color: '#c4c4c6' }}>•</span>
          <span style={{ whiteSpace: 'nowrap' }}>{formatTimeAgo(issue.date)}</span>

          {/* Status Badge */}
          <span
            style={{
              marginLeft: 'auto',
              backgroundColor: statusMeta.bg,
              color: statusMeta.color,
              border: `1px solid ${statusMeta.border}`,
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            ● {issue.status}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '17px',
            fontWeight: '600',
            color: '#1a1a1b',
            margin: '0 0 8px 0',
            lineHeight: 1.35,
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {issue.title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: '14px',
            color: '#3c3c43',
            margin: '0 0 12px 0',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {issue.description}
        </p>

        {/* Image / Fallback Container */}
        {(issue.imageUrl || issue.image) && (
          <div
            style={{
              margin: '0 0 12px 0',
              borderRadius: '8px',
              overflow: 'hidden',
              maxHeight: '340px',
              backgroundColor: '#f5f5f7',
              maxWidth: '100%',
            }}
          >
            {!imageError ? (
              <img
                src={issue.imageUrl || (issue.image?.startsWith('http') ? issue.image : (issue.image ? `${BASE_URL}/uploads/${issue.image}` : ''))}
                alt={issue.title}
                onError={() => setImageError(true)}
                style={{
                  width: '100%',
                  maxHeight: '340px',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ) : (
              <CategoryPlaceholder category={issue.category} height={200} />
            )}
          </div>
        )}

        {/* Footer Info & Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '6px',
            fontSize: '12px',
            color: '#878a8c',
            marginTop: 'auto',
            paddingTop: '8px',
            borderTop: '1px solid #f6f7f8',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', minWidth: 0 }}>
            {/* Comments Counter Button */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: '#f6f7f8',
                fontWeight: '600',
                color: '#1c1c1c',
                whiteSpace: 'nowrap',
              }}
            >
              💬 {issue.commentsCount || 0}
            </span>

            {/* Location Pill */}
            <span
              title={`${issue.landmark}, ${issue.pincode}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: '#f6f7f8',
                color: '#555',
                maxWidth: '160px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              📍 {issue.landmark}, {issue.pincode}
            </span>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: copied ? '#389e0d' : '#878a8c',
              fontWeight: '600',
              padding: '6px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              minHeight: '32px',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {copied ? '✓ Copied' : '🔗 Share'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default IssueCard;
