import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import api from "../api";
import { FaTrash, FaPlus, FaPen } from "react-icons/fa";

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

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/Posts/${id}/editor`);
        setPost(res.data);
        setTitle(res.data.title);

        const textBlocks = res.data.content
          ? res.data.content.split("\n\n").map((t, idx) => ({
              blockType: "text",
              textContent: t,
              imageUrlOrBase64: "",
              displayOrder: idx,
            }))
          : [];
        const imageBlocks = (res.data.images || []).map((img, idx) => ({
          blockType: "image",
          textContent: "",
          imageUrlOrBase64: img.url,
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

  const handleTextChange = (value, index) => {
    const newBlocks = [...blocks];
    newBlocks[index].textContent = value;
    setBlocks(newBlocks);
  };

  const handleAddBlock = () => {
    setBlocks([
      ...blocks,
      { blockType: "text", textContent: "", imageUrlOrBase64: "", displayOrder: blocks.length },
    ]);
  };

  const handleAddImage = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newBlocks = [...blocks];
        newBlocks[index].imageUrlOrBase64 = reader.result;
        newBlocks[index].blockType = "image";
        setBlocks(newBlocks);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteBlock = (index) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

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

      blocks
        .filter((b) => b.blockType === "image" && b.imageUrlOrBase64.includes("base64"))
        .forEach((b, idx) => {
          const arr = b.imageUrlOrBase64.split(",");
          const mime = arr[0].match(/:(.*?);/)[1];
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) u8arr[n] = bstr.charCodeAt(n);
          const file = new Blob([u8arr], { type: mime });
          formData.append("images", file, `image${idx}.png`);
        });

      await api.put(`/Posts/${id}/edit-by-editor`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Post updated and published successfully!");
      navigate("/editor-dashboard");
    } catch (err) {
      console.error(err);
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
      <nav
        style={{
          backgroundColor: colors.headerFooterBg,
          color: colors.buttonText,
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{ fontWeight: "bold", fontSize: "1.2rem", cursor: "pointer" }}
          onClick={() => navigate("/editor-dashboard")}
        >
          ApnaBlog
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          padding: "2rem",
          maxWidth: "900px",
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
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
          <div
            key={idx}
            style={{
              border: `1px solid ${colors.buttonBg}`,
              borderRadius: "10px",
              padding: "12px",
              marginBottom: "1rem",
              backgroundColor: colors.inputBg,
            }}
          >
            {block.blockType === "text" && (
              <ReactQuill value={block.textContent} onChange={(val) => handleTextChange(val, idx)} />
            )}
            {block.blockType === "image" && block.imageUrlOrBase64 && (
              <img
                src={block.imageUrlOrBase64}
                alt="preview"
                style={{ width: "100%", marginTop: "8px", borderRadius: "8px" }}
              />
            )}
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "8px",
                flexWrap: "wrap",
              }}
            >
              <input type="file" accept="image/*" onChange={(e) => handleAddImage(e, idx)} />
              <button
                onClick={() => handleDeleteBlock(idx)}
                style={{
                  background: "red",
                  color: "#fff",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "1rem",
          }}
        >
          <button
            onClick={handleAddBlock}
            style={{
              background: colors.buttonBg,
              color: colors.buttonText,
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            <FaPlus /> Add Block
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              background: colors.buttonBg,
              color: colors.buttonText,
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            {isSubmitting ? "Updating..." : "Save Changes"} <FaPen />
          </button>
          <button
            onClick={() => navigate("/editor-dashboard")}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: `1px solid ${colors.buttonBg}`,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          backgroundColor: colors.headerFooterBg,
          color: colors.buttonText,
          textAlign: "center",
          padding: "1rem",
          marginTop: "auto",
        }}
      >
        © 2025 ApnaBlog
      </footer>
    </div>
  );
}
