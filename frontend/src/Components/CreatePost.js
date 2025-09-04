import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FaHome, FaUser, FaMagic } from "react-icons/fa";
import api from "../api";
import ErrorBoundary from "../Components/ErrorBoundary";

export default function CreatePost() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const loggedInUser = user?.username || "Anonymous";

  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState([{ blockType: "text", textContent: "", imageUrlOrBase64: "", displayOrder: 0 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageSuggestions, setImageSuggestions] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  const themeColors = {
    headerFooterBg: "#043d1eff",
    mainBg: "linear-gradient(135deg, #F4F4F9, #E8FFD7)",
    cardBg: "#FFFFFF",
    text: "#1C1C1C",
    buttonPrimary: "#1d7c05ff",
    buttonText: "#fff",
  };

  const navBtnStyle = {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "0.95rem",
    color: "#fff",
    padding: 0,
    textDecoration: "none",
  };

  useEffect(() => {
    document.body.style.background = themeColors.mainBg;
    document.body.style.backgroundAttachment = "fixed";
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

  const handleAddSuggestedImage = (url) => {
    setBlocks([...blocks, { blockType: "image", imageUrlOrBase64: url, isUnsplash: true, textContent: "", displayOrder: blocks.length }]);
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

      for (let idx = 0; idx < blocks.length; idx++) {
        const b = blocks[idx];
        if (b.blockType === "image" && b.imageUrlOrBase64) {
          if (b.imageUrlOrBase64.startsWith("data:")) {
            const arr = b.imageUrlOrBase64.split(",");
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) u8arr[n] = bstr.charCodeAt(n);
            const file = new Blob([u8arr], { type: mime });
            formData.append("images", file, `image${idx}.png`);
          } else if (b.isUnsplash) {
            const response = await fetch(b.imageUrlOrBase64);
            const blob = await response.blob();
            formData.append("images", blob, `unsplash${idx}.jpg`);
          } else {
            formData.append("imageUrls", b.imageUrlOrBase64);
          }
        }
      }

      await api.post("/Posts", formData, { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true });
      alert("Post submitted successfully! It will be published after editor approval.");
      setTitle("");
      setBlocks([{ blockType: "text", textContent: "", imageUrlOrBase64: "", displayOrder: 0 }]);
      navigate("/home");
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Error submitting post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateTitle = async () => {
    try {
      const contentText = blocks.filter((b) => b.blockType === "text").map((b) => b.textContent).join("\n\n");
      if (!contentText.trim()) return alert("Write some content first to generate a title.");
      const res = await api.post("/Title/generate", { content: contentText });
      const data = res.data;
      if (data.title) {
        let cleanTitle = data.title.replace(/^["']|["']$/g, "").trim()
          .replace(/^here is (a )?(potential )?blog title( for the content provided)?:\s*/i, "");
        setTitle(cleanTitle);
      } else alert("AI did not return a valid title.");
    } catch (err) {
      console.error("Error generating title:", err);
      alert("Failed to generate title.");
    }
  };

  const fetchImageSuggestions = async () => {
    const contentText = blocks.filter((b) => b.blockType === "text").map((b) => b.textContent).join(" ");
    if (!contentText.trim()) return alert("Add some content first to fetch images.");
    setLoadingImages(true);
    try {
      const res = await api.get(`/ImageSuggestion/image-suggestions?query=${encodeURIComponent(contentText)}`);
      setImageSuggestions(res.data.results || []);
    } catch (err) {
      console.error("Failed to fetch image suggestions:", err);
      alert("Failed to fetch image suggestions.");
    } finally {
      setLoadingImages(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Georgia', serif", minHeight: "100vh", display: "flex", flexDirection: "column", background: themeColors.mainBg }}>
      
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 2rem", backgroundColor: themeColors.headerFooterBg, color: "#fff" }}>
        <div style={{ fontWeight: "bold", fontSize: "1.5rem", cursor: "pointer" }} onClick={() => navigate("/home")}>ApnaBlog</div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button style={navBtnStyle} onClick={() => navigate("/profile")}><FaUser /> Profile</button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "2rem 1rem" }}>
        <div style={{ backgroundColor: themeColors.cardBg, borderRadius: "12px", padding: "2rem", maxWidth: "900px", width: "100%", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h1 style={{ fontSize: "2rem", textAlign: "center", color: themeColors.text }}>Create a New Post</h1>

          {/* Title Input + AI Title */}
          <div className="title-row" style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <input type="text" placeholder="Post Title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: `1px solid ${themeColors.buttonPrimary}` }} />
            <button onClick={generateTitle} className="magic-button"><FaMagic /> AI Title</button>
          </div>

          {/* Content Blocks */}
          {blocks.map((block, idx) => (
            <div key={idx} style={{ border: `1px solid ${themeColors.buttonPrimary}`, borderRadius: "10px", padding: "12px", marginBottom: "1rem", backgroundColor: "#fff", display: "flex", flexDirection: "column", gap: "8px" }}>
              <ErrorBoundary>
                {block.blockType === "text" && <ReactQuill value={block.textContent} onChange={(value) => handleTextChange(value, idx)} placeholder="Write content..." />}
              </ErrorBoundary>
              <input type="file" accept="image/*" onChange={(e) => handleAddImage(e, idx)} />
              {block.imageUrlOrBase64 && <img src={block.imageUrlOrBase64} alt="preview" style={{ maxWidth: "100%", borderRadius: "8px" }} />}
            </div>
          ))}

          {/* Buttons Row */}
          <div className="content-buttons" style={{ display: "flex", gap: "12px", justifyContent: "space-between", flexWrap: "wrap" }}>
            <button onClick={handleAddBlock} style={{ flex: 1, padding: "12px", borderRadius: "8px", backgroundColor: themeColors.buttonPrimary, color: themeColors.buttonText, fontWeight: "bold", cursor: "pointer" }}>+ Add Block</button>
            <button onClick={fetchImageSuggestions} disabled={loadingImages} className="magic-button">
              <FaMagic /> {loadingImages ? "Fetching..." : "AI Images"}
            </button>
          </div>

          {/* Publish */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
            <button onClick={handleSubmit} disabled={isSubmitting} style={{ padding: "12px 24px", borderRadius: "8px", backgroundColor: themeColors.buttonPrimary, color: themeColors.buttonText, fontWeight: "bold", cursor: "pointer", minWidth: "200px" }}>
              {isSubmitting ? "Publishing..." : "Publish Post"}
            </button>
          </div>

          {/* AI Image Suggestions */}
          <div style={{ marginTop: "1rem" }}>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
              {imageSuggestions.map((img) => (
                <img key={img.id} src={img.urls.small} alt={img.alt_description || "AI suggestion"} style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "8px", cursor: "pointer", border: "2px solid transparent" }} onClick={() => handleAddSuggestedImage(img.urls.full)} title="Click to add to post" />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: "1rem 2rem", backgroundColor: themeColors.headerFooterBg, color: "#fff", textAlign: "center" }}>
        © 2025 ApnaBlog
      </footer>

      {/* Magic Button Glow */}
      <style>
        {`
          .magic-button {
            flex: 0 0 140px;
            padding: 10px;
            border-radius: 5px;
            background-color: ${themeColors.buttonPrimary};
            color: #fff;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: box-shadow 0.3s;
          }
          .magic-button:hover {
            box-shadow: 0 0 12px 4px #a0ff92;
          }
          .magic-button:active::after {
            content: '';
            position: absolute;
            width: 120%;
            height: 120%;
            top: -10%;
            left: -10%;
            background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(160,255,146,0) 70%);
            border-radius: 50%;
            animation: sparkle 0.5s forwards;
            pointer-events: none;
          }
          @keyframes sparkle {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
          }

          @media (max-width: 768px) {
            .title-row, .content-buttons {
              flex-direction: column;
              gap: 8px;
            }
            .title-row input, .title-row .magic-button, .content-buttons button {
              flex: 1 1 100% !important;
            }
            h1 { font-size: 1.8rem !important; }
          }
        `}
      </style>
    </div>
  );
}
