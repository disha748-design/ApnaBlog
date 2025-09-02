import React, { useState } from "react";
import AuthModal from "./Components/AuthModal";
import UserEditorAuthModal from "./Components/UserEditorAuthModal";
import { useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const LandingPage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showUserEditorModal, setShowUserEditorModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

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
    textDecoration: "none", // removed underline
    fontWeight: "400",
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
          <button
            onClick={handleOpenModal}
            style={{ ...navBtnStyle, fontSize: "1.5rem", fontWeight: "700" }}
          >
            ApnaBlog
          </button>
        </div>

        {/* Desktop Links */}
        <div
          className="desktop-nav"
          style={{ display: "flex", gap: "1.8rem", fontSize: "0.9rem" }}
        >
          <button onClick={handleOpenModal} style={navBtnStyle}>Read</button>
          <button onClick={handleOpenModal} style={navBtnStyle}>Write</button>
          <button onClick={handleOpenModal} style={navBtnStyle}>Sign in</button>
          <button onClick={handleOpenModal} style={navBtnStyle}>Home</button>
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
            <button onClick={handleOpenModal} style={navBtnStyle}>Read</button>
            <button onClick={handleOpenModal} style={navBtnStyle}>Write</button>
            <button onClick={handleOpenModal} style={navBtnStyle}>Sign in</button>
            <button onClick={handleOpenModal} style={navBtnStyle}>Home</button>
          </div>
        )}
      </nav>

      {/* Main content */}
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          padding: "2rem",
          gap: "3rem",
          flexWrap: "wrap",
        }}
      >
        {/* Left text */}
        <div style={{ maxWidth: "600px", flex: 1 }}>
          <h1
            style={{
              fontSize: "3rem",
              lineHeight: "1.2",
              marginBottom: "1rem",
              fontWeight: "700",
              fontFamily: "'Georgia', serif",
              color: themeColors.textDark,
            }}
          >
            Stories <br /> that spark change
          </h1>
          <p
            style={{
              fontSize: "1.2rem",
              marginBottom: "2.5rem",
              color: themeColors.textDark,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Read. Write. Connect. Turn your thoughts into impact and be part of
            a community that cares.
          </p>

          {/* Get Started Button opens UserEditorAuthModal */}
          <button
            onClick={() => setShowUserEditorModal(true)}
            style={{
              backgroundColor: themeColors.buttonPrimary,
              color: themeColors.buttonText,
              padding: "0.75rem 2rem",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: "600",
            }}
          >
            Get Started
          </button>
        </div>

        {/* Right illustration */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <img
            src="/ApnaBlogImg.png"
            alt="Creative Illustration"
            style={{ maxWidth: "100%", height: "auto" }}
          />
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
        <button onClick={handleOpenModal} style={footerBtnStyle}>About</button>
        <button onClick={handleOpenModal} style={footerBtnStyle}>Contact</button>
        <button onClick={handleOpenModal} style={footerBtnStyle}>Terms & Privacy</button>
        <button onClick={() => navigate("/admin-login")} style={footerBtnStyle}>
          Admin Portal
        </button>
      </footer>

      {/* Modals */}
      {showModal && <AuthModal onClose={handleCloseModal} />}
      {showUserEditorModal && (
        <UserEditorAuthModal onClose={() => setShowUserEditorModal(false)} />
      )}

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
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
