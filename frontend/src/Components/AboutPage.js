import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

export default function AboutPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const themeColors = {
    headerFooterBg: "#3E5F44",
    mainBg: "#E8FFD7",
    textDark: "#2E2E2E",
    buttonPrimary: "#5E936C",
    buttonText: "#fff",
  };

  const navBtnStyle = {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "0.9rem",
    color: "#fff",
    padding: 0,
    textDecoration: "none",
  };

  return (
    <div
      style={{
        fontFamily: "'Georgia', serif",
        backgroundColor: themeColors.mainBg,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header / Navbar */}
      <header
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
          <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
            ApnaBlog
          </Link>
        </div>

        {/* Desktop Links */}
        <div
          className="desktop-nav"
          style={{
            display: "flex",
            gap: "1.8rem",
            fontSize: "0.9rem",
          }}
        >
          <Link to="/" style={navBtnStyle}>Home</Link>
        </div>

        {/* Hamburger for mobile */}
        <div
          className="hamburger"
          style={{
            fontSize: "1.5rem",
            cursor: "pointer",
            display: "none",
          }}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="mobile-menu"
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
            <Link to="/" style={navBtnStyle}>Home</Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main
        style={{
          flexGrow: 1,
          width: "90%",
          maxWidth: "700px",
          margin: "2rem auto",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          fontSize: "1.1rem",
          color: themeColors.textDark,
        }}
      >
        <h1 style={{ fontSize: "2rem", textAlign: "center" }}>About ApnaBlog</h1>
        <p>
          Welcome to <strong>ApnaBlog</strong>, your personal space to share ideas, stories,
          tutorials, and experiences with a global audience. Our mission is to empower writers
          and creators to publish effortlessly and connect with readers worldwide.
        </p>
        <p>
          On ApnaBlog, you can create posts, explore trending topics, follow other writers,
          and engage in discussions through comments and likes.
        </p>
        <p>
          Our team is dedicated to providing a clean, modern, and user-friendly blogging
          platform that values creativity, freedom of expression, and community engagement.
        </p>
      </main>

      {/* Footer */}
      <footer
        style={{
          marginTop: "auto",
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
        <Link to="/" style={{ textDecoration: "none", color: "#fff" }}>Home</Link>
        <Link to="/blogs" style={{ textDecoration: "none", color: "#fff" }}>Blog</Link>
        <Link to="/contact" style={{ textDecoration: "none", color: "#fff" }}>Contact</Link>
      </footer>

      {/* Responsive CSS */}
      <style>
        {`
          @media (max-width: 768px) {
            .desktop-nav {
              display: none !important;
            }
            .hamburger {
              display: block !important;
            }
            main {
              font-size: 1rem;
              width: 95% !important;
              margin: 1rem auto !important;
            }
          }
        `}
      </style>
    </div>
  );
}
