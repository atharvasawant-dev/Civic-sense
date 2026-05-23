import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/issues`); // Ensure public endpoint or admin
        const data = await res.json();
        setIssues(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching issues:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  if (loading) return (
    <div className="page-container" style={{ textAlign: "center" }}>
      <p style={{ color: "#86868b", fontSize: "21px" }}>Loading issues...</p>
    </div>
  );

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h2 style={{ fontSize: "40px", fontWeight: "600", marginBottom: "8px" }}>Public Reports</h2>
          <p style={{ color: "#86868b", fontSize: "21px", margin: 0 }}>Browse civic issues reported by the community.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/report-issue')}>
          Report an Issue
        </button>
      </div>

      {issues.length === 0 ? (
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ color: "#86868b" }}>No public issues to display.</p>
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
                   <span style={styles.meta}>📍 {issue.landmark}</span>
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

export default Issues;
