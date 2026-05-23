import React from 'react';

const About = () => (
  <div className="page-container">
    <h2 style={{ fontSize: "40px", fontWeight: "600", marginBottom: "8px" }}>About Civic Sense</h2>
    <p style={{ color: "#86868b", fontSize: "21px", marginBottom: "40px" }}>Empowering citizens to participate in their city's development.</p>

    <div className="card">
      <h3 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "16px" }}>Our Mission</h3>
      <p style={{ fontSize: "17px", color: "#3c3c43", lineHeight: 1.5, marginBottom: "24px" }}>
        Civic Sense is a platform designed to bridge the gap between citizens and local authorities.
        We believe that every resident has the right to live in a well-maintained, clean, and safe environment,
        and the responsibility to contribute to its upkeep.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginTop: '40px' }}>
        <div>
          <h4 style={{ fontSize: '19px', fontWeight: '600', marginBottom: '12px' }}>Transparency</h4>
          <p style={{ fontSize: '15px', color: '#86868b', lineHeight: 1.4 }}>Track the real-time status of your reported issues and see how local authorities respond.</p>
        </div>
        <div>
          <h4 style={{ fontSize: '19px', fontWeight: '600', marginBottom: '12px' }}>Accountability</h4>
          <p style={{ fontSize: '15px', color: '#86868b', lineHeight: 1.4 }}>Ensure that grievances are addressed promptly and effectively by the relevant departments.</p>
        </div>
        <div>
          <h4 style={{ fontSize: '19px', fontWeight: '600', marginBottom: '12px' }}>Community</h4>
          <p style={{ fontSize: '15px', color: '#86868b', lineHeight: 1.4 }}>Join a growing network of active citizens working together for a better city.</p>
        </div>
      </div>
    </div>
  </div>
);

export default About;
