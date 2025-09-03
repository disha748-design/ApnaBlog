import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

export default function TermsPage() {
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
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: themeColors.mainBg,
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
          display: "flex",
          justifyContent: "center",
          padding: "2rem 1rem",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            width: "100%",
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "2rem",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h1 style={{ marginBottom: "1rem", textAlign: "center" }}>Terms of Service</h1>
          <p style={{ marginBottom: "1.5rem", lineHeight: "1.6" }}>
            By using ApnaBlog, you agree to our Terms of Service. Please read them carefully
            before creating an account or publishing content.
          </p>

          <section style={{ marginBottom: "1.5rem" }}>
            <h3>User Responsibilities</h3>
            <p style={{ lineHeight: "1.6" }}>
              Users are responsible for their content. Do not post offensive, illegal, or
              copyrighted material without permission.
            </p>
          </section>

          <section style={{ marginBottom: "1.5rem" }}>
            <h3>Account Security</h3>
            <p style={{ lineHeight: "1.6" }}>
              Protect your login credentials. You are responsible for all activity under your
              account.
            </p>
          </section>

          <section style={{ marginBottom: "1.5rem" }}>
            <h3>Content Usage</h3>
            <p style={{ lineHeight: "1.6" }}>
              ApnaBlog respects your ownership of content. By posting, you grant us a license to
              display your content within the platform.
            </p>
          </section>

          <section>
            <h3>Modifications</h3>
            <p style={{ lineHeight: "1.6" }}>
              We may update these terms periodically. Users are encouraged to review them
              regularly.
            </p>
          </section>
        </div>
      </main>

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
          }
        `}
      </style>
    </div>
  );
}
