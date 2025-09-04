import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api"; // Axios instance
import { FaSun, FaMoon, FaUser, FaBars, FaTimes, FaSearch, FaRegEdit } from "react-icons/fa";
import PenPopup from "./Components/PenPopup";
import { AuthContext } from "./AuthContext"; // ✅ Use AuthContext

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

export default function HomePage() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext); // ✅ Get logged-in user

  // States
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState("light");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const [preferences, setPreferences] = useState([]);
  const [topAuthors, setTopAuthors] = useState([]);
  const [mostViewed, setMostViewed] = useState([]);

  // Detect mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = mode === "light" ? "#F4F4F9" : "#1C1C1C";
  }, [mode]);

  // Fetch posts
  const fetchPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await api.get("/Posts/published", { params: { page: pageNum, pageSize: 6 } });
      setPosts(res.data);
      setFilteredPosts(res.data);

      // Top authors calculation
      const authorsMap = {};
      res.data.forEach((post) => {
        const author = post.author?.userName || "Unknown";
        if (!authorsMap[author]) authorsMap[author] = { likes: 0, comments: 0 };
        authorsMap[author].likes += post.likesCount || 0;
        authorsMap[author].comments += post.commentsCount || 0;
      });

      const sortedAuthors = Object.entries(authorsMap)
        .sort((a, b) => b[1].likes + b[1].comments - (a[1].likes + a[1].comments))
        .slice(0, 3)
        .map(([username]) => username);
      setTopAuthors(sortedAuthors);

      // Most viewed posts
      const topViewed = [...res.data]
        .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
        .slice(0, 3);
      setMostViewed(topViewed);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch preferences
  const fetchPreferences = async () => {
    try {
      const res = await api.get("/UserProfile/me");
      const prefs = res.data.preferences ? JSON.parse(res.data.preferences) : [];
      setPreferences(Array.isArray(prefs) ? prefs : []);
    } catch (err) {
      console.error("Error fetching preferences:", err);
      setPreferences([]);
    }
  };

  useEffect(() => {
    fetchPosts(page);
    fetchPreferences();
  }, [page, user]); // ✅ refetch if user changes

  const handleSearch = (query) => {
    if (!query) setFilteredPosts(posts);
    else setFilteredPosts(posts.filter((p) => p.title.toLowerCase().includes(query.toLowerCase())));
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
      {/* ... Floating blobs ... */}

      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 1", backgroundColor: themeColors.headerFooterBg, color: "#fff", position: "relative", zIndex: 10, flexWrap: "wrap" }}>
        <div style={{ fontWeight: "bold", fontSize: "1.5rem", cursor: "pointer" }} onClick={() => navigate("/")}>
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

          {!isMobile && (
            <div style={{ position: "relative" }}>
              <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", color: "#fff", fontSize: "1.5rem", cursor: "pointer" }}>
                <i className="fa-solid fa-gear"></i>
              </button>
            </div>
          )}

          {menuOpen && (
            <div style={{ position: "absolute", top: "50px", right: 0, backgroundColor: mode === "light" ? "#fff" : "#2b2b2b", color: mode === "light" ? "#1C1C1C" : "#eee", borderRadius: "12px", boxShadow: "0 8px 16px rgba(0,0,0,0.2)", overflow: "hidden", zIndex: 1000, minWidth: "180px", fontSize: "0.95rem" }}>
              
              {/* Profile link */}
              <div
                style={{ padding: "0.7rem 1rem", cursor: "pointer", borderBottom: "1px solid #ccc" }}
                onClick={() => {
                  if (!user) navigate("/login");
                  else navigate("/profile");
                  setMenuOpen(false);
                }}
              >
                <FaUser /> Profile
              </div>
              {/* Drafts */}
{user && (
  <div
    style={{ padding: "0.7rem 1rem", cursor: "pointer", borderBottom: "1px solid #ccc" }}
    onClick={() => {
      navigate("/my-posts"); // navigate to MyPosts.js
      setMenuOpen(false);
    }}
  >
   <FaRegEdit /> 
 Drafts
  </div>
)}


              {/* Theme toggle */}
              <div
                style={{ padding: "0.7rem 1rem", cursor: "pointer", borderBottom: "1px solid #ccc", display: "flex", alignItems: "center", gap: "0.5rem" }}
                onClick={() => { setMode(mode === "light" ? "dark" : "light"); setMenuOpen(false); }}
              >
                {mode === "light" ? <FaSun /> : <FaMoon />} {mode === "light" ? "Light Mode" : "Dark Mode"}
              </div>

              {isMobile && (
                <div style={{ padding: "0.7rem 1rem", cursor: "pointer", borderBottom: "1px solid #ccc" }} onClick={() => setMobileSearchOpen(!mobileSearchOpen)}>
                  <FaSearch /> Search
                </div>
              )}

              {/* Logout */}
              {user && (
                <div
                  style={{ padding: "0.7rem 1rem", cursor: "pointer" }}
                  onClick={() => {
                    setUser(null); // ✅ clears context & localStorage
                    navigate("/login");
                    setMenuOpen(false);
                  }}
                >
                  <i className="fa-solid fa-right-from-bracket"></i> Logout
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ display: "flex", padding: "2rem", gap: "2rem", flex: 1, flexWrap: "wrap", position: "relative", zIndex: 5 }}>
        {/* Left Column */}
        <div style={{ flex: 2, minWidth: "300px" }}>
          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center", fontStyle: "italic", color: "#03310cff" }}>
              🌱 Loading posts… why not start writing your own blog today?
            </div>
          ) : filteredPosts.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", fontStyle: "italic", color: "#034426ff" }}>
              No posts yet. Be the first to share your story! ✍️
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} style={{
                backgroundColor: themeColors.cardBg,
                padding: "1rem",
                marginBottom: "1.5rem",
                borderRadius: "15px",
                cursor: "pointer",
                boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                display: "flex",
                gap: "1rem",
                transition: "transform 0.2s, box-shadow 0.2s",
              }} onClick={() => handlePostClick(post.id)}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.15)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.1)"; }}
              >
                {post.contentBlocks?.some((b) => b.blockType === "image" && b.imageUrlOrBase64) && (
                  <img src={post.contentBlocks.find((b) => b.blockType === "image")?.imageUrlOrBase64} alt="Post" style={{ width: "150px", height: "100px", objectFit: "cover", borderRadius: "10px" }} />
                )}
                <div>
                  <h3 style={{ marginBottom: "0.25rem", color: themeColors.text }}>{post.title}</h3>
                  <p style={{ margin: 0, color: "#555" }}>By {post.author?.userName || "Unknown"}</p>
                  <small style={{ color: "#777" }}>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}</small>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem", minWidth: "250px" }}>
          {/* Motivational Box */}
          <section style={{
            backgroundColor: "#1d7c05ff",
            color: "#fff",
            borderRadius: "15px",
            padding: "1rem",
            textAlign: "center",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
            boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
            transition: "transform 0.2s",
          }} onClick={() => navigate("/create-post")}
             onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
             onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontWeight: "bold", fontSize: "1rem" }}>
               Share your story with the world! Write your blog today...
            </div>
            <div style={{ fontSize: "1.5rem" }}><i className="fa-sharp fa-solid fa-pen-to-square"></i></div>
          </section>

          {/* Reader Community Box */}
          <section style={{
            backgroundColor: "#1D7C05",
            color: "#fff",
            borderRadius: "15px",
            padding: "1rem",
            textAlign: "center",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
            boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
            transition: "transform 0.2s",
          }} onClick={() => navigate("/reader-community")}
             onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
             onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontWeight: "bold", fontSize: "1rem" }}>
              <i className="fa-solid fa-bookmark"></i> Not a writer? Explore our Reader Community!
            </div>
            <div style={{ fontSize: "1.5rem" }}>
              <i className="fa-solid fa-book-open-reader"></i>
            </div>
          </section>

          {/* Most Viewed Blogs */}
          <section style={{
            backgroundColor: themeColors.cardBg,
            borderRadius: "15px",
            padding: "1rem",
            boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
          }}>
            <h3 style={{ color: themeColors.text, marginBottom: "0.5rem" }}><i className="fa-solid fa-eye"></i> Most Viewed Blogs</h3>
            {mostViewed.length > 0 ? mostViewed.map((post) => (
              <div key={post.id} style={{
                cursor: "pointer",
                padding: "0.3rem 0.5rem",
                borderRadius: "8px",
                border: "2px solid #4dcf29ff",
                marginTop: "0.3rem",
                fontSize: "0.9rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }} title={post.title} onClick={() => handlePostClick(post.id)}>{post.title}</div>
            )) : <div>No trending blogs yet</div>}
          </section>

          {/* Recommended Topics */}
          <section style={{
  backgroundColor: themeColors.cardBg,
  borderRadius: "15px",
  padding: "1rem",
  boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
}}>
  <h3 style={{ color: themeColors.text, marginBottom: "0.5rem" }}>Recommended Topics</h3>
  {preferences.length > 0 ? (
    preferences.map((topic) => (
      <div
        key={topic}
        style={{
          cursor: "pointer",
          color: "#0f4b1eff",
          marginTop: "0.5rem",
          padding: "0.3rem 0.5rem",
          borderRadius: "8px",
          border: "1px solid #0f4b1eff",
          display: "inline-block",
          marginRight: "0.5rem",
        }}
        onClick={() => navigate(`/topic/${topic}`)}
      >
        #{topic}
      </div>
    ))
  ) : (
    <div>No topic preferences yet</div>
  )}
</section>


          {/* Top Authors */}
          <section style={{
            backgroundColor: themeColors.cardBg,
            borderRadius: "15px",
            padding: "1rem",
            boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
          }}>
            <h3 style={{ color: themeColors.text, marginBottom: "0.5rem" }}>Top Authors</h3>
            {topAuthors.length > 0 ? topAuthors.map((author) => (
              <div key={author} style={{
                padding: "0.3rem 0.5rem",
                borderRadius: "8px",
                border: "1px solid #0f4b1eff",
                marginTop: "0.3rem",
                cursor: "pointer",
              }} onClick={() => navigate(`/author/${author}`)}>{author}</div>
            )) : <div>No top authors yet</div>}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: "1rem 2rem",
        backgroundColor: themeColors.headerFooterBg,
        color: "#fff",
        textAlign: "center",
        marginTop: "auto",
        display: "flex",
        justifyContent: "center",
        gap: "1.5rem",
        flexWrap: "wrap",
      }}>
        <span>© 2025 ApnaBlog</span>
      </footer>

      {/* Pen Popup */}
      <PenPopup />

      <style>{`
        @keyframes floatBlob {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(20deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
