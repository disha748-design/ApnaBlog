import React, { useEffect, useState } from "react";
import api from "../api";

const EditorDashboard = () => {
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending posts from backend
  useEffect(() => {
    const fetchPendingPosts = async () => {
      try {
        const res = await api.get("/Posts/pending");
        setPendingPosts(res.data);
      } catch (err) {
        console.error("Error fetching pending posts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingPosts();
  }, []);

  // Approve a post
  const approvePost = async (id) => {
    try {
      await api.post(`/Posts/${id}/approve`);
      alert(`Post ${id} approved!`);
      // Refresh list
      setPendingPosts((prev) => prev.filter((post) => post.id !== id));
    } catch (err) {
      console.error("Error approving post", err);
      alert("Error approving post");
    }
  };

  // Reject/Edit a post
  const rejectPost = async (id) => {
    try {
      await api.post(`/Posts/${id}/reject`, {
        reason: "Does not meet guidelines",
      });
      alert(`Post ${id} rejected!`);
      // Refresh list
      setPendingPosts((prev) => prev.filter((post) => post.id !== id));
    } catch (err) {
      console.error("Error rejecting post", err);
      alert("Error rejecting post");
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "'Georgia', serif",
        backgroundColor: "#FFF5E4",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ color: "#7A4E2D", marginBottom: "2rem" }}>Pending Posts</h1>

      {loading ? (
        <p style={{ color: "#2E2E2E" }}>Loading...</p>
      ) : pendingPosts.length === 0 ? (
        <p style={{ color: "#2E2E2E" }}>No posts pending approval.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#fff",
              boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
              borderRadius: "10px",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#7A4E2D",
                  color: "#fff",
                  textAlign: "left",
                }}
              >
                <th style={{ padding: "1rem" }}>ID</th>
                <th style={{ padding: "1rem" }}>Title</th>
                <th style={{ padding: "1rem" }}>Content</th>
                <th style={{ padding: "1rem" }}>Images</th>
                <th style={{ padding: "1rem" }}>Author</th>
                <th style={{ padding: "1rem" }}>Created On</th>
                <th style={{ padding: "1rem" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingPosts.map((post) => (
                <tr key={post.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "1rem" }}>{post.id}</td>
                  <td style={{ padding: "1rem" }}>{post.title}</td>
                  <td style={{ padding: "1rem" }}>{post.content}</td>
                  <td style={{ padding: "1rem" }}>
                    {post.images && post.images.length > 0 ? (
                      post.images.map((img, idx) => (
                        <img key={idx} src={img.url} alt={img.fileName} style={{ width: "80px", marginRight: "0.5rem", borderRadius: "5px" }} />
                      ))
                    ) : (
                      "No images"
                    )}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {post.author?.userName || "Unknown"}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      display: "flex",
                      gap: "0.5rem",
                    }}
                  >
                    <button
                      onClick={() => approvePost(post.id)}
                      style={{
                        background: "#4CAF50",
                        color: "#fff",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectPost(post.id)}
                      style={{
                        background: "#E63946",
                        color: "#fff",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EditorDashboard;
