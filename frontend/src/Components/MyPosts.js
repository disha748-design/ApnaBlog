import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { FaSearch, FaBars, FaTimes } from "react-icons/fa";

export default function PostsOverview() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get("/Posts/my-posts");
        setPosts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusLabel = (status) => {
    switch (status) {
      case 0: return "Draft";
      case 1: return "Pending";
      case 2: return "Published";
      case 3: return "Rejected";
      default: return "Unknown";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return "#ccc";
      case 1: return "#f0ad4e";
      case 2: return "#5cb85c";
      case 3: return "#d9534f";
      default: return "#777";
    }
  };

  if (loading) return <div style={{ padding: "2rem" }}>Loading posts...</div>;

  return (
    <div style={{ fontFamily: "Georgia, serif", background: "linear-gradient(135deg, #F4F4F9, #E8FFD7)", minHeight: "100vh" }}>
      {/* Navbar */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.5rem 1rem",
        backgroundColor: "#043d1eff",
        color: "#fff",
        position: "relative",
        height: "60px",
      }}>
        <div style={{ fontWeight: "bold", fontSize: "1.5rem", cursor: "pointer" }} onClick={() => navigate("/home")}>
          ApnaBlog
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div onClick={() => setSearchOpen(!searchOpen)} style={{ cursor: "pointer" }}>
            <FaSearch />
          </div>
          <button onClick={() => navigate("/create-post")} style={{ background: "#1d7c05ff", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "20px", cursor: "pointer" }}>
            Write
          </button>
          <div style={{ fontSize: "1.5rem", cursor: "pointer" }} onClick={() => navigate("/profile")}>
            👤
          </div>
        </div>

        {searchOpen && (
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              position: "absolute",
              top: "60px",
              right: "1rem",
              padding: "0.3rem 0.6rem",
              borderRadius: "20px",
              border: "1px solid #ccc",
              outline: "none",
            }}
          />
        )}
      </header>

      {/* Main */}
      <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "1rem", color: "#2E2E2E" }}>Posts Overview</h2>
        {filteredPosts.length === 0 ? (
          <p>No posts found.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filteredPosts.map((post) => (
              <div key={post.id} style={{
                padding: "1rem",
                borderRadius: "10px",
                backgroundColor: "#fff",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                transition: "transform 0.2s",
              }} onClick={() => navigate(`/post/${post.id}`)}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <h3 style={{ margin: 0 }}>{post.title}</h3>
                <p style={{ fontSize: "0.85rem", color: "#777", margin: "0.3rem 0" }}>Status: <span style={{ color: getStatusColor(post.status), fontWeight: "bold" }}>{getStatusLabel(post.status)}</span></p>
                <p style={{ color: "#555", fontSize: "0.9rem" }}>{post.content.replace(/<[^>]+>/g, "").substring(0, 120)}...</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer style={{ padding: "1rem 2rem", fontSize: "0.85rem", color: "#fff", backgroundColor: "#043d1eff", textAlign: "center" }}>
        © 2025 ApnaBlog
      </footer>
    </div>
  );
}
