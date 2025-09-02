import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PenPopup() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate(); // 👈 React Router hook

  return (
    <>
      {/* Floating Pen */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#5E936C",
          color: "#fff",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.8rem",
          cursor: "pointer",
          boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
          animation: "bounce 2s infinite",
          zIndex: 2000,
        }}
        title="Click me!"
      >
        ✏️
      </div>

      {/* Pop-up Card */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "260px",
            backgroundColor: "#fff",
            color: "#3E5F44",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            padding: "1rem",
            zIndex: 2000,
            opacity: open ? 1 : 0,
            transform: open ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Quick Tip!</strong>
            <span
              style={{ cursor: "pointer", fontSize: "1.2rem" }}
              onClick={() => setOpen(false)}
            >
              ×
            </span>
          </div>
          <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", lineHeight: "1.3rem" }}>
            Start writing your story now! Your first blog could inspire thousands. ✍️
          </p>
          <button
            style={{
              marginTop: "0.5rem",
              backgroundColor: "#3E5F44",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "0.4rem 0.8rem",
              cursor: "pointer",
              fontSize: "0.9rem",
              width: "100%",
              transition: "background-color 0.2s",
            }}
            onClick={() => {
              setOpen(false);
              navigate("/create-post"); // 👈 smooth navigation
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#5E936C")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3E5F44")}
          >
            Write Now
          </button>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @media (max-width: 600px) {
          div[title="Click me!"] {
            width: 50px;
            height: 50px;
            font-size: 1.5rem;
            bottom: 15px;
            right: 15px;
          }

          div[style*="width: 260px"] {
            width: 220px;
            right: 15px;
            bottom: 75px;
          }
        }
      `}</style>
    </>
  );
}
