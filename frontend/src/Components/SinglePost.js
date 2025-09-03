import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { FaEdit, FaTrash, FaUser, FaSun, FaMoon, FaCog } from "react-icons/fa";
import "./SinglePost.css";

export default function SinglePost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [likeLoading, setLikeLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const dropdownRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const loggedInUserId = user?.id;
  const loggedInUsername = user?.username;

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchPost();
    incrementViews();
    return () => window.speechSynthesis.cancel();
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/Posts/${id}`);
      setPost(res.data);

      // Fetch comments
      const commentsRes = await api.get(`/posts/${id}/Comments`);
      setComments(commentsRes.data || []);
    } catch (err) {
      console.error("Error fetching post or comments:", err);
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      await api.post(`/Posts/${id}/view`);
      setPost((prev) => ({
        ...prev,
        viewsCount: (prev?.viewsCount || 0) + 1,
      }));
    } catch (err) {
      console.warn("View increment failed", err);
    }
  };

  const handleLike = async () => {
    setLikeLoading(true);
    try {
      const res = await api.post(`/Posts/${id}/like`);
      setPost((prev) => ({ ...prev, likesCount: res.data.likesCount }));
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Login required to like this post.");
        navigate("/login");
      } else {
        console.error(err);
        alert("Failed to like post.");
      }
    } finally {
      setLikeLoading(false);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/posts/${id}/Comments`, {
        content: commentText,
      });
      setComments((prev) => [...prev, res.data]);
      setPost((prev) => ({
        ...prev,
        commentsCount: (prev.commentsCount || 0) + 1,
      }));
      setCommentText("");
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Login required to comment.");
        navigate("/login");
      } else {
        console.error(err);
        alert("Failed to post comment.");
      }
    }
  };

  const handleEdit = () => navigate(`/edit-post/${id}`);

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.delete(`/Posts/${id}`);
      alert("Post deleted.");
      navigate("/home");
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateSummary = async () => {
    if (!post?.content) return;
    setSummaryLoading(true);
    try {
      const res = await api.post("/Summary", { text: post.content });
      setSummary(res.data.summary || "No summary available.");
    } catch (err) {
      console.error(err);
      setSummary("Failed to generate summary.");
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleSpeak = () => {
    if (!post?.content) return;
    if (!speaking) {
      const text =
        new DOMParser().parseFromString(post.content, "text/html").body
          .textContent || "";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    } else {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [...prev, { role: "user", text: chatInput }]);
    const message = chatInput;
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await api.post("/Chat/ask", {
        BlogContent: post.content,
        Question: message,
      });
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: res.data.response },
      ]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: "❌ Something went wrong." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!post) return <div className="loading">Post not found</div>;

  const isAuthor = post.authorId === loggedInUserId;

  return (
    <div className={`single-post-container ${isDarkMode ? "dark-mode" : ""}`}>
      {/* HEADER */}
      <header ref={dropdownRef}>
        <div className="nav-brand" onClick={() => navigate("/home")}>
          ApnaBlog
        </div>

        <div className="settings-icon" onClick={() => setMenuOpen(!menuOpen)}>
          <FaCog />
        </div>

        {menuOpen && (
          <div className="settings-dropdown">
            <div className="dropdown-item" onClick={() => navigate("/profile")}>
              <FaUser /> Profile
            </div>
            <div className="dropdown-item" onClick={toggleDarkMode}>
              {isDarkMode ? <FaSun /> : <FaMoon />}{" "}
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <div className="single-post-main">
        <div className="post-left">
          <h1 className="post-title">{post.title}</h1>
          <p className="post-meta">
            By <strong>{post.authorUsername}</strong> •{" "}
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
          <p className="post-views">{post.viewsCount || 0} views</p>

          {isAuthor && (
            <div className="author-buttons">
              <button className="btn-primary" onClick={handleEdit}>
                <FaEdit /> Edit
              </button>
              <button className="btn-danger" onClick={handleDelete}>
                <FaTrash /> Delete
              </button>
            </div>
          )}

          {/* Render images correctly */}
         {post.images?.map((img, idx) => (
  <img
    key={idx}
    src={img.url.startsWith("http") ? img.url : `http://localhost:5096/${img.url}`}
    alt={`Post ${idx}`}
    className="post-image"
  />
))}


          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="post-stats">
            <span>{post.likesCount || 0} Likes</span>
            <span>{post.commentsCount || 0} Comments</span>
          </div>

          <button
            className="btn-primary"
            onClick={handleLike}
            disabled={likeLoading}
          >
            {likeLoading ? "Liking..." : "Like"}
          </button>

          <div className="comments-section">
            <h3>Comments</h3>
            {comments.length === 0 && <p>No comments yet.</p>}
            {comments.map((c) => (
              <div key={c.id || Math.random()} className="comment">
                <strong>
                  {c.authorName ||
                    c.authorUsername ||
                    c.user?.username ||
                    "Anonymous"}
                </strong>
                : {c.content || ""}
                <div className="comment-meta">
                  <small>
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleString()
                      : ""}
                  </small>
                </div>
              </div>
            ))}
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="comment-input"
            />
            <button className="btn-primary" onClick={handleComment}>
              Post Comment
            </button>
          </div>
        </div>

        <div className="post-right">
          <div className="side-box">
            <p>✨ Generate a quick summary!</p>
            <button
              className="btn-primary"
              onClick={handleGenerateSummary}
              disabled={summaryLoading}
            >
              {summaryLoading ? "Generating..." : "Generate Summary"}
            </button>
            {summary && <div className="summary-box">{summary}</div>}
          </div>

          <div className="side-box">
            <p>🎧 Read aloud!</p>
            <button className="btn-secondary" onClick={handleSpeak}>
              {speaking ? "Stop Reading" : "Read Aloud"}
            </button>
          </div>

          <div className="side-box">
            <p>💬 Ask about this blog</p>
            <div className="chat-box">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`chat-msg ${msg.role}`}>
                  <strong>{msg.role === "user" ? "You" : "Bot"}:</strong>{" "}
                  {msg.text}
                </div>
              ))}
            </div>
            <form className="chat-input" onSubmit={handleChatSubmit}>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask..."
              />
              <button type="submit" className="btn-primary">
                {chatLoading ? "..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <footer>© 2025 ApnaBlog</footer>
    </div>
  );
}
