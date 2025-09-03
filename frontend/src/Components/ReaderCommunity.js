import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { FaSearch, FaBars, FaTimes, FaUser } from "react-icons/fa";
import { AuthContext } from "../AuthContext"; // ✅ same AuthContext as homepage

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

export default function ReaderCommunity() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/Posts/published", { params: { page: 1, pageSize: 6 } });
      setPosts(res.data);
      setFilteredPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    if (!query) setFilteredPosts(posts);
    else setFilteredPosts(posts.filter((p) => p.title.toLowerCase().includes(query.toLowerCase())));
  };

  return (
    <div style={{ fontFamily: "Georgia, serif", minHeight: "100vh", display: "flex", flexDirection: "column", background: "linear-gradient(135deg, #F4F4F9, #E8FFD7)" }}>
      
      {/* HEADER - same as homepage */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 1rem", backgroundColor: "#043d1eff", color: "#fff", position: "relative", zIndex: 10 }}>
        <div style={{ fontWeight: "bold", fontSize: "1.5rem", cursor: "pointer" }} onClick={() => navigate("/")}>
          ApnaBlog
        </div>

        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          {!isMobile && <SearchBar onSearch={handleSearch} />}
          {isMobile && mobileSearchOpen && <SearchBar onSearch={handleSearch} />}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", position: "relative" }}>
          {!isMobile && user && (
            <button
              onClick={() => navigate("/create-post")}
              style={{ backgroundColor: "#1d7c05ff", color: "#fff", padding: "0.5rem 1rem", borderRadius: "15px", border: "none", cursor: "pointer" }}
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
            <div style={{ position: "absolute", top: "50px", right: 0, backgroundColor: "#fff", color: "#1C1C1C", borderRadius: "12px", boxShadow: "0 8px 16px rgba(0,0,0,0.2)", overflow: "hidden", zIndex: 1000, minWidth: "180px", fontSize: "0.95rem" }}>
              <div style={{ padding: "0.7rem 1rem", cursor: "pointer", borderBottom: "1px solid #ccc" }} onClick={() => { if (!user) navigate("/login"); else navigate("/profile"); setMenuOpen(false); }}>
                <FaUser /> Profile
              </div>
              {isMobile && (
                <div style={{ padding: "0.7rem 1rem", cursor: "pointer", borderBottom: "1px solid #ccc" }} onClick={() => setMobileSearchOpen(!mobileSearchOpen)}>
                  <FaSearch /> Search
                </div>
              )}
              {user && (
                <div style={{ padding: "0.7rem 1rem", cursor: "pointer" }} onClick={() => { setUser(null); navigate("/login"); setMenuOpen(false); }}>
                  Logout
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* MAIN */}
      <main style={{ flex: 1, padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "1.5rem", color: "#2E2E2E" }}>Explore Stories</h2>

        {loading ? (
          <p>Loading posts…</p>
        ) : filteredPosts.length === 0 ? (
          <p>No posts found.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filteredPosts.map((post) => (
              <div key={post.id} style={{ padding: "1rem", borderRadius: "10px", backgroundColor: "#fff", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", transition: "transform 0.2s" }}
                onClick={() => navigate(`/post/${post.id}`)}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <h3 style={{ margin: 0, color: "#2E2E2E" }}>{post.title}</h3>
                <p style={{ fontSize: "0.9rem", color: "#555", marginTop: "0.3rem" }}>by {post.authorUsername}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{ padding: "1rem 2rem", backgroundColor: "#043d1eff", color: "#fff", textAlign: "center", marginTop: "auto" }}>
        © 2025 ApnaBlog
      </footer>
    </div>
  );
}
