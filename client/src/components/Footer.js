import React from 'react';

import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={styles.footer}>
    <div style={styles.container}>
      <div style={styles.links}>
        <Link to="/about" style={styles.link}>About</Link>
        <Link to="/contact" style={styles.link}>Contact</Link>
        <Link to="/issues" style={styles.link}>Public Reports</Link>
      </div>
      <p style={styles.text}>&copy; {new Date().getFullYear()} Civic Sense. Built for a better city.</p>
    </div>
  </footer>
);

const styles = {
  footer: {
    background: "#f5f5f7",
    padding: "40px 20px",
    marginTop: "80px",
    borderTop: "1px solid #d2d2d7",
  },
  container: {
    maxWidth: "1024px",
    margin: "0 auto",
    textAlign: "center",
  },
  links: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "20px",
  },
  link: {
    color: "#515154",
    textDecoration: "none",
    fontSize: "12px",
  },
  text: {
    color: "#86868b",
    fontSize: "12px",
    margin: 0,
  }
};

export default Footer;
