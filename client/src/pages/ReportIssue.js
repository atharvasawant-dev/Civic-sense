import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/issues`;

const ReportIssue = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    landmark: "",
    pincode: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      setError("Image size should be less than 2MB.");
      setForm({ ...form, image: null });
      setPreview(null);
      return;
    }
    setError("");
    setForm({ ...form, image: file });
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.title ||
      !form.description ||
      !form.category ||
      !form.landmark ||
      !form.pincode
    ) {
      setError("All fields are required.");
      return;
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      setError("Please enter a valid 6-digit Pin Code.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/login');
        return;
      }

      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val) formData.append(key, val);
      });
      formData.append("status", "Pending");
      formData.append("date", new Date().toISOString());

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to submit report");

      setSubmitted(true);
      const createdId = data.issue?._id;
      setTimeout(() => {
        if (createdId) navigate(`/issues/${createdId}`);
        else navigate('/my-reports');
      }, 1500);
    } catch (err) {
      setError(err.message || "Error submitting issue.");
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
      <div className="card" style={{ maxWidth: '580px', width: '100%', boxSizing: 'border-box' }}>
        <h2 style={{ textAlign: 'center', fontSize: '26px', margin: '0 0 8px 0' }}>Report Civic Issue</h2>
        <p style={{ textAlign: 'center', color: '#86868b', margin: '0 0 24px 0', fontSize: '14px', lineHeight: 1.4 }}>
          Help local municipal authorities resolve grievances by submitting clear details.
        </p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <label htmlFor="issue-title">Issue Title</label>
          <input
            id="issue-title"
            type="text"
            name="title"
            placeholder="Brief summary (e.g., Deep Pothole on Hill Road)"
            value={form.title}
            onChange={handleChange}
            required
            style={{ width: '100%', boxSizing: 'border-box' }}
          />

          <label htmlFor="issue-desc">Description</label>
          <textarea
            id="issue-desc"
            name="description"
            placeholder="Describe the issue, hazards, and how long it has been present..."
            value={form.description}
            onChange={handleChange}
            required
            rows="4"
            style={{ minHeight: '100px', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
          ></textarea>

          <label htmlFor="issue-cat">Category</label>
          <select
            id="issue-cat"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            style={{ width: '100%', boxSizing: 'border-box' }}
          >
            <option value="">Select Category</option>
            <option value="Pothole">🕳️ Pothole</option>
            <option value="Garbage">🗑️ Garbage Overflow</option>
            <option value="Streetlight">💡 Streetlight Outage</option>
            <option value="Water Supply">🚰 Water Leakage / Supply</option>
            <option value="Drainage">🌊 Drainage / Flooding</option>
            <option value="Other">📢 Other Civic Grievance</option>
          </select>

          <label htmlFor="issue-landmark">Landmark / Exact Location</label>
          <input
            id="issue-landmark"
            type="text"
            name="landmark"
            placeholder="E.g. Opposite St. Andrew's Church, Hill Road"
            value={form.landmark}
            onChange={handleChange}
            required
            style={{ width: '100%', boxSizing: 'border-box' }}
          />

          <label htmlFor="issue-pincode">Area Pin Code</label>
          <input
            id="issue-pincode"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            name="pincode"
            placeholder="6-digit postal code (e.g. 400050)"
            value={form.pincode}
            onChange={handleChange}
            required
            style={{ width: '100%', boxSizing: 'border-box' }}
          />

          <label htmlFor="issue-image">Attach Photo (Optional, Max 2MB)</label>
          <input
            id="issue-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ width: '100%', boxSizing: 'border-box' }}
          />

          {preview && (
            <div style={{ marginBottom: '20px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e5e5e7' }}>
              <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          {error && <div className="message message-error">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', minHeight: '48px', fontSize: '16px', fontWeight: '600', marginTop: '8px' }}
          >
            Submit Report
          </button>
        </form>

        {submitted && (
          <div className="message message-success" style={{ marginTop: '16px', textAlign: 'center' }}>
            ✓ Issue submitted successfully! Redirecting to report details...
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportIssue;
