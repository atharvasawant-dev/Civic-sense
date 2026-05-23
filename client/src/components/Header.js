import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);

    const update = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
    };
    window.addEventListener("storage", update);
    update();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener("storage", update);
    };
  }, [location]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  const links = [{ to: "/", label: "Home" }];

  if (!isLoggedIn) {
    links.push({ to: "/register", label: "Register" });
    links.push({ to: "/login", label: "Login" });
  } else {
    if (role === "admin") {
      links.push({ to: "/admin", label: "Admin" });
    } else {
      links.push({ to: "/report-issue", label: "Report Issue" });
      links.push({ to: "/my-reports", label: "My Reports" });
    }
    links.push({ to: "#", label: "Logout", onClick: handleLogout });
  }

  return (
    <header style={styles.header}>
      <nav style={styles.nav}>
        <div style={styles.brand}>
          <Link to="/" style={styles.brandLink} onClick={() => setIsMenuOpen(false)}>
            <span style={{ fontSize: "1.2rem" }}>🏛️</span>
            <span style={styles.brandText}>Civic Sense</span>
          </Link>
        </div>

        {isMobile && (
          <div style={styles.mobileToggle} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div style={{...styles.bar, ...(isMenuOpen ? styles.bar1Active : {})}}></div>
            <div style={{...styles.bar, opacity: isMenuOpen ? 0 : 1}}></div>
            <div style={{...styles.bar, ...(isMenuOpen ? styles.bar2Active : {})}}></div>
          </div>
        )}

        <div style={{
          ...styles.linksContainer,
          ...(isMobile ? (isMenuOpen ? styles.linksContainerMobileActive : styles.linksContainerMobile) : {})
        }}>
          {links.map((item) =>
            item.onClick ? (
              <span
                key={item.label}
                onClick={() => { item.onClick(); setIsMenuOpen(false); }}
                style={isMobile ? styles.linkMobile : styles.link}
              >
                {item.label}
              </span>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsMenuOpen(false)}
                style={{
                  ...(isMobile ? styles.linkMobile : styles.link),
                  ...(location.pathname === item.to ? styles.active : {}),
                }}
              >
                {item.label}
              </Link>
            )
          )}
        </div>
      </nav>
    </header>
  );
};

const styles = {
  header: {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "44px",
    zIndex: 9999,
    borderBottom: "1px solid rgba(0,0,0,0.05)",
  },
  nav: {
    maxWidth: "1024px",
    margin: "0 auto",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 22px",
  },
  brand: {
    display: "flex",
    alignItems: "center",
  },
  brandLink: {
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#1d1d1f",
  },
  brandText: {
    fontWeight: 600,
    fontSize: "17px",
    letterSpacing: "-0.01em",
  },
  linksContainer: {
    display: "flex",
    gap: "30px",
  },
  linksContainerMobile: {
    display: "none",
  },
  linksContainerMobileActive: {
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: "44px",
    left: 0,
    right: 0,
    bottom: 0,
    background: "#ffffff",
    padding: "40px 22px",
    gap: "20px",
    zIndex: 9998,
  },
  mobileToggle: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    cursor: "pointer",
  },
  bar: {
    width: "18px",
    height: "2px",
    background: "#1d1d1f",
    transition: "0.3s",
  },
  bar1Active: {
    transform: "translateY(6px) rotate(45deg)",
  },
  bar2Active: {
    transform: "translateY(-6px) rotate(-45deg)",
  },
  link: {
    textDecoration: "none",
    color: "#1d1d1f",
    fontSize: "12px",
    fontWeight: 400,
    opacity: 0.8,
    transition: "opacity 0.2s ease",
    cursor: "pointer",
  },
  linkMobile: {
    textDecoration: "none",
    color: "#1d1d1f",
    fontSize: "28px",
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "-0.01em",
  },
  active: {
    opacity: 1,
  },
};

export default Header;
