import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

export default function ContactPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const themeColors = {
    headerFooterBg: "#3E5F44",
    mainBg: "linear-gradient(135deg, #F4F4F9, #E8FFD7)",
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
        background: themeColors.mainBg,
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
          style={{ display: "flex", gap: "1.8rem", fontSize: "0.9rem" }}
        >
          <Link to="/" style={navBtnStyle}>Home</Link>
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
            <Link to="/blogs" style={navBtnStyle}>Blog</Link>
            <Link to="/contact" style={navBtnStyle}>Contact</Link>
            <Link to="/about" style={navBtnStyle}>About</Link>
          </div>
        )}
      </header>

      {/* Main Content Container */}
      <main
        style={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "2rem 1rem",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: "12px",
            padding: "2rem",
            maxWidth: "700px",
            width: "100%",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <h1 style={{ fontSize: "2.2rem", textAlign: "center" }}>Contact Us</h1>
          <p style={{ textAlign: "center" }}>
            We’d love to hear from you! Reach out to us through any of the ways below.
          </p>

          <div>📧 Email: <a href="mailto:contact@apnablog.com" style={{ color: themeColors.buttonPrimary }}>contact@apnablog.com</a></div>
          <div>📞 Phone: <a href="tel:+919876543210" style={{ color: themeColors.buttonPrimary }}>+91 98765 43210</a></div>
          <div>🌐 Instagram: <a href="https://instagram.com/apnablog" target="_blank" rel="noreferrer" style={{ color: themeColors.buttonPrimary }}>@apnablog</a></div>
          <div>🌐 Twitter: <a href="https://twitter.com/apnablog" target="_blank" rel="noreferrer" style={{ color: themeColors.buttonPrimary }}>@apnablog</a></div>

          <p style={{ textAlign: "center", fontStyle: "italic", marginTop: "1rem" }}>
            We’re here to assist you and welcome your feedback!
          </p>
        </div>
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
        <Link to="/" style={{ textDecoration: "none", color: "#fff" }}>@2025ApnaBlog</Link>
      </footer>

      {/* Responsive CSS */}
      <style>
        {`
          @media (max-width: 768px) {
            .desktop-nav { display: none !important; }
            .hamburger { display: block !important; }
            main div { padding: 1.5rem !important; }
            h1 { font-size: 1.8rem !important; }
            main div div, main div p { font-size: 1rem !important; }
          }
        `}
      </style>
    </div>
  );
}
