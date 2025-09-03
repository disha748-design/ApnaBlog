import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import api from "../api";
import { FaPlus, FaPen } from "react-icons/fa";
import "./EditorEditPost.css"; // We'll put responsive CSS here

export default function EditorEditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
              isNew: false,
              displayOrder: idx,
            }))
          : [];

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

  const handleTextChange = (value, index) => {
    const newBlocks = [...blocks];
    newBlocks[index].textContent = value;
    setBlocks(newBlocks);
  };

  const handleAddBlock = () => {
    setBlocks([
      ...blocks,
      { blockType: "text", textContent: "", imageUrlOrBase64: "", isNew: true, displayOrder: blocks.length },
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
        newBlocks[index].isNew = true;
        setBlocks(newBlocks);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return alert("Title cannot be empty!");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append(
        "content",
        blocks.filter((b) => b.blockType === "text").map((b) => b.textContent).join("\n\n")
      );

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

  if (loading) return <p className="loading">Loading post...</p>;
  if (!post) return <p className="loading">Post not found</p>;

  return (
    <div className="editor-page">
      <nav className="editor-header">
        <div className="logo" onClick={() => navigate("/editor-dashboard")}>ApnaBlog</div>
      </nav>

      <main className="editor-main">
        <h2>Edit Post</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post Title"
          className="post-title-input"
        />

        {blocks.map((block, idx) => (
          <div key={idx} className="editor-block">
            {block.blockType === "text" && <ReactQuill value={block.textContent} onChange={(val) => handleTextChange(val, idx)} />}
            {block.blockType === "image" && block.imageUrlOrBase64 && (
              <img src={block.imageUrlOrBase64} alt="preview" className="editor-image" />
            )}
            <input type="file" accept="image/*" onChange={(e) => handleAddImage(e, idx)} className="image-input" />
          </div>
        ))}

        <div className="editor-buttons">
          <button onClick={handleAddBlock}><FaPlus /> Add Block</button>
          <button onClick={handleSubmit} disabled={isSubmitting}><FaPen /> {isSubmitting ? "Updating..." : "Save Changes"}</button>
          <button onClick={() => navigate("/editor-dashboard")}>Cancel</button>
        </div>
      </main>

      <footer className="editor-footer">© 2025 ApnaBlog</footer>
    </div>
  );
}
