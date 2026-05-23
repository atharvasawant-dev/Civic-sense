import React, { useState, useEffect } from "react";
import { API_BASE_URL, BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/admin/issues`;

const Admin = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

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
      if (res.ok) fetchIssues();
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
      }
    } catch (err) {
      console.error("Error deleting issue:", err);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  if (loading) return (
    <div className="page-container" style={{ textAlign: "center" }}>
      <p style={{ color: "#86868b", fontSize: "21px" }}>Loading dashboard...</p>
    </div>
  );

  return (
    <div className="page-container">
      <h2 style={{ fontSize: "40px", fontWeight: "600", marginBottom: "8px" }}>Admin Dashboard</h2>
      <p style={{ color: "#86868b", fontSize: "21px", marginBottom: "40px" }}>Review and manage city-wide grievances.</p>

      <div style={styles.grid}>
        {issues.length === 0 ? (
          <p style={{ color: "#86868b" }}>No issues reported yet.</p>
        ) : (
          issues.map((issue) => (
            <div key={issue._id} className="card" style={styles.card}>
              {issue.image && (
                <img
                  src={`${BASE_URL}/uploads/${issue.image}`}
                  alt={issue.title}
                  style={styles.image}
                />
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
                  <p style={styles.meta}><strong>Reported by:</strong> {issue.user?.email || "Unknown"}</p>
                </div>

                <div style={styles.actions}>
                  <button onClick={() => updateStatus(issue._id, "Resolved")} className="btn btn-secondary" style={styles.actionBtn}>
                    Mark Resolved
                  </button>
                  <button onClick={() => updateStatus(issue._id, "In Progress")} className="btn btn-secondary" style={styles.actionBtn}>
                    In Progress
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
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "30px",
  },
  card: {
    padding: 0,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "240px",
    objectFit: "cover",
  },
  cardContent: {
    padding: "24px",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  title: {
    fontSize: "21px",
    fontWeight: "600",
    margin: 0,
  },
  badge: {
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 10px",
    borderRadius: "980px",
    textTransform: "uppercase",
  },
  description: {
    fontSize: "15px",
    color: "#3c3c43",
    marginBottom: "20px",
  },
  infoRow: {
    background: "#f5f5f7",
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "24px",
  },
  meta: {
    margin: "4px 0",
    fontSize: "13px",
    color: "#1d1d1f",
  },
  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  actionBtn: {
    flex: 1,
    fontSize: "13px",
    padding: "8px 12px",
  }
};

const statusStyles = {
  Pending: { backgroundColor: "#fff5f0", color: "#ff8c00", border: "1px solid #ffd8c2" },
  Resolved: { backgroundColor: "#f5fff5", color: "#1a7d1a", border: "1px solid #d5ecd5" },
  "In Progress": { backgroundColor: "#f5faff", color: "#0071e3", border: "1px solid #d0e7ff" },
};

export default Admin;
