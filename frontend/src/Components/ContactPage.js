import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const ContactPage = () => {
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
        <div
          style={{ fontWeight: "bold", fontSize: "1.5rem", cursor: "pointer" }}
        >
          ApnaBlog
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
          <Link to="/" style={navBtnStyle}>
            Home
          </Link>
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
            <Link to="/" style={navBtnStyle}>
              Home
            </Link>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div
        style={{
          flexGrow: 1,
          maxWidth: "600px",
          margin: "2rem auto",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          fontSize: "1.1rem",
          color: themeColors.textDark,
        }}
      >
        <h1 style={{ fontSize: "2.5rem", textAlign: "center" }}>
          Contact Us
        </h1>
        <p style={{ textAlign: "center" }}>
          We’d love to hear from you! Reach out to us through any of the ways below.
        </p>

        <div>
          📧 Email:{" "}
          <a
            href="mailto:contact@apnablog.com"
            style={{ color: themeColors.buttonPrimary }}
          >
            contact@apnablog.com
          </a>
        </div>
        <div>
          📞 Phone:{" "}
          <a
            href="tel:+919876543210"
            style={{ color: themeColors.buttonPrimary }}
          >
            +91 98765 43210
          </a>
        </div>
        <div>
          🌐 Instagram:{" "}
          <a
            href="https://instagram.com/apnablog"
            target="_blank"
            rel="noreferrer"
            style={{ color: themeColors.buttonPrimary }}
          >
            @apnablog
          </a>
        </div>
        <div>
          🌐 Twitter:{" "}
          <a
            href="https://twitter.com/apnablog"
            target="_blank"
            rel="noreferrer"
            style={{ color: themeColors.buttonPrimary }}
          >
            @apnablog
          </a>
        </div>
      </div>

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
        <Link to="/" style={{ textDecoration: "none", color: "#fff" }}>
          Home
        </Link>
        <Link to="/blogs" style={{ textDecoration: "none", color: "#fff" }}>
          Blog
        </Link>
        <Link to="/terms" style={{ textDecoration: "none", color: "#fff" }}>
          Terms & Privacy
        </Link>
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
          }
        `}
      </style>
    </div>
  );
};

export default ContactPage;
