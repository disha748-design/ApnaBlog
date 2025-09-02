import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { FaPen } from "react-icons/fa";

const EditorEditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
       const res = await api.get(`/Posts/${id}/editor`);
       setPost(res.data);
       setTitle(res.data.title);
       setContent(res.data.content);
      } catch (err) {
        console.error("Error fetching post", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleSubmit = async () => {
  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    // If you want to support file uploads later
    // images.forEach(file => formData.append("images", file));

    await api.put(`/Posts/${id}/edit-by-editor`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert("Post updated and published successfully!");
    navigate("/editor-dashboard");
  } catch (err) {
    console.error(err);
    alert("Failed to update post");
  }
};

  if (loading) return <p>Loading post...</p>;
  if (!post) return <p>Post not found</p>;

  return (
    <div style={{ padding: "2rem", fontFamily: "Georgia, serif" }}>
      <h2>Edit Post</h2>
      <div style={{ marginBottom: "1rem" }}>
        <label>Title:</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid #ccc" }}
        />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>Content:</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", minHeight: "200px", borderRadius: "8px", border: "1px solid #ccc" }}
        />
      </div>
      <button
        onClick={handleSubmit}
        style={{ background: "#1d7c05ff", color: "#fff", padding: "0.5rem 1rem", borderRadius: "10px", border: "none", cursor: "pointer" }}
      >
        Save Changes <FaPen />
      </button>
      <button
        onClick={() => navigate("/editor-dashboard")}
        style={{ marginLeft: "1rem", padding: "0.5rem 1rem", borderRadius: "10px", border: "1px solid #ccc", cursor: "pointer" }}
      >
        Cancel
      </button>
    </div>
  );
};

export default EditorEditPost;
