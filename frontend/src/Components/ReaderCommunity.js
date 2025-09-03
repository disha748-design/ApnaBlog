import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { FaSearch, FaBars, FaTimes } from "react-icons/fa";

// ✅ TextGears API helper for difficulty only
const getDifficulty = async (text) => {
  try {
    const apiKey = "FgJ3Cb5xOamuxYwu"; // Your API key
    const res = await fetch(
      `https://api.textgears.com/readability?text=${encodeURIComponent(
        text
      )}&key=${apiKey}`
    );
    const data = await res.json();

    if (data.status && data.response?.stats) {
      return data.response.stats.fleschKincaid.interpretation || "Unknown";
    }
    return "Unknown";
  } catch (err) {
    console.error("TextGears error:", err);
    return "Unknown";
  }
};

export default function ReaderCommunity() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const themeColors = {
    mainBg: "linear-gradient(135deg, #F4F4F9, #E8FFD7)", // match homepage
    headerFooterBg: "#043d1eff", // match homepage
    buttonPrimary: "#1d7c05ff", // green button
    buttonText: "#fff",
    textDark: "#2E2E2E",
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await api.get("/Posts/published", {
        params: { page: pageNum, pageSize: 5 },
      });

      // Get difficulty for each post
      const postsWithDifficulty = await Promise.all(
        res.data.map(async (post) => {
          const difficulty = await getDifficulty(post.content || post.title);
          return { ...post, difficulty };
        })
      );

      setPosts(postsWithDifficulty);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div style={{ padding: "2rem" }}>Loading posts...</div>;

  return (
    <div
      style={{
        fontFamily: "Georgia, serif",
        background: themeColors.mainBg,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Inline CSS */}
      <style>{`
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 1rem;
          background-color: #043d1eff;
          color: white;
          box-sizing: border-box;
          position: relative;
          height: 60px;
        }
        .logo {
          font-weight: bold;
          font-size: 1.5rem;
          cursor: pointer;
          line-height: 1;
          flex-shrink: 0;
        }
        .search-bar {
          flex: 1;
          max-width: 400px;
          display: flex;
          align-items: center;
          background: white;
          border-radius: 20px;
          padding: 0.3rem 0.8rem;
          margin: 0 1rem;
        }
        .search-bar input {
          border: none;
          outline: none;
          flex: 1;
          padding: 0.3rem 0.5rem;
          border-radius: 20px;
          font-size: 0.9rem;
        }
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .desktop-nav button {
          background: ${themeColors.buttonPrimary};
          color: white;
          border: none;
          padding: 0.5rem 1.2rem;
          border-radius: 20px;
          cursor: pointer;
        }
        .hamburger {
          display: none;
          font-size: 1.5rem;
          cursor: pointer;
          margin-left: auto;
          line-height: 1;
        }
        .mobile-menu {
          display: none;
          flex-direction: column;
          background: ${themeColors.headerFooterBg};
          position: absolute;
          top: 100%;
          right: 0;
          width: 220px;
          padding: 1rem;
          gap: 1rem;
          border-radius: 0 0 10px 10px;
        }
        @media (max-width: 768px) {
          .search-bar { display: none; }
          .desktop-nav { display: none; }
          .hamburger { display: block; }
        }
      `}</style>

      {/* HEADER */}
      <header className="navbar">
        <div className="logo" onClick={() => navigate("/home")}>ApnaBlog</div>

        <div className="search-bar">
          <FaSearch color="#555" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="desktop-nav">
          <button onClick={() => navigate("/create-post")}>Write</button>
          <div
            style={{ fontSize: "1.5rem", cursor: "pointer" }}
            onClick={() => navigate("/profile")}
          >
            <i className="fa-solid fa-circle-user"></i>
          </div>
        </div>

        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {menuOpen && (
          <div className="mobile-menu">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "0.5rem",
                borderRadius: "8px",
                border: "none",
              }}
            />
            <button
              onClick={() => {
                navigate("/create-post");
                setMenuOpen(false);
              }}
            >
              Write
            </button>
            <div
              style={{
                fontSize: "1.5rem",
                textAlign: "center",
                cursor: "pointer",
              }}
              onClick={() => {
                navigate("/profile");
                setMenuOpen(false);
              }}
            >
              <i className="fa-solid fa-circle-user"></i>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          padding: "2rem",
          maxWidth: "900px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <h2 style={{ marginBottom: "1.5rem", color: themeColors.textDark }}>
          Explore Stories
        </h2>

        {filteredPosts.length === 0 ? (
          <p>No posts found.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filteredPosts.map((post) => {
  const author =
    post.author?.userName ||  // preferred, matches HomePage
    post.user?.username ||    // fallback
    post.authorUsername ||    // fallback
    "Anonymous";             // default if nothing exists

  return (
    <div
      key={post.id}
      style={{
        padding: "1rem",
        borderRadius: "10px",
        backgroundColor: "#fff",
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        transition: "transform 0.2s",
      }}
      onClick={() => navigate(`/post/${post.id}`)}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <h3 style={{ margin: 0, color: themeColors.textDark }}>
        {post.title}
      </h3>
      <p
        style={{
          fontSize: "0.9rem",
          color: "#555",
          marginTop: "0.3rem",
        }}
      >
        by {author}
      </p>
      <p
        style={{
          fontSize: "0.85rem",
          color: "#777",
          marginTop: "0.3rem",
        }}
      >
        Difficulty: {post.difficulty}
      </p>
    </div>
  );
})}

          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer
        style={{
          padding: "1rem 2rem",
          fontSize: "0.85rem",
          color: "#fff",
          backgroundColor: themeColors.headerFooterBg,
          display: "flex",
          justifyContent: "center",
          gap: "2rem",
          flexWrap: "wrap",
        }}
      >
        <span>© 2025 ApnaBlog</span>
      </footer>
    </div>
  );
}
