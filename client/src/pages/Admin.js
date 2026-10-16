// client/src/pages/Admin.js
import React, { useState, useEffect } from "react";
import { API_BASE_URL, BASE_URL } from "../config";
import CategoryPlaceholder from "../components/CategoryPlaceholder";

const API_URL = `${API_BASE_URL}/admin/issues`;
const statuses = ['All', 'Pending', 'In Progress', 'Resolved'];

const Admin = () => {
  const [issues, setIssues] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const fetchIssues = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setIssues(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching issues:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setActionMessage(`Updated status to ${newStatus}`);
        setTimeout(() => setActionMessage(''), 3000);
        fetchIssues();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const deleteIssue = async (id) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setIssues(issues.filter((i) => i._id !== id));
        setActionMessage("Issue deleted successfully");
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err) {
      console.error("Error deleting issue:", err);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const filtered = issues.filter((i) =>
    statusFilter === 'All' ? true : i.status === statusFilter
  );

  if (loading) return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '90px 16px', textAlign: "center" }}>
      <p style={{ color: "#86868b", fontSize: "21px" }}>Loading administrative dashboard...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '74px 14px 80px 14px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 4px 0', wordBreak: 'break-word' }}>Authority Command Dashboard</h1>
        <p style={{ color: "#86868b", fontSize: "14px", margin: 0, lineHeight: 1.4 }}>
          Manage citizen grievance reports, assign remediation, and update resolution states.
        </p>
      </div>

      {actionMessage && (
        <div
          style={{
            backgroundColor: '#f6ffed',
            border: '1px solid #b7eb8f',
            color: '#389e0d',
            padding: '10px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '13px',
            fontWeight: '600',
          }}
        >
          ✓ {actionMessage}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
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

      <div style={styles.grid}>
        {filtered.length === 0 ? (
          <p style={{ color: "#86868b" }}>No reports found in this view.</p>
        ) : (
          filtered.map((issue) => (
            <div key={issue._id} className="card" style={styles.card}>
              {(issue.imageUrl || issue.image) ? (
                <img
                  src={issue.imageUrl || (issue.image?.startsWith('http') ? issue.image : `${BASE_URL}/uploads/${issue.image}`)}
                  alt={issue.title}
                  style={styles.image}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <CategoryPlaceholder category={issue.category} height={160} />
              )}
              <div style={styles.cardContent}>
                <div style={styles.headerRow}>
                  <h3 style={styles.title}>{issue.title}</h3>
                  <span style={{ ...styles.badge, ...statusStyles[issue.status] }}>{issue.status}</span>
                </div>
                <p style={styles.description}>{issue.description}</p>
                <div style={styles.infoRow}>
                  <p style={styles.meta}><strong>Category:</strong> {issue.category}</p>
                  <p style={styles.meta}><strong>Location:</strong> {issue.landmark}, {issue.pincode}</p>
                  <p style={styles.meta}><strong>Citizen:</strong> {issue.user?.name || issue.user?.email || "Unknown"}</p>
                  <p style={styles.meta}><strong>Community Score:</strong> {issue.score || 0} Upvotes</p>
                </div>

                <div style={styles.actions}>
                  <button onClick={() => updateStatus(issue._id, "Pending")} className="btn btn-secondary" style={styles.actionBtn}>
                    Mark Pending
                  </button>
                  <button onClick={() => updateStatus(issue._id, "In Progress")} className="btn btn-secondary" style={{ ...styles.actionBtn, color: '#096dd9' }}>
                    In Progress
                  </button>
                  <button onClick={() => updateStatus(issue._id, "Resolved")} className="btn btn-secondary" style={{ ...styles.actionBtn, color: '#389e0d' }}>
                    Mark Resolved
                  </button>
                  <button onClick={() => deleteIssue(issue._id)} className="btn btn-secondary" style={{ ...styles.actionBtn, color: '#d32f2f' }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
    gap: "16px",
  },
  card: {
    padding: 0,
    overflow: "hidden",
    borderRadius: '12px',
    border: '1px solid #e5e5e7',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    maxWidth: '100%',
  },
  image: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
  },
  cardContent: {
    padding: "16px",
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    boxSizing: 'border-box',
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "10px",
    gap: '8px',
  },
  title: {
    fontSize: "17px",
    fontWeight: "700",
    margin: 0,
    lineHeight: 1.3,
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  },
  badge: {
    fontSize: "11px",
    fontWeight: "700",
    padding: "3px 8px",
    borderRadius: "980px",
    textTransform: "uppercase",
    flexShrink: 0,
  },
  description: {
    fontSize: "14px",
    color: "#3c3c43",
    marginBottom: "16px",
    lineHeight: 1.5,
  },
  infoRow: {
    background: "#f5f5f7",
    padding: "12px 14px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: '12px',
  },
  meta: {
    margin: "3px 0",
    color: "#1d1d1f",
  },
  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: 'auto',
  },
  actionBtn: {
    flex: 1,
    minWidth: '70px',
    fontSize: "11px",
    fontWeight: '600',
    padding: "6px 8px",
  }
};

const statusStyles = {
  Pending: { backgroundColor: "#fff5f0", color: "#ff8c00", border: "1px solid #ffd8c2" },
  Resolved: { backgroundColor: "#f5fff5", color: "#1a7d1a", border: "1px solid #d5ecd5" },
  "In Progress": { backgroundColor: "#f5faff", color: "#0071e3", border: "1px solid #d0e7ff" },
};

export default Admin;
