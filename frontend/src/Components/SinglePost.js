import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import {
  FaEdit,
  FaTrash,
  FaUser,
  FaSun,
  FaMoon,
  FaCog,
  FaHeart,
  FaRegHeart,
  FaComment,
  FaEye,
} from "react-icons/fa";
import "./SinglePost.css";

export default function SinglePost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [speaking, setSpeaking] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const [suggestingId, setSuggestingId] = useState(null);
  const [replySuggestions, setReplySuggestions] = useState({});

  const dropdownRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const loggedInUserId = user?.id;

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

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
      setLikesCount(res.data.likesCount || 0);
      setLiked(res.data.userHasLiked || false);

      const commentsRes = await api.get(`/Posts/${id}/Comments`);
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

  const toggleLike = async () => {
    if (!user) {
      alert("Login required to like this post.");
      navigate("/login");
      return;
    }

    const prevLiked = liked;
    const prevLikes = likesCount;

    const newLiked = !prevLiked;
    setLiked(newLiked);
    setLikesCount(newLiked ? prevLikes + 1 : prevLikes - 1);

    try {
      await api.post(`/Posts/${id}/like-toggle`);
    } catch (err) {
      console.error("Failed to toggle like:", err);
      setLiked(prevLiked);
      setLikesCount(prevLikes);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/Posts/${id}/Comments`, {
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

  const handleSuggestReplies = async (commentId, commentContent) => {
    setSuggestingId(commentId);
    try {
      const res = await api.post(`/Posts/${id}/Comments/suggest-replies`, {
        text: commentContent,
      });
      setReplySuggestions((prev) => ({
        ...prev,
        [commentId]: res.data || [],
      }));
    } catch (err) {
      console.error("Failed to get reply suggestions:", err);
      alert("Could not fetch suggestions.");
    } finally {
      setSuggestingId(null);
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

          {/* Author Controls */}
          {isAuthor && (
            <div className="author-buttons">
              <FaEdit className="icon-button" title="Edit" onClick={handleEdit} />
              <FaTrash
                className="icon-button delete"
                title="Delete"
                onClick={handleDelete}
              />
            </div>
          )}

          {post.images?.map((img, idx) => (
            <img
              key={idx}
              src={
                img.url.startsWith("http")
                  ? img.url
                  : `http://localhost:5096/${img.url}`
              }
              alt={`Post ${idx}`}
              className="post-image"
            />
          ))}

          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* STATS */}
          <div className="post-stats">
            <span title="Views">
              <FaEye /> {post.viewsCount || 0}
            </span>
            <span title="Likes">
              <FaHeart color="red" /> {likesCount}
            </span>
            <span title="Comments">
              <FaComment /> {post.commentsCount || 0}
            </span>
          </div>

          {/* LIKE BUTTON */}
          <button className="btn-icon" onClick={toggleLike} title="Like">
            {liked ? <FaHeart color="red" /> : <FaRegHeart />}
          </button>

          {/* COMMENTS SECTION */}
          <div className="comments-section">
          <h3>Comments</h3>
          {comments.length === 0 && <p>No comments yet.</p>}
          {comments.map((c) => (
            <div key={c.id} className="comment">
              <strong>{c.authorName || "Anonymous"}</strong>: {c.content}
              <div className="comment-meta">
                <small>
                  {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                </small>
              </div>

              {/* ✅ Suggest Replies button: show only if commenter is NOT the post author */}
          {loggedInUserId === post.authorId && c.authorId !== loggedInUserId && (
           <button
            className="btn-suggest"
            disabled={suggestingId === c.id}
            onClick={() => handleSuggestReplies(c.id, c.content)}
            title="Suggest Reply"
          >
            💡
          </button>
          )}


              {/* ✅ Suggestions list */}
              {replySuggestions[c.id] && replySuggestions[c.id].length > 0 && (
                <div className="suggestions-list">
                  {replySuggestions[c.id].map((s, idx) => {
                    const cleaned = s
                      .replace(/^\d+[\).\s"]+/, "")
                      .replace(/^"+|"+$/g, "")
                      .trim();
                    return (
                      <div
                        key={idx}
                        className="suggestion-item"
                        onClick={() => setCommentText(cleaned)}
                      >
                        {cleaned}
                      </div>
                    );
                  })}
                </div>
              )}
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
        </div>
      </div>

      <footer>© 2025 ApnaBlog</footer>
    </div>
  );
}
