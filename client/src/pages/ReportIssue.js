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

      if (!res.ok) throw new Error("Failed to submit");

      setSubmitted(true);
      setTimeout(() => navigate('/my-reports'), 2000);
    } catch (err) {
      setError(err.message || "Error submitting issue.");
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="card" style={{ maxWidth: '600px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', fontSize: '32px', marginBottom: '8px' }}>Report Issue</h2>
        <p style={{ textAlign: 'center', color: '#86868b', marginBottom: '32px' }}>Help us make your city better by reporting local grievances.</p>

        <form onSubmit={handleSubmit}>
          <label>Issue Title</label>
          <input name="title" placeholder="Brief summary" value={form.title} onChange={handleChange} required />

          <label>Description</label>
          <textarea name="description" placeholder="Tell us more about the issue..." value={form.description} onChange={handleChange} required rows="4" style={{ minHeight: '100px', resize: 'vertical' }}></textarea>

          <label>Category</label>
          <select name="category" value={form.category} onChange={handleChange} required>
            <option value="">Select Category</option>
            <option value="Pothole">Pothole</option>
            <option value="Garbage">Garbage</option>
            <option value="Streetlight">Streetlight</option>
            <option value="Water Supply">Water Supply</option>
            <option value="Drainage">Drainage</option>
            <option value="Other">Other</option>
          </select>

          <label>Landmark / Area</label>
          <input name="landmark" placeholder="Where exactly is it?" value={form.landmark} onChange={handleChange} required />

          <label>Pin Code</label>
          <input name="pincode" placeholder="6-digit area code" value={form.pincode} onChange={handleChange} required />

          <label>Upload Image (Max 2MB)</label>
          <input type="file" accept="image/*" onChange={handleImageChange} style={{ border: 'none', padding: '0' }} />

          {preview && (
            <img src={preview} alt="Preview" style={{ maxWidth: "100%", margin: "20px 0", borderRadius: "12px", display: "block" }} />
          )}

          {error && <div className="message message-error">{error}</div>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>
            Submit Report
          </button>
        </form>

        {submitted && (
          <div className="message message-success" style={{ marginTop: '20px', textAlign: 'center' }}>
            Issue submitted successfully! Redirecting to your reports...
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportIssue;
