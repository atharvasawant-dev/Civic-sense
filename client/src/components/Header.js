import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [role, setRole] = useState(
    localStorage.getItem("userRole") || localStorage.getItem("role")
  );

  useEffect(() => {
    const update = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
      setRole(localStorage.getItem("userRole") || localStorage.getItem("role"));
    };
    window.addEventListener("storage", update);
    update();
    return () => window.removeEventListener("storage", update);
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
      links.push({ to: "/admin", label: "Admin Dashboard" });
    } else {
      links.push({ to: "/report-issue", label: "Report Issue" });
      links.push({ to: "/my-reports", label: "My Reports" });
    }
    links.push({ to: "#", label: "Logout", onClick: handleLogout });
  }

  return (
    <header style={styles.header}>
      <div style={styles.wrap}>
        <div style={styles.brand}>
          <span style={{ fontSize: "1.8rem" }}>🏛️</span>
          <span style={styles.brandText}>Civic Sense</span>
        </div>
        <nav style={styles.nav}>
          {links.map((item) =>
            item.onClick ? (
              <span
                key={item.label}
                onClick={item.onClick}
                style={{
                  ...styles.link,
                  ...(location.pathname === item.to ? styles.active : {}),
                  cursor: "pointer",
                }}
              >
                {item.label}
              </span>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  ...styles.link,
                  ...(location.pathname === item.to ? styles.active : {}),
                }}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
};

const styles = {
  header: {
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  wrap: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0.8rem 1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { display: "flex", alignItems: "center", gap: "0.6rem" },
  brandText: { fontWeight: 700, color: "#1c2a4a", fontSize: "1.1rem" },
  nav: { display: "flex", gap: "1.1rem", alignItems: "center" },
  link: {
    textDecoration: "none",
    color: "#333",
    fontWeight: 500,
    padding: "0.25rem 0.4rem",
  },
  active: {
    color: "#0a6bff",
    borderBottom: "2px solid #0a6bff",
    fontWeight: 600,
  },
};

export default Header;
