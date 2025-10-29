import React, { useState } from "react";
import Footer from "../components/Footer";

const API_URL = "http://localhost:5000/api/issues";

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
    e.target.value = null;
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
      setForm({
        title: "",
        description: "",
        category: "",
        landmark: "",
        pincode: "",
        image: null,
      });
      setPreview(null);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError(err.message || "Error submitting issue.");
    }
  };

  return (
    <div
      style={{
        background: "#f7f9fc",
        minHeight: "85vh",
        padding: "3rem 1rem",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          background: "#fff",
          padding: "2rem",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#183153",
            fontWeight: "700",
            fontSize: "1.8rem",
            marginBottom: "1.5rem",
          }}
        >
          📝 Report a New Issue
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
            rows="4"
            style={inputStyle}
          ></textarea>

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            style={inputStyle}
          >
            <option value="">-- Select Category --</option>
            <option value="Pothole">Pothole</option>
            <option value="Garbage">Garbage</option>
            <option value="Streetlight">Streetlight</option>
            <option value="Water Supply">Water Supply</option>
            <option value="Drainage">Drainage</option>
            <option value="Other">Other</option>
          </select>

          <input
            name="landmark"
            placeholder="Landmark / Area"
            value={form.landmark}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            name="pincode"
            placeholder="Pin Code"
            value={form.pincode}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{
              padding: "0.5rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />

          {preview && (
            <img
              src={preview}
              alt="Preview"
              style={{
                maxWidth: "200px",
                margin: "10px auto",
                display: "block",
                borderRadius: "8px",
              }}
            />
          )}

          {error && (
            <p style={{ color: "red", textAlign: "center" }}>{error}</p>
          )}

          <button
            type="submit"
            style={{
              background: "#173B6C",
              color: "#fff",
              padding: "0.8rem",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "1rem",
              transition: "0.3s",
            }}
          >
            Submit
          </button>
        </form>

        {submitted && (
          <p style={{ color: "green", textAlign: "center", marginTop: "1rem" }}>
            ✅ Issue submitted successfully!
          </p>
        )}
      </div>
      <Footer />
    </div>
  );
};

const inputStyle = {
  padding: "0.6rem 0.8rem",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "1rem",
  outline: "none",
  transition: "0.2s",
};

export default ReportIssue;
