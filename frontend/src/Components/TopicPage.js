import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { FaSun, FaMoon, FaUser, FaBars, FaTimes, FaSearch } from "react-icons/fa";
import PenPopup from "../Components/PenPopup";
import { AuthContext } from "../AuthContext";

function SearchBar({ onSearch, isMobile, toggleMobileSearch }) {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };
  

  if (isMobile) {
    return (
      <div style={{ position: "relative" }}>
        <button
          onClick={toggleMobileSearch}
          style={{ background: "none", border: "none", color: "#fff", fontSize: "1.3rem" }}
        >
          <FaSearch />
        </button>
      </div>
    );
  }

  return (
    <input
      type="text"
      value={query}
      onChange={handleChange}
      placeholder="Search posts..."
      style={{
        width: "250px",
        padding: "0.4rem 0.8rem",
        borderRadius: "20px",
        border: "1px solid #ccc",
        fontSize: "0.95rem",
        transition: "width 0.3s",
      }}
    />
  );
}

export default function TopicPage() {
  const { topic } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState("light");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = mode === "light" ? "#F4F4F9" : "#1C1C1C";
  }, [mode]);

  useEffect(() => {
    const fetchPostsByTopic = async () => {
      try {
        setLoading(true);
        const res = await api.get("/Posts/published");
        const filtered = res.data.filter(
          post =>
            post.contentBlocks?.some(block =>
              block.text?.toLowerCase().includes(topic.toLowerCase())
            ) ||
            post.title.toLowerCase().includes(topic.toLowerCase())
        );
        setPosts(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPostsByTopic();
  }, [topic]);

  const handleSearch = (query) => {
    if (!query) setPosts(posts);
    else setPosts(posts.filter((p) => p.title.toLowerCase().includes(query.toLowerCase())));
  };

  const handlePostClick = (id) => navigate(`/post/${id}`);

  const themeColors = {
    headerFooterBg: mode === "light" ? "#043d1eff" : "#1a1a1a",
    mainBg: mode === "light" ? "linear-gradient(135deg, #F4F4F9, #E8FFD7)" : "#121212",
    cardBg: mode === "light" ? "#FFFFFF" : "#1E1E1E",
    buttonBg: "#1d7c05ff",
    buttonText: "#fff",
    text: mode === "light" ? "#1C1C1C" : "#EEE",
  };

  return (
    <div
      style={{
        fontFamily: "Georgia, serif",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: themeColors.mainBg,
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 1rem", backgroundColor: themeColors.headerFooterBg, color: "#fff", position: "relative", zIndex: 10, flexWrap: "wrap" }}>
        <div style={{ fontWeight: "bold", fontSize: "1.5rem", cursor: "pointer" }} onClick={() => navigate("/home")}>
          ApnaBlog
        </div>

        <div style={{ flex: 1, display: "flex", justifyContent: "center", margin: "0.5rem 0" }}>
          {!isMobile && <SearchBar onSearch={handleSearch} />}
          {isMobile && mobileSearchOpen && <SearchBar onSearch={handleSearch} />}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", position: "relative" }}>
          {!isMobile && user && (
            <button
              onClick={() => navigate("/create-post")}
              style={{ backgroundColor: themeColors.buttonBg, color: themeColors.buttonText, padding: "0.5rem 1rem", borderRadius: "15px", border: "none", cursor: "pointer" }}
            >
              Write
            </button>
          )}
          {isMobile && (
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", color: "#fff", fontSize: "1.5rem" }}>
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          )}

          {menuOpen && (
            <div style={{ position: "absolute", top: "50px", right: 0, backgroundColor: mode === "light" ? "#fff" : "#2b2b2b", color: mode === "light" ? "#1C1C1C" : "#eee", borderRadius: "12px", boxShadow: "0 8px 16px rgba(0,0,0,0.2)", overflow: "hidden", zIndex: 1000, minWidth: "180px", fontSize: "0.95rem" }}>
              <div style={{ padding: "0.7rem 1rem", cursor: "pointer", borderBottom: "1px solid #ccc" }} onClick={() => { if (!user) navigate("/login"); else navigate("/profile"); setMenuOpen(false); }}>
                <FaUser /> Profile
              </div>
              <div style={{ padding: "0.7rem 1rem", cursor: "pointer", borderBottom: "1px solid #ccc", display: "flex", alignItems: "center", gap: "0.5rem" }} onClick={() => { setMode(mode === "light" ? "dark" : "light"); setMenuOpen(false); }}>
                {mode === "light" ? <FaSun /> : <FaMoon />} {mode === "light" ? "Light Mode" : "Dark Mode"}
              </div>
              {user && <div style={{ padding: "0.7rem 1rem", cursor: "pointer" }} onClick={() => { setUser(null); navigate("/login"); setMenuOpen(false); }}>Logout</div>}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", padding: "2rem", flexDirection: "column", gap: "1rem" }}>
        <h2 style={{ color: themeColors.text }}>Posts about #{topic}</h2>
        {loading ? (
          <p style={{ textAlign: "center", color: "#555" }}>Loading posts...</p>
        ) : posts.length === 0 ? (
          <p style={{ textAlign: "center", color: "#555" }}>No posts found.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
            {posts.map((post) => (
              <div key={post.id} onClick={() => handlePostClick(post.id)} style={{ backgroundColor: themeColors.cardBg, padding: "1rem", borderRadius: "15px", cursor: "pointer", boxShadow: "0 6px 16px rgba(0,0,0,0.1)", transition: "transform 0.2s" }}
                   onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                   onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <h4 style={{ color: themeColors.text }}>{post.title}</h4>
                <p style={{ color: "#555" }}>By {post.author?.userName || "Unknown"}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ padding: "1rem 2rem", backgroundColor: themeColors.headerFooterBg, color: "#fff", textAlign: "center", marginTop: "auto" }}>
        © 2025 ApnaBlog
      </footer>

      <PenPopup />
    </div>
  );
}
