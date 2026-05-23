import React from 'react';

const Footer = () => (
  <footer style={styles.footer}>
    <div style={styles.container}>
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
  text: {
    color: "#86868b",
    fontSize: "12px",
    margin: 0,
  }
};

export default Footer;
