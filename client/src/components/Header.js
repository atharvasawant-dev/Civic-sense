// client/src/components/Header.js
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [userName, setUserName] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const updateAuth = () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    setRole(localStorage.getItem("role"));
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      setUserName(u.name || "");
    } catch (e) {
      setUserName("");
    }
  };

  const fetchUnread = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      // Ignore background notification fetch errors
    }
  };

  useEffect(() => {
    updateAuth();
    fetchUnread();
    setDrawerOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setRole(null);
    setDrawerOpen(false);
    navigate("/");
    window.location.reload();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/");
    }
  };

  const navItems = [
    { to: "/", label: "Civic Feed", icon: "🏛️" },
    { to: "/popular", label: "Popular", icon: "🔥" },
    { to: "/report-issue", label: "Report Issue", icon: "➕", requiresAuth: true },
    { to: "/my-reports", label: "My Reports", icon: "📋", requiresAuth: true },
    { to: "/my-activity", label: "My Activity", icon: "⚡", requiresAuth: true },
    {
      to: "/notifications",
      label: "Notifications",
      icon: "🔔",
      requiresAuth: true,
      badge: unreadCount,
    },
    { to: "/profile", label: "Profile & Karma", icon: "👤", requiresAuth: true },
    { to: "/admin", label: "Admin Dashboard", icon: "🛠️", requiresAdmin: true },
    { to: "/about", label: "About Civic Sense", icon: "ℹ️" },
    { to: "/contact", label: "Helpline & Contact", icon: "📞" },
  ];

  return (
    <>
      {/* Top Header Bar */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "54px",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #edeff1",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          gap: "8px",
          boxSizing: "border-box",
        }}
      >
        {/* Left: Hamburger & Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label="Open Navigation Drawer"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              padding: "6px",
              minWidth: "40px",
              minHeight: "40px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1c1c1c",
            }}
          >
            ☰
          </button>

          <Link
            to="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#1c1c1c",
            }}
          >
            <span style={{ fontSize: "22px" }}>🏛️</span>
            <div style={{ display: "flex", flexDirection: "column" }} className="header-brand-name">
              <span className="header-brand-text" style={{ fontWeight: "700", fontSize: "15px", letterSpacing: "-0.02em" }}>
                Civic<span style={{ color: "#ff4500" }}>Sense</span>
              </span>
              <span className="brand-subtitle" style={{ fontSize: "10px", color: "#787c7e", marginTop: "-2px" }}>
                Public Accountability
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="search-form-header"
          style={{
            flex: 1,
            maxWidth: "520px",
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            position: "relative",
            margin: 0,
          }}
        >
          <input
            type="text"
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              height: "36px",
              minHeight: "36px",
              margin: 0,
              padding: "0 10px 0 30px",
              borderRadius: "999px",
              backgroundColor: "#f6f7f8",
              border: "1px solid #edeff1",
              fontSize: "13px",
              outline: "none",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = "#ffffff";
              e.target.style.borderColor = "#0071e3";
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = "#f6f7f8";
              e.target.style.borderColor = "#edeff1";
            }}
          />
          <span
            style={{
              position: "absolute",
              left: "10px",
              color: "#878a8c",
              fontSize: "12px",
              pointerEvents: "none",
            }}
          >
            🔍
          </span>
        </form>

        {/* Right: Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          {isLoggedIn ? (
            <>
              {/* Notifications Icon with Badge */}
              <Link
                to="/notifications"
                title="Notifications"
                style={{
                  position: "relative",
                  textDecoration: "none",
                  padding: "6px",
                  borderRadius: "6px",
                  fontSize: "18px",
                  minWidth: "38px",
                  minHeight: "38px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: location.pathname === "/notifications" ? "#ff4500" : "#1c1c1c",
                }}
              >
                🔔
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "2px",
                      backgroundColor: "#ff4500",
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: "700",
                      borderRadius: "999px",
                      padding: "1px 5px",
                      lineHeight: "1",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* Desktop-only action items */}
              <div className="header-desktop-actions" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Link
                  to="/report-issue"
                  className="btn btn-primary"
                  style={{
                    backgroundColor: "#ff4500",
                    padding: "6px 14px",
                    fontSize: "13px",
                    fontWeight: "600",
                    minHeight: "32px",
                  }}
                >
                  <span>➕</span> Report
                </Link>

                <Link
                  to="/profile"
                  style={{
                    textDecoration: "none",
                    backgroundColor: "#f6f7f8",
                    padding: "6px 12px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#1c1c1c",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    border: "1px solid #edeff1",
                    minHeight: "32px",
                  }}
                >
                  <span>👤</span>
                  <span style={{ maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {userName || "Profile"}
                  </span>
                </Link>
              </div>
            </>
          ) : (
            <div className="header-desktop-actions" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Link
                to="/login"
                style={{
                  textDecoration: "none",
                  color: "#0071e3",
                  fontSize: "13px",
                  fontWeight: "600",
                  padding: "6px 12px",
                }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
                style={{
                  padding: "6px 14px",
                  fontSize: "13px",
                  fontWeight: "600",
                  minHeight: "32px",
                }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Slide-out Navigation Drawer Backdrop */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 1100,
            transition: "opacity 0.2s ease",
          }}
        />
      )}

      {/* Slide-out Navigation Drawer */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "min(280px, 85vw)",
          backgroundColor: "#ffffff",
          zIndex: 1200,
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: drawerOpen ? "4px 0 16px rgba(0,0,0,0.15)" : "none",
          display: "flex",
          flexDirection: "column",
          padding: "20px 16px",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "22px" }}>🏛️</span>
            <span style={{ fontWeight: "700", fontSize: "16px" }}>Civic Navigation</span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
              minWidth: "40px",
              minHeight: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
            }}
          >
            ✕
          </button>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item) => {
            if (item.requiresAuth && !isLoggedIn) return null;
            if (item.requiresAdmin && role !== "admin") return null;

            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setDrawerOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: isActive ? "600" : "500",
                  color: isActive ? "#ff4500" : "#1c1c1c",
                  backgroundColor: isActive ? "#ffefe6" : "transparent",
                  transition: "background-color 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span
                    style={{
                      backgroundColor: "#ff4500",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "2px 6px",
                      borderRadius: "999px",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              style={{
                marginTop: "16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                color: "#d32f2f",
                width: "100%",
                textAlign: "left",
              }}
            >
              <span>🚪</span>
              <span>Log Out</span>
            </button>
          ) : (
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link
                to="/login"
                onClick={() => setDrawerOpen(false)}
                className="btn btn-secondary"
                style={{ textAlign: "center", width: "100%" }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setDrawerOpen(false)}
                className="btn btn-primary"
                style={{ textAlign: "center", width: "100%" }}
              >
                Create Account
              </Link>
            </div>
          )}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation Bar (Phones only, sticky bottom) */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "56px",
          backgroundColor: "#ffffff",
          borderTop: "1px solid #edeff1",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "space-around",
          zIndex: 1000,
          boxSizing: "border-box",
          paddingBottom: "max(2px, env(safe-area-inset-bottom, 2px))",
        }}
        className="mobile-bottom-nav"
      >
        <Link
          to="/"
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            color: location.pathname === "/" ? "#ff4500" : "#787c7e",
            fontSize: "11px",
            fontWeight: "600",
            padding: "4px 0",
          }}
        >
          <span style={{ fontSize: "18px" }}>🏛️</span>
          <span>Feed</span>
        </Link>

        <Link
          to="/popular"
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            color: location.pathname === "/popular" ? "#ff4500" : "#787c7e",
            fontSize: "11px",
            fontWeight: "600",
            padding: "4px 0",
          }}
        >
          <span style={{ fontSize: "18px" }}>🔥</span>
          <span>Popular</span>
        </Link>

        <Link
          to="/report-issue"
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            color: "#ff4500",
            fontSize: "11px",
            fontWeight: "700",
            padding: "4px 0",
          }}
        >
          <span style={{ fontSize: "20px" }}>➕</span>
          <span>Report</span>
        </Link>

        <Link
          to="/notifications"
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            color: location.pathname === "/notifications" ? "#ff4500" : "#787c7e",
            fontSize: "11px",
            fontWeight: "600",
            position: "relative",
            padding: "4px 0",
          }}
        >
          <span style={{ fontSize: "18px" }}>🔔</span>
          <span>Alerts</span>
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "2px",
                right: "12px",
                backgroundColor: "#ff4500",
                color: "#fff",
                borderRadius: "999px",
                fontSize: "9px",
                padding: "1px 4px",
                fontWeight: "700",
              }}
            >
              {unreadCount}
            </span>
          )}
        </Link>

        <Link
          to={isLoggedIn ? "/profile" : "/login"}
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            color: location.pathname === "/profile" ? "#ff4500" : "#787c7e",
            fontSize: "11px",
            fontWeight: "600",
            padding: "4px 0",
          }}
        >
          <span style={{ fontSize: "18px" }}>👤</span>
          <span>{isLoggedIn ? "You" : "Login"}</span>
        </Link>
      </nav>
    </>
  );
};

export default Header;
