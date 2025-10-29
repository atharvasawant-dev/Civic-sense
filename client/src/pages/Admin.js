import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";

const API_URL = "http://localhost:5000/api/admin/issues";

const Admin = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch all issues (admin only)
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

  // ✅ Update issue status
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

  // ✅ Delete issue
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
      } else {
        console.error("Failed to delete issue");
      }
    } catch (err) {
      console.error("Error deleting issue:", err);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading issues...</p>;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f9fb",
        padding: "2rem 1rem 6rem 1rem",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontWeight: "700",
          fontSize: "1.8rem",
          marginBottom: "0.5rem",
        }}
      >
        🛠 Admin Dashboard
      </h2>
      <p
        style={{
          textAlign: "center",
          color: "#555",
          marginBottom: "2rem",
          fontSize: "1rem",
        }}
      >
        Manage, resolve, or delete civic issues reported by users.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "1.5rem",
          justifyContent: "center",
        }}
      >
        {issues.length === 0 ? (
          <p style={{ textAlign: "center" }}>No issues reported yet.</p>
        ) : (
          issues.map((issue) => (
            <div
              key={issue._id}
              style={{
                background: "#fff",
                borderRadius: "10px",
                padding: "1.2rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3 style={{ fontWeight: "600", color: "#1a2b49" }}>
                  {issue.title}
                </h3>
                <p><strong>Description:</strong> {issue.description}</p>
                <p><strong>Category:</strong> {issue.category || "N/A"}</p>
                <p><strong>Landmark:</strong> {issue.landmark || "N/A"}</p>
                <p><strong>Pin Code:</strong> {issue.pincode || "N/A"}</p>
                <p><strong>Status:</strong> {issue.status}</p>
                <p><strong>Reported by:</strong> {issue.user?.email || "Unknown"}</p>

                {issue.image && (
                  <img
                    src={`http://localhost:5000/uploads/${issue.image}`}
                    alt="Issue"
                    style={{
                      width: "100%",
                      maxHeight: "220px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      marginTop: "10px",
                    }}
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                }}
              >
                <button
                  onClick={() => updateStatus(issue._id, "Resolved")}
                  style={buttonStyles.green}
                >
                  Mark Resolved
                </button>
                <button
                  onClick={() => updateStatus(issue._id, "Pending")}
                  style={buttonStyles.yellow}
                >
                  Mark Pending
                </button>
                <button
                  onClick={() => deleteIssue(issue._id)}
                  style={buttonStyles.red}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Footer />
    </div>
  );
};

// ✅ Clean reusable button styles
const buttonStyles = {
  green: {
    flex: 1,
    background: "#28a745",
    color: "#fff",
    border: "none",
    padding: "0.5rem",
    borderRadius: "6px",
    cursor: "pointer",
  },
  yellow: {
    flex: 1,
    background: "#f1c40f",
    color: "#000",
    border: "none",
    padding: "0.5rem",
    borderRadius: "6px",
    cursor: "pointer",
  },
  red: {
    flex: 1,
    background: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "0.5rem",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default Admin;
