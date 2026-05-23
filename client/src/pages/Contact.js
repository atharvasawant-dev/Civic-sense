import React from 'react';

const Contact = () => (
  <div className="page-container">
    <h2 style={{ fontSize: "40px", fontWeight: "600", marginBottom: "8px" }}>Contact Us</h2>
    <p style={{ color: "#86868b", fontSize: "21px", marginBottom: "40px" }}>We're here to help and listen.</p>

    <div className="card" style={{ maxWidth: '600px' }}>
      <h3 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "24px" }}>Get in Touch</h3>

      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '14px', fontWeight: '500', color: '#86868b', marginBottom: '4px' }}>Email</p>
        <a href="mailto:support@civicsense.app" style={{ fontSize: '19px', color: '#0071e3', textDecoration: 'none' }}>support@civicsense.app</a>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '14px', fontWeight: '500', color: '#86868b', marginBottom: '4px' }}>Helpline</p>
        <p style={{ fontSize: '19px', color: '#1d1d1f' }}>+91-98765-43210</p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '14px', fontWeight: '500', color: '#86868b', marginBottom: '4px' }}>Office Hours</p>
        <p style={{ fontSize: '17px', color: '#1d1d1f' }}>Monday – Saturday, 9:30 AM – 6 PM</p>
      </div>

      <div style={{ padding: '24px', background: '#f5f5f7', borderRadius: '12px' }}>
        <p style={{ fontSize: '15px', color: '#3c3c43', margin: 0 }}>
          Your feedback helps us improve the platform. If you have any suggestions or encounter any issues, please don't hesitate to reach out.
        </p>
      </div>
    </div>
  </div>
);

export default Contact;
