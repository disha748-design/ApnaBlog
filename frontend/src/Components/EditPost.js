import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import api from "../api";
import ErrorBoundary from "../Components/ErrorBoundary";
import { FaCog, FaBars, FaTimes, FaPlus } from "react-icons/fa";

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const loggedInUser = user?.username || "Anonymous";
  const backendBaseUrl = "http://localhost:5096"; // replace with your backend URL
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState("light");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef();

  const themeColors = {
    light: {
      mainBg: "linear-gradient(135deg, #F4F4F9, #E8FFD7)",
      cardBg: "#FFFFFF",
      headerFooterBg: "#043d1eff",
      text: "#1C1C1C",
      buttonBg: "#1d7c05ff",
      buttonText: "#fff",
      inputBg: "#fff",
    },
    dark: {
      mainBg: "#121212",
      cardBg: "#1E1E1E",
      headerFooterBg: "#1a1a1a",
      text: "#EEE",
      buttonBg: "#1d7c05ff",
      buttonText: "#fff",
      inputBg: "#2a2a2a",
    },
  };
  const colors = mode === "light" ? themeColors.light : themeColors.dark;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/Posts/${id}`);
        const data = res.data;

        setTitle(data.title || "");
        const textBlocks = data.content
          ? data.content.split("\n\n").map((t, idx) => ({
              blockType: "text",
              textContent: t,
              imageUrlOrBase64: "",
              displayOrder: idx,
            }))
          : [];

        const imageBlocks = (data.images || []).map((img, idx) => ({
          blockType: "image",
          textContent: "",
          imageUrlOrBase64: img.url.startsWith("http")
            ? img.url
            : `${backendBaseUrl}/${img.url}`, // prepend base URL
          displayOrder: textBlocks.length + idx,
        }));

        setBlocks([...textBlocks, ...imageBlocks]);
      } catch (err) {
        console.error("Failed to fetch post:", err);
        alert("Failed to load post for editing.");
      }
    };
    fetchPost();
  }, [id]);

  useEffect(() => {
    document.body.style.background = colors.mainBg;
  }, [mode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleSubmit = async () => {
  if (!title.trim()) return alert("Title cannot be empty!");
  setIsSubmitting(true);

  try {
    const formData = new FormData();
    formData.append("title", title);

    // Only text content
    const content = blocks
      .filter((b) => b.blockType === "text")
      .map((b) => b.textContent)
      .join("\n\n");
    formData.append("content", content);

    // Only new images (base64)
    blocks
      .filter((b) => b.blockType === "image" && b.imageUrlOrBase64.startsWith("data:"))
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

    await api.put(`/Posts/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });

    alert("Post updated successfully!Sent for Editor Approval.");
    navigate("/home");
  } catch (err) {
    console.error("Error updating post:", err.response?.data || err);
    alert("Failed to update post.");
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* NAVBAR */}
      <nav style={{ backgroundColor: colors.headerFooterBg, color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px" }}>
        <div style={{ fontWeight: "bold", fontSize: "1.5rem", cursor: "pointer" }} onClick={() => navigate("/home")}>
          ApnaBlog
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
          <FaCog onClick={() => setDropdownOpen(!dropdownOpen)} style={{ cursor: "pointer", fontSize: "1.3rem" }} />
          {dropdownOpen && (
            <div ref={dropdownRef} style={{ position: "absolute", top: "35px", right: 0, backgroundColor: colors.cardBg, color: colors.text, borderRadius: "8px", padding: "8px", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>
              <div onClick={() => navigate("/profile")} style={{ padding: "6px", cursor: "pointer" }}>Profile</div>
              <div onClick={() => setMode(mode === "light" ? "dark" : "light")} style={{ padding: "6px", cursor: "pointer" }}>Toggle Mode</div>
            </div>
          )}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, display: "flex", justifyContent: "center", padding: "20px" }}>
        <div style={{ width: "100%", maxWidth: "700px", backgroundColor: colors.cardBg, color: colors.text, padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <h2>Edit Post</h2>
          <input
            type="text"
            placeholder="Post Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${colors.buttonBg}`, marginBottom: "16px", backgroundColor: colors.inputBg, color: colors.text }}
          />

          {blocks.map((block, idx) => (
            <div key={idx} style={{ border: `1px solid ${colors.buttonBg}`, backgroundColor: colors.inputBg, padding: "12px", borderRadius: "10px", marginBottom: "16px" }}>
              <ErrorBoundary>
                {block.blockType === "text" && (
                  <ReactQuill value={block.textContent} onChange={(val) => handleTextChange(val, idx)} placeholder="Write your content here..." />
                )}
              </ErrorBoundary>

              {block.blockType === "image" && block.imageUrlOrBase64 && (
                <img src={block.imageUrlOrBase64} alt="preview" style={{ width: "100%", marginTop: "8px", borderRadius: "8px" }} />
              )}

              <div style={{ marginTop: "8px", display: "flex", gap: "8px", alignItems: "center" }}>
                <input type="file" accept="image/*" onChange={(e) => handleAddImage(e, idx)} />
              </div>
            </div>
          ))}

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px" }}>
            <button onClick={handleAddBlock} style={{ backgroundColor: colors.buttonBg, color: colors.buttonText, padding: "10px 20px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
              <FaPlus /> Add Block
            </button>
            <button onClick={handleSubmit} disabled={isSubmitting} style={{ backgroundColor: colors.buttonBg, color: colors.buttonText, padding: "10px 20px", borderRadius: "8px" }}>
              {isSubmitting ? "Updating..." : "Update Post"}
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
     <footer
  style={{
    padding: "1rem 2rem",
    backgroundColor: colors.headerFooterBg, // use 'colors' so dark/light mode works
    color: "#fff",
    textAlign: "center",
    marginTop: "auto",
    display: "flex",
    justifyContent: "center",
    gap: "1.5rem",
    flexWrap: "wrap",
  }}
>
  <div>© 2025 ApnaBlog</div>
</footer>

    </div>
  );
}
