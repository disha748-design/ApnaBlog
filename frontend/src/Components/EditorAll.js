import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../AuthContext";
import { FaEdit, FaTrash, FaSun, FaMoon, FaBars, FaTimes as FaTimesIcon } from "react-icons/fa";

export default function EditorAll() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [mode, setMode] = useState("light");
  const [menuOpen, setMenuOpen] = useState(false);

  const backendBaseUrl = "http://localhost:5096";

  const themeColors = {
    headerFooterBg: mode === "light" ? "#043d1eff" : "#1a1a1a",
    mainBg: mode === "light" ? "linear-gradient(135deg, #F4F4F9, #E8FFD7)" : "#121212",
    cardBg: mode === "light" ? "#FFFFFF" : "#1E1E1E",
    buttonBg: "#1d7c05ff",
    buttonText: "#fff",
    text: mode === "light" ? "#1C1C1C" : "#EEE",
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
    // Call the same endpoint as reject but for delete
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

        <div className="desktop-menu" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button
            onClick={() => setMode(mode === "light" ? "dark" : "light")}
            style={{ background: "none", border: "none", color: "#fff", fontSize: "1.2rem" }}
          >
            {mode === "light" ? <FaSun /> : <FaMoon />}
          </button>
          <button
            onClick={() => navigate("/editor-dashboard")}
            style={{
              backgroundColor: "#3E5F44",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setUser(null);
              navigate("/login");
            }}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}
          >
            Logout
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
            onClick={() => setMode(mode === "light" ? "dark" : "light")}
            style={{ background: "none", border: "none", color: "#fff", fontSize: "1.2rem" }}
          >
            {mode === "light" ? <FaSun /> : <FaMoon />}
          </button>
          <button
            onClick={() => navigate("/editor-dashboard")}
            style={{
              backgroundColor: "#3E5F44",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setUser(null);
              navigate("/login");
            }}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}
          >
            Logout
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
                By <strong>{post.authorUsername}</strong> • {new Date(post.createdAt).toLocaleDateString()}
              </p>
              <p>
                {post.viewsCount || 0} views • {post.likesCount || 0} likes
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
                    backgroundColor: "#F4A261",
                    color: "#fff",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Edit <FaEdit />
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
                  Delete <FaTrash />
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
