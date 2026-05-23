import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/issues/my`;

const MyIssues = () => {
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
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  if (loading) return (
    <div className="page-container" style={{ textAlign: "center" }}>
      <p style={{ color: "#86868b", fontSize: "21px" }}>Loading your reports...</p>
    </div>
  );

  return (
    <div className="page-container">
      <h2 style={{ fontSize: "40px", fontWeight: "600", marginBottom: "8px" }}>My Reports</h2>
      <p style={{ color: "#86868b", fontSize: "21px", marginBottom: "40px" }}>Track the status of your reported grievances.</p>

      {issues.length === 0 ? (
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ color: "#86868b", fontSize: "17px" }}>You haven’t reported any issues yet.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {issues.map((issue) => (
            <div key={issue._id} className="card" style={styles.card}>
              {issue.imageUrl && (
                <img src={issue.imageUrl} alt={issue.title} style={styles.image} />
              )}
              <div style={styles.cardContent}>
                <div style={styles.headerRow}>
                  <h3 style={styles.title}>{issue.title}</h3>
                  <span style={{ ...styles.badge, ...statusStyles[issue.status] }}>
                    {issue.status}
                  </span>
                </div>
                <p style={styles.description}>{issue.description}</p>
                <div style={styles.footerRow}>
                  <span style={styles.meta}>📍 {issue.landmark}, {issue.pincode}</span>
                  <span style={styles.meta}>📅 {new Date(issue.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "30px",
  },
  card: {
    padding: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
  },
  cardContent: {
    padding: "24px",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
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
    lineHeight: 1.5,
    marginBottom: "20px",
  },
  footerRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#86868b",
  },
  meta: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  }
};

const statusStyles = {
  Pending: { backgroundColor: "#fff5f0", color: "#ff8c00", border: "1px solid #ffd8c2" },
  Resolved: { backgroundColor: "#f5fff5", color: "#1a7d1a", border: "1px solid #d5ecd5" },
  "In Progress": { backgroundColor: "#f5faff", color: "#0071e3", border: "1px solid #d0e7ff" },
};

export default MyIssues;
