import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { FaBars, FaTimes } from "react-icons/fa";

export default function AdminLogin() {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const themeColors = {
    headerFooterBg: "#3E5F44",
    mainBg: "#E8FFD7",
    buttonPrimary: "#5E936C",
    buttonText: "#fff",
    textDark: "#2E2E2E",
    buttonSecondary: "transparent",
  };

  const navBtnStyle = {
    background: themeColors.buttonSecondary,
    border: "none",
    cursor: "pointer",
    fontSize: "0.95rem",
    color: "#fff",
    padding: 0,
    fontFamily: "'Poppins', sans-serif",
  };

  const footerBtnStyle = {
    ...navBtnStyle,
    fontSize: "0.85rem",
    textDecoration: "none",
    fontWeight: "400",
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5096/api/Auth/login",
        { email, password },
        { withCredentials: true }
      );

      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));

      if (res.data.role === "Admin") navigate("/admin-dashboard");
      else if (res.data.role === "Editor") navigate("/editor-dashboard");
      else alert("Unauthorized role");
    } catch (err) {
      alert("Login failed: " + (err.response?.data || err.message));
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Poppins', sans-serif",
        backgroundColor: themeColors.mainBg,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: themeColors.headerFooterBg,
          color: "#fff",
          position: "relative",
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: "1.5rem", cursor: "pointer" }}>
          ApnaBlog <span style={{ fontWeight: "400" }}>Admin</span>
        </div>

        {/* Desktop Links */}
        <div
          className="desktop-nav"
          style={{ display: "flex", gap: "1.8rem", fontSize: "0.9rem" }}
        >
          <button onClick={() => navigate("/")} style={navBtnStyle}>
            Home
          </button>
        </div>

        {/* Hamburger for mobile */}
        <div
          className="hamburger"
          style={{ fontSize: "1.5rem", cursor: "pointer", display: "none" }}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              left: 0,
              backgroundColor: themeColors.headerFooterBg,
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              padding: "1rem 2rem",
              zIndex: 1000,
            }}
          >
            <button onClick={() => navigate("/")} style={navBtnStyle}>
              Home
            </button>
          </div>
        )}
      </nav>

      {/* Login Card */}
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "2rem",
            borderRadius: "10px",
            maxWidth: "400px",
            width: "100%",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ marginBottom: "1.5rem", textAlign: "center", color: themeColors.textDark }}>
            Admin Login
          </h2>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  fontSize: "1rem",
                }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  fontSize: "1rem",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "0.9rem",
                backgroundColor: themeColors.buttonPrimary,
                color: themeColors.buttonText,
                border: "none",
                borderRadius: "6px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Login
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          padding: "1rem 2rem",
          fontSize: "0.85rem",
          color: "#fff",
          backgroundColor: themeColors.headerFooterBg,
          borderTop: "1px solid #ddd",
          display: "flex",
          justifyContent: "center",
          gap: "2rem",
          flexWrap: "wrap",
        }}
      >
        <button onClick={() => navigate("/")} style={footerBtnStyle}>
          Back to Home
        </button>
      </footer>

      {/* Inline responsive styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
        }

        button {
          transition: all 0.2s ease-in-out;
        }
        button:hover {
          opacity: 0.85;
        }
      `}</style>
    </div>
  );
}
