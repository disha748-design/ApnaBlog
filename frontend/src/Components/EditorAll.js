import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../AuthContext";
import { FaEdit, FaTrash, FaBars, FaTimes as FaTimesIcon } from "react-icons/fa";

export default function EditorAll() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const backendBaseUrl = "http://localhost:5096";

  const themeColors = {
    headerFooterBg: "#043d1eff",
    mainBg: "linear-gradient(135deg, #F4F4F9, #E8FFD7)",
    cardBg: "#FFFFFF",
    buttonBg: "#5E936C",
    buttonText: "#fff",
    text: "#1C1C1C",
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/Posts/published", { withCredentials: true });
      setPosts(res.data || []);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      alert("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleEdit = (id) => {
    navigate(`/editor-edit/${id}`); // go to EditorEditPost.js
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setActionLoading(true);
    try {
      await api.post(`/Posts/${id}/reject`, { reason: "Deleted by editor" });
      alert("Post deleted.");
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Failed to delete post.");
    } finally {
      setActionLoading(false);
    }
  };

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
          fontFamily: "Georgia, serif",
          fontSize: "1.5rem",
          backgroundColor: themeColors.headerFooterBg,
          color: "#fff",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{ fontWeight: "bold", fontSize: "1.5rem", cursor: "pointer" }}
        >
          ApnaBlog Editor
        </div>

        <div className="desktop-menu" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button
            onClick={() => navigate("/editor-dashboard")}
            style={{
              backgroundColor: themeColors.buttonBg,
              color: "#fff",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Dashboard
          </button>
        </div>

        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: "none", border: "none", color: "#fff", fontSize: "1.5rem", display: "none" }}
        >
          {menuOpen ? <FaTimesIcon /> : <FaBars />}
        </button>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="mobile-menu"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            padding: "1rem 2rem",
            backgroundColor: themeColors.headerFooterBg,
          }}
        >
          <button
            onClick={() => navigate("/editor-dashboard")}
            style={{
              backgroundColor: themeColors.buttonBg,
              color: "#fff",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Dashboard
          </button>
        </div>
      )}

      {/* Main Content */}
      <main style={{ display: "flex", flexDirection: "column", padding: "2rem", gap: "2rem", flex: 1 }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#555" }}>🌱 Loading posts…</div>
        ) : posts.length === 0 ? (
          <p style={{ textAlign: "center", color: themeColors.text }}>No posts found.</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              style={{
                background: themeColors.cardBg,
                padding: "1rem",
                marginBottom: "1rem",
                borderRadius: "12px",
                boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                color: themeColors.text,
              }}
            >
              <h3>{post.title}</h3>
              <p>
            By{" "}
              {post.authorUsername || post.author?.userName || post.user?.username || "Anonymous"}
            {" "}
          </p>
           <p>
              <strong>{post.authorUsername}</strong>  {new Date(post.createdAt).toLocaleDateString()}
              </p>
              {post.images?.[0] && (
                <img
                  src={post.images[0].url.startsWith("http") ? post.images[0].url : `${backendBaseUrl}/${post.images[0].url}`}
                  alt="Post"
                  style={{ width: "200px", maxHeight: "150px", objectFit: "cover", marginTop: "8px", borderRadius: "8px" }}
                />
              )}

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                <button
                  onClick={() => handleEdit(post.id)}
                  disabled={actionLoading}
                  style={{
                    backgroundColor: "#5E936C",
                    color: "#fff",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  disabled={actionLoading}
                  style={{
                    backgroundColor: "#E63946",
                    color: "#fff",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                <FaTrash />
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
        © 2025 ApnaBlog Editor
      </footer>

      {/* Responsive styles */}
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
}
