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
    mainBg: "linear-gradient(135deg, #F4F4F9, #E8FFD7)",
    buttonPrimary: "#5E936C",
    buttonText: "#fff",
    textDark: "#2E2E2E",
    buttonSecondary: "transparent",
  };

  const navBtnStyle = {
    background: themeColors.buttonSecondary,
    border: "none",
    cursor: "pointer",
    color: "#fff",
    padding: 0,
    fontFamily: "Georgia, serif",
    textDecoration: "none",
  };

  const footerBtnStyle = {
    ...navBtnStyle,
    fontSize: "0.85rem",
    fontWeight: "400",
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5096/api/Auth/admin-login",
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
        fontFamily: "Georgia, serif",
        background: themeColors.mainBg,
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

        <div
          className="desktop-nav"
          style={{ display: "flex", gap: "1.8rem", fontSize: "1rem" }}
        >
          <button onClick={() => navigate("/")} style={navBtnStyle}>
            Home
          </button>
        </div>

        <div
          className="hamburger"
          style={{ fontSize: "1.5rem", cursor: "pointer", display: "none" }}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

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
      <main
        style={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem 1rem",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.95)",
            padding: "3rem 2.5rem",
            borderRadius: "15px",
            maxWidth: "420px",
            width: "100%",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <h2
            style={{
              marginBottom: "1.5rem",
              textAlign: "center",
              color: themeColors.textDark,
              fontSize: "2rem",
            }}
          >
            Admin Login
          </h2>

          {/* Role info */}
          <div
            style={{
              marginBottom: "1rem",
              textAlign: "center",
              fontSize: "0.95rem",
              color: "#555",
            }}
          >
            ⚠️ Only <strong>Admin</strong> can login here.
          </div>

          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Email</label>
              <input
                type="email"
                placeholder="Enter your admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  fontSize: "1rem",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  fontSize: "1rem",
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "0.85rem",
                backgroundColor: themeColors.buttonPrimary,
                color: themeColors.buttonText,
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Login
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: "1rem 2rem",
          fontSize: "0.85rem",
          color: "#fff",
          backgroundColor: themeColors.headerFooterBg,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button onClick={() => navigate("/")} style={footerBtnStyle}>
          @2025ApnaBlog
        </button>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
        }
      `}</style>
    </div>
  );
}
