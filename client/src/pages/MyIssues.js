import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";
import "./MyIssues.css";

const API_URL = "http://localhost:5000/api/issues/my";

const MyIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  if (loading) return <p className="loading-text">Loading your issues...</p>;

  return (
    <div className="issues-page">
      <div className="issues-container">
        <h2 className="issues-title">📋 My Reported Issues</h2>
        <p className="issues-subtitle">
          Track the live status of all civic issues you’ve reported.
        </p>

        <div className="refresh-section">
          <button
            className="refresh-btn"
            onClick={() => {
              setRefreshing(true);
              fetchIssues();
            }}
          >
            {refreshing ? "Refreshing..." : "🔄 Refresh"}
          </button>
        </div>

        {issues.length === 0 ? (
          <p className="no-issues">You haven’t reported any issues yet.</p>
        ) : (
          <div className="issues-grid">
            {issues.map((issue) => (
              <div key={issue._id} className="issue-card">
                <h3 className="issue-title">{issue.title}</h3>

                <div className="issue-details">
                  <p>
                    <strong>Description:</strong> {issue.description}
                  </p>
                  <p>
                    <strong>Category:</strong> {issue.category}
                  </p>
                  <p>
                    <strong>Landmark:</strong> {issue.landmark || "Not provided"}
                  </p>
                  <p>
                    <strong>Pin Code:</strong> {issue.pincode || "Not provided"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`status-badge ${
                        issue.status === "Resolved"
                          ? "resolved"
                          : issue.status === "Pending"
                          ? "pending"
                          : "progress"
                      }`}
                    >
                      {issue.status}
                    </span>
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(issue.date).toLocaleDateString("en-GB")}
                  </p>
                </div>

                {issue.imageUrl && (
                  <img
                    src={issue.imageUrl}
                    alt="Issue"
                    className="issue-image"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyIssues;
