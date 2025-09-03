import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import api from "../api";

export default function CreatePost() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const loggedInUser = user?.username || "Anonymous";

  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState([
    { blockType: "text", textContent: "", imageUrlOrBase64: "", displayOrder: 0 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = {
    mainBg: "linear-gradient(135deg, #F4F4F9, #E8FFD7)",
    cardBg: "#FFFFFF",
    headerFooterBg: "#3E5F44",
    text: "#1C1C1C",
    buttonBg: "#5E936C",
    buttonText: "#fff",
    inputBg: "#fff",
  };

  useEffect(() => {
    document.body.style.background = colors.mainBg;
  }, []);

  const handleTextChange = (value, index) => {
    const newBlocks = [...blocks];
    newBlocks[index].textContent = value;
    setBlocks(newBlocks);
  };

  const handleAddBlock = () => {
    setBlocks([...blocks, { blockType: "text", textContent: "", imageUrlOrBase64: "", displayOrder: blocks.length }]);
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

  const handleSubmit = async () => {
    if (!title.trim()) return alert("Title cannot be empty!");
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", blocks.filter(b => b.blockType === "text").map(b => b.textContent).join("\n\n"));
      blocks.filter(b => b.blockType === "image" && b.imageUrlOrBase64).forEach((b, idx) => {
        const arr = b.imageUrlOrBase64.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        const u8arr = new Uint8Array(bstr.length);
        for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
        formData.append("images", new Blob([u8arr], { type: mime }), `image${idx}.png`);
      });

      await api.post("/Posts", formData, { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true });
      alert("Post submitted successfully! It will be published after editor approval.");
      setTitle("");
      setBlocks([{ blockType: "text", textContent: "", imageUrlOrBase64: "", displayOrder: 0 }]);
      navigate("/home");
    } catch (err) {
      console.error(err);
      alert("Error submitting post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: colors.mainBg, fontFamily: "Georgia, serif" }}>
      {/* NAVBAR */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", backgroundColor: colors.headerFooterBg, color: colors.buttonText }}>
        <div style={{ fontWeight: "bold", cursor: "pointer", fontSize: "1.5rem" }} onClick={() => navigate("/home")}>
          ApnaBlog
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: "2rem", maxWidth: "900px", margin: "auto", width: "100%" }}>
        <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Create a New Post</h2>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Post Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ flex: 1, padding: "12px", borderRadius: "10px", border: `1px solid ${colors.buttonBg}`, backgroundColor: colors.inputBg, color: colors.text }}
          />
        </div>

        {blocks.map((block, idx) => (
          <div key={idx} style={{ border: `1px solid ${colors.buttonBg}`, borderRadius: "12px", padding: "15px", marginBottom: "1rem", backgroundColor: colors.cardBg, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            {block.blockType === "text" && <ReactQuill value={block.textContent} onChange={(val) => handleTextChange(val, idx)} placeholder="Write content..." />}
            <input type="file" accept="image/*" onChange={(e) => handleAddImage(e, idx)} style={{ marginTop: "10px" }} />
            {block.imageUrlOrBase64 && <img src={block.imageUrlOrBase64} alt="preview" style={{ maxWidth: "100%", marginTop: "10px", borderRadius: "10px" }} />}
          </div>
        ))}

        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <button onClick={handleAddBlock} style={{ flex: 1, padding: "12px", borderRadius: "10px", backgroundColor: colors.buttonBg, color: colors.buttonText, fontWeight: "bold" }}>
            + Add Block
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting} style={{ flex: 1, padding: "12px", borderRadius: "10px", backgroundColor: colors.buttonBg, color: colors.buttonText, fontWeight: "bold" }}>
            {isSubmitting ? "Publishing..." : "Publish Post"}
          </button>
        </div>
      </main>

      <footer style={{ backgroundColor: colors.headerFooterBg, color: colors.buttonText, textAlign: "center", padding: "1rem" }}>
        © 2025 ApnaBlog
      </footer>
    </div>
  );
}
