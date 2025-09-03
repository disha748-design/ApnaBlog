import React, { useEffect, useState, useContext } from "react";
import api from "../api";
import { AuthContext } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaTimes, FaPen, FaSun, FaMoon, FaBars, FaTimes as FaTimesIcon } from "react-icons/fa";

const EditorDashboard = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("light");
  const [menuOpen, setMenuOpen] = useState(false);

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

  const themeColors = {
    headerFooterBg: mode === "light" ? "#043d1eff" : "#1a1a1a",
    mainBg: mode === "light" ? "linear-gradient(135deg, #F4F4F9, #E8FFD7)" : "#121212",
    cardBg: mode === "light" ? "#FFFFFF" : "#1E1E1E",
    buttonApprove: "#4CAF50",
    buttonReject: "#E63946",
    text: mode === "light" ? "#1C1C1C" : "#EEE",
  };

  const stripHtml = (html) => html.replace(/<[^>]+>/g, "");

  return (
    <div style={{ fontFamily: "Georgia, serif", minHeight: "100vh", display: "flex", flexDirection: "column", background: themeColors.mainBg }}>
      
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 2rem", backgroundColor: themeColors.headerFooterBg, color: "#fff", flexWrap: "wrap" }}>
        <div style={{ fontWeight: "bold", fontSize: "1.5rem", cursor: "pointer" }} onClick={() => navigate("/")}>
          ApnaBlog Editor
        </div>

        {/* Hamburger Menu for Mobile */}
        <div className="desktop-menu" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button onClick={() => setMode(mode === "light" ? "dark" : "light")} style={{ background: "none", border: "none", color: "#fff", fontSize: "1.2rem" }}>
            {mode === "light" ? <FaSun /> : <FaMoon />}
          </button>
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => navigate("/editor-all")}
            style={{
              backgroundColor: "#3E5F44",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
              Go to All Posts
            </button>
          </div>

          <button onClick={() => { setUser(null); navigate("/login"); }} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
            Logout
          </button>
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", color: "#fff", fontSize: "1.5rem", display: "none" }}>
          {menuOpen ? <FaTimesIcon /> : <FaBars />}
        </button>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu" style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem 2rem", backgroundColor: themeColors.headerFooterBg }}>
          <button onClick={() => setMode(mode === "light" ? "dark" : "light")} style={{ background: "none", border: "none", color: "#fff", fontSize: "1.2rem" }}>
            {mode === "light" ? <FaSun /> : <FaMoon />}
          </button>
          <button onClick={() => { setUser(null); navigate("/login"); }} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
            Logout
          </button>
        </div>
      )}

      {/* Main Content */}
      <main style={{ display: "flex", padding: "2rem", gap: "2rem", flexWrap: "wrap", flex: 1 }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          {loading ? (
            <div style={{ textAlign: "center", color: "#555" }}>🌱 Loading pending posts…</div>
          ) : (
            pendingPosts.map((post) => (
              <div key={post.id} style={{ background: themeColors.cardBg, padding: "1rem", marginBottom: "1rem", borderRadius: "12px", boxShadow: "0 6px 16px rgba(0,0,0,0.1)" }}>
                <h3 style={{ color: themeColors.text }}>{post.title}</h3>
                <div style={{ color: "#555", margin: "0.5rem 0" }}>{stripHtml(post.content).substring(0, 120)}...</div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                  <button onClick={() => approvePost(post.id)} style={{ background: themeColors.buttonApprove, color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer" }}>Approve <FaCheck /></button>
                  <button onClick={() => rejectPost(post.id)} style={{ background: themeColors.buttonReject, color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer" }}>Reject <FaTimes /></button>
                  <button onClick={() => navigate(`/editor-edit/${post.id}`)} style={{ background: "#F4A261", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer" }}>
                    Edit <FaPen />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: themeColors.headerFooterBg, color: "#fff", textAlign: "center", padding: "1rem", marginTop: "auto" }}>
        © 2025 ApnaBlog Editor Dashboard
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
};

export default EditorDashboard;
