import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { FaSun, FaMoon, FaUser, FaBars, FaTimes, FaSearch, FaRegEdit } from "react-icons/fa";

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

export default function MyPosts() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
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

  // Fetch user's posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get("/Posts/my-posts");
        setPosts(res.data);
        setFilteredPosts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const themeColors = {
    headerFooterBg: mode === "light" ? "#043d1eff" : "#1a1a1a",
    mainBg: mode === "light" ? "linear-gradient(135deg, #F4F4F9, #E8FFD7)" : "#121212",
    cardBg: mode === "light" ? "#FFFFFF" : "#1E1E1E",
    buttonBg: "#1d7c05ff",
    buttonText: "#fff",
    text: mode === "light" ? "#1C1C1C" : "#EEE",
  };

  const handleSearch = (query) => {
    if (!query) setFilteredPosts(posts);
    else setFilteredPosts(posts.filter((p) => p.title.toLowerCase().includes(query.toLowerCase())));
  };

  const handlePostClick = (id) => navigate(`/post/${id}`);

  // Split posts by status
  const drafts = filteredPosts.filter(p => p.status === 0);
  const pending = filteredPosts.filter(p => p.status === 1);
  const published = filteredPosts.filter(p => p.status === 2);
  const rejected = filteredPosts.filter(p => p.status === 3);

  const renderPost = (post) => (
    <div key={post.id} style={{
      backgroundColor: themeColors.cardBg,
      padding: "1rem",
      marginBottom: "1rem",
      borderRadius: "15px",
      boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
      cursor: "pointer",
      transition: "transform 0.2s",
    }} onClick={() => handlePostClick(post.id)}
      onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
    >
      <h3 style={{ marginBottom: "0.25rem", color: themeColors.text }}>{post.title}</h3>
      <div
  style={{ color: "#555", whiteSpace: "pre-line" }}
  dangerouslySetInnerHTML={{ __html: post.content }}
></div>

      {post.images && post.images.length > 0 && (
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          {post.images.map(img => (
            <img key={img.url} src={img.url} alt={img.fileName} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }} />
          ))}
        </div>
      )}
      <small style={{ color: "#777" }}>Created: {new Date(post.createdAt).toLocaleString()}</small>
    </div>
  );

  return (
    <div style={{ fontFamily: "Georgia, serif", minHeight: "100vh", display: "flex", flexDirection: "column", background: themeColors.mainBg }}>
      {/* Header */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.5rem 1rem",
        backgroundColor: themeColors.headerFooterBg,
        color: "#fff",
        position: "relative",
        flexWrap: "wrap",
        zIndex: 10
      }}>
        <div style={{ fontWeight: "bold", fontSize: "1.5rem", cursor: "pointer" }} onClick={() => navigate("/home")}>
          ApnaBlog
        </div>

        <div style={{ flex: 1, display: "flex", justifyContent: "center", margin: "0.5rem 0" }}>
          {!isMobile && <SearchBar onSearch={handleSearch} />}
          {isMobile && mobileSearchOpen && <SearchBar onSearch={handleSearch} />}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", position: "relative" }}>
          {!isMobile && user && (
            <button onClick={() => navigate("/create-post")} style={{ backgroundColor: themeColors.buttonBg, color: themeColors.buttonText, padding: "0.5rem 1rem", borderRadius: "15px", border: "none", cursor: "pointer" }}>
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
              <div style={{ padding: "0.7rem 1rem", cursor: "pointer", borderBottom: "1px solid #ccc" }} onClick={() => { navigate("/profile"); setMenuOpen(false); }}><FaUser /> Profile</div>
              <div style={{ padding: "0.7rem 1rem", cursor: "pointer", borderBottom: "1px solid #ccc" }} onClick={() => { navigate("/my-posts"); setMenuOpen(false); }}><FaRegEdit /> Drafts</div>
              <div style={{ padding: "0.7rem 1rem", cursor: "pointer", borderBottom: "1px solid #ccc", display: "flex", alignItems: "center", gap: "0.5rem" }} onClick={() => { setMode(mode === "light" ? "dark" : "light"); setMenuOpen(false); }}>
                {mode === "light" ? <FaSun /> : <FaMoon />} {mode === "light" ? "Light Mode" : "Dark Mode"}
              </div>
              {user && (
                <div style={{ padding: "0.7rem 1rem", cursor: "pointer" }} onClick={() => { setUser(null); navigate("/login"); setMenuOpen(false); }}>
                  Logout
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: themeColors.text }}>My Posts</h1>

        {loading && <p style={{ textAlign: "center", marginTop: "2rem", fontStyle: "italic" }}>Loading posts...</p>}

        {!loading && posts.length === 0 && <p style={{ textAlign: "center", marginTop: "2rem", fontStyle: "italic" }}>You have no posts yet.</p>}

        {!loading && posts.length > 0 && (
          <>
            {drafts.length > 0 && (
              <section>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>Drafts</h2>
                {drafts.map(renderPost)}
              </section>
            )}
            {pending.length > 0 && (
              <section>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>Pending Approval</h2>
                {pending.map(renderPost)}
              </section>
            )}
            {published.length > 0 && (
              <section>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>Published</h2>
                {published.map(renderPost)}
              </section>
            )}
            {rejected.length > 0 && (
              <section>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem", color: "red" }}>Rejected</h2>
                {rejected.map(renderPost)}
              </section>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{ padding: "1rem 2rem", backgroundColor: themeColors.headerFooterBg, color: "#fff", textAlign: "center" }}>
        © 2025 ApnaBlog
      </footer>

      
    </div>
  );
}
