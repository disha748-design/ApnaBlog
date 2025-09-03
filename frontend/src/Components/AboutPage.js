import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

export default function AboutPage() {
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
            maxWidth: "800px",
            width: "100%",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <h1 style={{ fontSize: "2.2rem", textAlign: "center" }}>About ApnaBlog</h1>
          <p>
            Welcome to <strong>ApnaBlog</strong>, a vibrant space for writers, creators, and thinkers.
            Our platform allows anyone to share their ideas, tutorials, stories, and experiences with a global audience.
          </p>
          <p>
            <strong>Mission:</strong> To empower creators by providing a simple, beautiful, and user-friendly platform that encourages storytelling and learning. We believe every voice matters.
          </p>
          <p>
            <strong>Features:</strong> Create posts, explore trending topics, follow your favorite authors, and engage in discussions through comments and likes. Our platform supports rich content including images, code snippets, and videos.
          </p>
          <p>
            <strong>Community:</strong> ApnaBlog is more than just a blog; it’s a community where creators can learn, grow, and inspire each other. We moderate responsibly to maintain a safe and positive environment.
          </p>
          <p>
            <strong>Vision:</strong> We envision a world where everyone can express themselves freely and connect meaningfully with readers and other creators. Whether you’re a seasoned writer or just starting, ApnaBlog is your stage.
          </p>
          <p style={{ fontStyle: "italic", textAlign: "center", marginTop: "1rem" }}>
            Join us today and turn your stories into inspiration!
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
            .desktop-nav {
              display: none !important;
            }
            .hamburger {
              display: block !important;
            }
            main div {
              padding: 1.5rem !important;
            }
            h1 {
              font-size: 1.8rem !important;
            }
            main div p {
              font-size: 1rem !important;
            }
          }
        `}
      </style>
    </div>
  );
}
