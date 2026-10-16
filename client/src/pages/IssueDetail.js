// client/src/pages/IssueDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CategoryPlaceholder, { getCategoryMeta } from '../components/CategoryPlaceholder';
import { API_BASE_URL, BASE_URL } from '../config';

const statusSteps = ['Pending', 'In Progress', 'Resolved'];

const statusBadges = {
  Pending: { bg: '#fff7e6', color: '#d46b08', border: '#ffd591' },
  'In Progress': { bg: '#e6f7ff', color: '#096dd9', border: '#91d5ff' },
  Resolved: { bg: '#f6ffed', color: '#389e0d', border: '#b7eb8f' },
};

export const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [score, setScore] = useState(0);
  const [userVote, setUserVote] = useState(0);
  const [voting, setVoting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const token = localStorage.getItem('token');
  let currentUserId = null;
  let currentUserRole = null;
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    currentUserId = user.id;
    currentUserRole = user.role;
  } catch (e) {}

  const fetchIssueAndComments = async () => {
    try {
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const [issueRes, commentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/issues/${id}`, { headers }),
        fetch(`${API_BASE_URL}/issues/${id}/comments`),
      ]);

      if (issueRes.ok) {
        const issueData = await issueRes.json();
        setIssue(issueData);
        setScore(issueData.score || 0);
        setUserVote(issueData.userVote || 0);
      } else {
        setErrorMsg('Issue not found');
      }

      if (commentsRes.ok) {
        const commentsData = await commentsRes.json();
        setComments(Array.isArray(commentsData) ? commentsData : []);
      }
    } catch (err) {
      console.error('Error fetching issue:', err);
      setErrorMsg('Failed to load issue details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssueAndComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleVote = async (value) => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (voting) return;

    const previousScore = score;
    const previousVote = userVote;
    let targetVote = value;
    if (userVote === value) targetVote = 0;

    let delta = 0;
    if (targetVote === 1) delta = previousVote === -1 ? 2 : 1;
    else if (targetVote === -1) delta = previousVote === 1 ? -2 : -1;
    else if (targetVote === 0) delta = previousVote === 1 ? -1 : 1;

    setUserVote(targetVote);
    setScore(previousScore + delta);
    setVoting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/issues/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value: targetVote }),
      });

      if (!res.ok) throw new Error('Vote failed');
      const data = await res.json();
      setScore(data.score);
      setUserVote(data.userVote);
    } catch (e) {
      setUserVote(previousVote);
      setScore(previousScore);
    } finally {
      setVoting(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate('/login');
      return;
    }
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`${API_BASE_URL}/issues/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: commentText.trim(),
          parentComment: replyTo?._id || null,
        }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [...prev, newComment]);
        setCommentText('');
        setReplyTo(null);
        if (issue) {
          setIssue({ ...issue, commentsCount: (issue.commentsCount || 0) + 1 });
        }
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/issues/${id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        if (issue) {
          setIssue({ ...issue, commentsCount: Math.max(0, (issue.commentsCount || 1) - 1) });
        }
      }
    } catch (err) {
      console.error('Delete comment error:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '90px 16px', textAlign: 'center' }}>
        <p style={{ fontSize: '24px' }}>🏛️</p>
        <p style={{ color: '#86868b', fontSize: '16px' }}>Loading grievance details...</p>
      </div>
    );
  }

  if (errorMsg || !issue) {
    return (
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '90px 16px', textAlign: 'center' }}>
        <h2>{errorMsg || 'Issue Not Found'}</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '16px' }}>
          Back to Civic Feed
        </button>
      </div>
    );
  }

  const categoryMeta = getCategoryMeta(issue.category);
  const statusMeta = statusBadges[issue.status] || statusBadges.Pending;
  const currentStepIndex = statusSteps.indexOf(issue.status);

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '74px 14px 80px 14px', width: '100%', boxSizing: 'border-box' }}>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#0071e3',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '16px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          minHeight: '40px',
        }}
      >
        ← Back to Reports
      </button>

      {/* Main Post Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5e7',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '20px',
          boxSizing: 'border-box',
          maxWidth: '100%',
        }}
      >
        <div style={{ display: 'flex' }}>
          {/* Vote Column */}
          <div
            style={{
              width: '44px',
              backgroundColor: '#f8f9fa',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '12px 2px',
              gap: '4px',
              borderRight: '1px solid #f0f0f2',
              flexShrink: 0,
              boxSizing: 'border-box',
            }}
          >
            <button
              onClick={() => handleVote(1)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                color: userVote === 1 ? '#ff4500' : '#878a8c',
                backgroundColor: userVote === 1 ? '#ffefe6' : 'transparent',
                borderRadius: '4px',
                padding: '4px',
                minHeight: '34px',
                minWidth: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ▲
            </button>
            <span
              style={{
                fontSize: '13px',
                fontWeight: '700',
                color: userVote === 1 ? '#ff4500' : userVote === -1 ? '#7193ff' : '#1c1c1c',
              }}
            >
              {score}
            </span>
            <button
              onClick={() => handleVote(-1)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                color: userVote === -1 ? '#7193ff' : '#878a8c',
                backgroundColor: userVote === -1 ? '#f0f4ff' : 'transparent',
                borderRadius: '4px',
                padding: '4px',
                minHeight: '34px',
                minWidth: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ▼
            </button>
          </div>

          {/* Details Body */}
          <div style={{ flex: 1, minWidth: 0, padding: '16px 14px', boxSizing: 'border-box' }}>
            {/* Header info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#787c7e', flexWrap: 'wrap', marginBottom: '10px' }}>
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
              <span style={{ display: 'inline-block', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Reported by <strong>u/{issue.user?.name || 'Citizen'}</strong>
              </span>
              <span style={{ color: '#c4c4c6' }}>•</span>
              <span style={{ whiteSpace: 'nowrap' }}>{new Date(issue.date).toLocaleDateString()}</span>
              <span
                style={{
                  marginLeft: 'auto',
                  backgroundColor: statusMeta.bg,
                  color: statusMeta.color,
                  border: `1px solid ${statusMeta.border}`,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                ● {issue.status}
              </span>
            </div>

            {/* Title */}
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1b', margin: '0 0 14px 0', lineHeight: 1.3, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
              {issue.title}
            </h1>

            {/* Image */}
            {(issue.imageUrl || issue.image) && (
              <div style={{ marginBottom: '16px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f5f5f7', maxWidth: '100%' }}>
                {!imageError ? (
                  <img
                    src={issue.imageUrl || (issue.image?.startsWith('http') ? issue.image : (issue.image ? `${BASE_URL}/uploads/${issue.image}` : ''))}
                    alt={issue.title}
                    onError={() => setImageError(true)}
                    style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', display: 'block', backgroundColor: '#000' }}
                  />
                ) : (
                  <CategoryPlaceholder category={issue.category} height={220} />
                )}
              </div>
            )}

            {/* Full Description */}
            <div style={{ fontSize: '15px', lineHeight: 1.6, color: '#1d1d1f', marginBottom: '20px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
              {issue.description}
            </div>

            {/* Location Banner */}
            <div
              style={{
                backgroundColor: '#f6f7f8',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '13px',
                color: '#555',
                marginBottom: '20px',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                boxSizing: 'border-box',
              }}
            >
              <span style={{ fontSize: '18px', flexShrink: 0 }}>📍</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <strong>Location:</strong> {issue.landmark} &nbsp;|&nbsp; <strong>Pin Code:</strong> {issue.pincode}
              </div>
            </div>

            {/* Resolution Progress Bar */}
            <div style={{ borderTop: '1px solid #f0f0f2', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#878a8c', textTransform: 'uppercase', marginBottom: '10px' }}>
                Municipal Resolution Status
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', width: '100%' }}>
                {statusSteps.map((step, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;
                  return (
                    <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', minWidth: 0 }}>
                      <div
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '999px',
                          backgroundColor: isDone ? (isCurrent ? '#ff4500' : '#389e0d') : '#e5e5e7',
                          color: isDone ? '#ffffff' : '#86868b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '700',
                          zIndex: 2,
                        }}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: isCurrent ? '700' : '500',
                          color: isCurrent ? '#1c1c1c' : '#787c7e',
                          marginTop: '4px',
                          textAlign: 'center',
                          wordBreak: 'break-word',
                        }}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discussion & Comments Section */}
      <section
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5e7',
          borderRadius: '12px',
          padding: '18px 14px',
          boxSizing: 'border-box',
          maxWidth: '100%',
        }}
      >
        <h3 style={{ fontSize: '17px', fontWeight: '700', margin: '0 0 16px 0' }}>
          💬 Community Discussion ({comments.length})
        </h3>

        {/* Comment Input Box */}
        {token ? (
          <form onSubmit={handlePostComment} style={{ marginBottom: '28px' }}>
            {replyTo && (
              <div
                style={{
                  fontSize: '12px',
                  color: '#096dd9',
                  backgroundColor: '#e6f7ff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Replying to <strong>u/{replyTo.user?.name || 'Citizen'}</strong></span>
                <span onClick={() => setReplyTo(null)} style={{ cursor: 'pointer', fontWeight: '700' }}>✕</span>
              </div>
            )}
            <textarea
              placeholder="What are your thoughts on this civic issue? Share context or updates..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #d2d2d7',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
                marginBottom: '10px',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              {replyTo && (
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="btn btn-primary"
                style={{ padding: '8px 20px', fontSize: '13px' }}
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        ) : (
          <div
            style={{
              padding: '16px',
              backgroundColor: '#f6f7f8',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '24px',
            }}
          >
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#555' }}>
              Sign in to join the discussion and verify repairs.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '13px' }}>
              Sign In to Comment
            </Link>
          </div>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <p style={{ color: '#86868b', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>
            No comments yet. Be the first to share an update or witness report!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {comments.map((c) => {
              const isAuthor = String(c.user?._id || c.user) === String(currentUserId);
              const isAdmin = currentUserRole === 'admin';
              return (
                <div
                  key={c._id}
                  style={{
                    borderLeft: '2px solid #e5e5e7',
                    paddingLeft: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#787c7e' }}>
                    <strong>u/{c.user?.name || 'Citizen'}</strong>
                    {c.user?.role === 'admin' && (
                      <span
                        style={{
                          backgroundColor: '#e6f7ff',
                          color: '#096dd9',
                          padding: '1px 6px',
                          borderRadius: '999px',
                          fontSize: '10px',
                          fontWeight: '700',
                        }}
                      >
                        AUTHORITY
                      </span>
                    )}
                    <span>•</span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>

                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#1c1c1c', lineHeight: 1.5 }}>
                    {c.content}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
                    {token && (
                      <span
                        onClick={() => setReplyTo(c)}
                        style={{ color: '#878a8c', cursor: 'pointer', fontWeight: '600' }}
                      >
                        💬 Reply
                      </span>
                    )}
                    {(isAuthor || isAdmin) && (
                      <span
                        onClick={() => handleDeleteComment(c._id)}
                        style={{ color: '#d32f2f', cursor: 'pointer', fontWeight: '600' }}
                      >
                        Delete
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default IssueDetail;
