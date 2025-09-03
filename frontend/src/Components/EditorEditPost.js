import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import api from "../api";
import { FaPlus, FaPen, FaTrash } from "react-icons/fa";

export default function EditorEditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = {
    mainBg: "#E8FFD7",
    cardBg: "#FFFFFF",
    headerFooterBg: "#3E5F44",
    text: "#1C1C1C",
    buttonBg: "#5E936C",
    buttonText: "#fff",
    inputBg: "#fff",
  };

  // Fetch post data for editor
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/Posts/${id}/editor`);
        setPost(res.data);
        setTitle(res.data.title);

        // Text blocks
        const textBlocks = res.data.content
          ? res.data.content.split("\n\n").map((t, idx) => ({
              blockType: "text",
              textContent: t,
              imageUrlOrBase64: "",
              isNew: false,
              displayOrder: idx,
            }))
          : [];

        // Existing images
        const imageBlocks = (res.data.images || []).map((img, idx) => ({
          blockType: "image",
          textContent: "",
          imageUrlOrBase64: img.url.startsWith("http") ? img.url : `http://localhost:5096${img.url}`,
          isNew: false,
          displayOrder: textBlocks.length + idx,
        }));

        setBlocks([...textBlocks, ...imageBlocks]);
      } catch (err) {
        console.error(err);
        alert("Failed to load post for editing.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  // Update text block
  const handleTextChange = (value, index) => {
    const newBlocks = [...blocks];
    newBlocks[index].textContent = value;
    setBlocks(newBlocks);
  };

  // Add new text block
  const handleAddBlock = () => {
    setBlocks([
      ...blocks,
      { blockType: "text", textContent: "", imageUrlOrBase64: "", isNew: true, displayOrder: blocks.length },
    ]);
  };

  // Add/replace image in block
  const handleAddImage = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newBlocks = [...blocks];
        newBlocks[index].imageUrlOrBase64 = reader.result;
        newBlocks[index].blockType = "image";
        newBlocks[index].isNew = true;
        setBlocks(newBlocks);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove any block
  const handleRemoveBlock = (index) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(newBlocks);
  };

  // Submit updated post
  const handleSubmit = async () => {
    if (!title.trim()) return alert("Title cannot be empty!");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append(
        "content",
        blocks
          .filter((b) => b.blockType === "text")
          .map((b) => b.textContent)
          .join("\n\n")
      );

      // Only upload new images
      blocks
        .filter((b) => b.blockType === "image" && b.isNew)
        .forEach((b, idx) => {
          const arr = b.imageUrlOrBase64.split(",");
          const mime = arr[0].match(/:(.*?);/)[1];
          const bstr = atob(arr[1]);
          const n = bstr.length;
          const u8arr = new Uint8Array(n);
          for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
          const file = new Blob([u8arr], { type: mime });
          formData.append("images", file, `image${idx}.png`);
        });

      await api.put(`/Posts/${id}/edit-by-editor`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Post updated successfully!");
      navigate("/editor-dashboard");
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Failed to update post");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p style={{ padding: "2rem" }}>Loading post...</p>;
  if (!post) return <p style={{ padding: "2rem" }}>Post not found</p>;

  return (
    <div style={{ backgroundColor: colors.mainBg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* HEADER */}
      <nav style={{ backgroundColor: colors.headerFooterBg, color: colors.buttonText, padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontWeight: "bold", fontSize: "1.2rem", cursor: "pointer" }} onClick={() => navigate("/editor-dashboard")}>ApnaBlog</div>
      </nav>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: "2rem", maxWidth: "900px", margin: "0 auto", width: "100%" }}>
        <h2 style={{ marginBottom: "1rem", color: colors.text }}>Edit Post</h2>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post Title"
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "8px",
            border: `1px solid ${colors.buttonBg}`,
            marginBottom: "1rem",
            backgroundColor: colors.inputBg,
            color: colors.text,
            fontSize: "1rem",
          }}
        />

        {blocks.map((block, idx) => (
          <div key={idx} style={{ border: `1px solid ${colors.buttonBg}`, borderRadius: "10px", padding: "12px", marginBottom: "1rem", backgroundColor: colors.inputBg }}>
            {block.blockType === "text" && <ReactQuill value={block.textContent} onChange={(val) => handleTextChange(val, idx)} />}
            {block.blockType === "image" && block.imageUrlOrBase64 && (
              <img src={block.imageUrlOrBase64} alt="preview" style={{ width: "100%", marginTop: "8px", borderRadius: "8px" }} />
            )}
            <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
              <input type="file" accept="image/*" onChange={(e) => handleAddImage(e, idx)} />
              <button onClick={() => handleRemoveBlock(idx)} style={{ background: "red", color: "#fff", border: "none", borderRadius: "6px", padding: "4px 8px", cursor: "pointer" }}><FaTrash /> Remove</button>
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "1rem" }}>
          <button onClick={handleAddBlock} style={{ background: colors.buttonBg, color: colors.buttonText, padding: "10px", borderRadius: "8px", cursor: "pointer", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><FaPlus /> Add Block</button>
          <button onClick={handleSubmit} disabled={isSubmitting} style={{ background: colors.buttonBg, color: colors.buttonText, padding: "10px", borderRadius: "8px", cursor: "pointer", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><FaPen /> {isSubmitting ? "Updating..." : "Save Changes"}</button>
          <button onClick={() => navigate("/editor-dashboard")} style={{ padding: "10px", borderRadius: "8px", border: `1px solid ${colors.buttonBg}`, cursor: "pointer", flex: 1 }}>Cancel</button>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ backgroundColor: colors.headerFooterBg, color: colors.buttonText, textAlign: "center", padding: "1rem", marginTop: "auto" }}>© 2025 ApnaBlog</footer>
    </div>
  );
}
