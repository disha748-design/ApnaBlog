import React, { useEffect, useState, useContext } from "react";
import api from "../api";
import { AuthContext } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaCheck,
  FaTimes,
  FaPen,
  FaBars,
  FaTimes as FaTimesIcon,
  FaTrash,
} from "react-icons/fa";

const EditorDashboard = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        setLoading(true);
        const res = await api.get("/Posts/pending");
        setPendingPosts(res.data);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const approvePost = async (id) => {
    try {
      await api.post(`/Posts/${id}/approve`);
      setPendingPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Error approving post");
    }
  };

  const rejectPost = async (id) => {
    try {
      await api.post(`/Posts/${id}/reject`, { reason: "Does not meet guidelines" });
      setPendingPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Error rejecting post");
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      setActionLoading(true);
      await api.delete(`/Posts/${id}`);
      setPendingPosts((prev) => prev.filter((p) => p.id !== id));
      alert("Post deleted successfully.");
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post.");
    } finally {
      setActionLoading(false);
    }
  };

  const themeColors = {
    headerFooterBg: "#043d1eff",
    mainBg: "linear-gradient(135deg, #F4F4F9, #E8FFD7)",
    cardBg: "#FFFFFF",
    buttonApprove: "#4CAF50",
    buttonReject: "#E63946",
    buttonLogout: "#5E936C", // muted green
    text: "#1C1C1C",
  };

  const stripHtml = (html) => html.replace(/<[^>]+>/g, "");

  return (
    <div
      style={{
        fontFamily: "Georgia, serif",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: themeColors.mainBg,
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2rem",
          backgroundColor: themeColors.headerFooterBg,
          color: "#fff",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{ fontWeight: "bold", fontSize: "1.5rem", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          ApnaBlog Editor
        </div>

        {/* Desktop Menu */}
        <div className="desktop-menu" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button
            onClick={() => navigate("/editor-all")}
            style={{
              backgroundColor: themeColors.buttonLogout,
              color: "#fff",
              padding: "6px 12px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            All Posts
          </button>

          <button
            onClick={() => {
              setUser(null);
              navigate("/login");
            }}
            style={{
              backgroundColor: themeColors.buttonLogout,
              color: "#fff",
              padding: "6px 12px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>

        {/* Hamburger Button */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: "1.8rem",
            cursor: "pointer",
            display: "none",
          }}
        >
          {menuOpen ? <FaTimesIcon /> : <FaBars />}
        </button>
      </header>

      {/* Mobile Menu */}
      <div
        className={`mobile-menu ${menuOpen ? "open" : ""}`}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.8rem",
          padding: menuOpen ? "1rem 1.5rem" : "0 1.5rem",
          backgroundColor: themeColors.headerFooterBg,
          overflow: "hidden",
          maxHeight: menuOpen ? "500px" : "0",
          transition: "max-height 0.4s ease, padding 0.4s ease",
        }}
      >
        <button
          onClick={() => {
            navigate("/editor-all");
            setMenuOpen(false);
          }}
          style={{
            backgroundColor: themeColors.buttonLogout,
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          All Posts
        </button>

        <button
          onClick={() => {
            setUser(null);
            navigate("/login");
            setMenuOpen(false);
          }}
          style={{
            backgroundColor: themeColors.buttonLogout,
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <main style={{ display: "flex", flexDirection: "column", padding: "2rem", gap: "1rem", flex: 1 }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#555" }}>🌱 Loading pending posts…</div>
        ) : pendingPosts.length === 0 ? (
          <p style={{ textAlign: "center", color: themeColors.text }}>No pending posts.</p>
        ) : (
          pendingPosts.map((post) => (
            <div
              key={post.id}
              style={{
                background: themeColors.cardBg,
                padding: "1rem",
                borderRadius: "12px",
                boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ color: themeColors.text }}>{post.title}</h3>
              <p style={{ color: "#555", margin: "0.5rem 0" }}>
                {stripHtml(post.content).substring(0, 120)}...
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
                <button
                  onClick={() => approvePost(post.id)}
                  style={{
                    background: themeColors.buttonApprove,
                    color: "#fff",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <FaCheck /> Approve
                </button>
                <button
                  onClick={() => rejectPost(post.id)}
                  style={{
                    background: themeColors.buttonReject,
                    color: "#fff",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <FaTimes /> Reject
                </button>
                <button
                  onClick={() => navigate(`/editor-edit/${post.id}`)}
                  style={{
                    background: "#F4A261",
                    color: "#fff",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <FaPen /> Edit
                </button>
                <button
                  onClick={() => deletePost(post.id)}
                  disabled={actionLoading}
                  style={{
                    background: "#E63946",
                    color: "#fff",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: themeColors.headerFooterBg,
          color: "#fff",
          textAlign: "center",
          padding: "1rem",
          marginTop: "auto",
        }}
      >
        © 2025 ApnaBlog Editor Dashboard
      </footer>

      {/* Responsive CSS */}
      <style>
        {`
          @media (max-width: 768px) {
            .desktop-menu {
              display: none;
            }
            .hamburger {
              display: block;
            }
          }
        `}
      </style>
    </div>
  );
};

export default EditorDashboard;
