import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import api from "../api";
import ErrorBoundary from "../Components/ErrorBoundary";
import { FaCog, FaBars, FaTimes, FaTrash } from "react-icons/fa";

export default function EditPost() {
  const { id } = useParams(); // Post ID from URL
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const loggedInUser = user?.username || "Anonymous";

  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState("light");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef();

  const themeColors = {
    light: {
      mainBg: "#F4F4F9",
      cardBg: "#FFFFFF",
      headerFooterBg: "#043d1eff",
      text: "#1C1C1C",
      buttonBg: "#1d7c05ff",
      buttonText: "#fff",
      inputBg: "#fff",
    },
    dark: {
      mainBg: "#123524",
      cardBg: "#3E7B27",
      headerFooterBg: "#1a1a1a",
      text: "#EEE",
      buttonBg: "#1d7c05ff",
      buttonText: "#fff",
      inputBg: "#2a2a2a",
    },
  };
  const colors = themeColors[mode];

  // Fetch existing post
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/Posts/${id}`);
        const data = res.data;

        setTitle(data.title || "");
        // Build blocks from content + images
        const textBlocks = data.content ? data.content.split("\n\n").map((t, idx) => ({
          blockType: "text",
          textContent: t,
          imageUrlOrBase64: "",
          displayOrder: idx,
        })) : [];

        const imageBlocks = (data.images || []).map((img, idx) => ({
          blockType: "image",
          textContent: "",
          imageUrlOrBase64: img.url, // assuming backend returns image URLs
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
    document.body.style.backgroundColor = colors.mainBg;
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

  const handleDeleteBlock = (index) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Title cannot be empty!");
      return;
    }

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
        .filter((b) => b.blockType === "image" && b.imageUrlOrBase64)
        .forEach((b, idx) => {
          const arr = b.imageUrlOrBase64.split(",");
          if (arr.length < 2) return; // skip existing URLs
          const mime = arr[0].match(/:(.*?);/)[1];
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) u8arr[n] = bstr.charCodeAt(n);
          const file = new Blob([u8arr], { type: mime });
          formData.append("images", file, `image${idx}.png`);
        });

      // PUT update post
      await api.put(`/Posts/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      alert( "Post submitted successfully! It will be published after editor approval.");
      navigate("/home");
    } catch (err) {
      console.error("Error updating post:", err);
      alert("Failed to update post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-post-container">
      {/* NAVBAR */}
      <nav className="navbar" style={{ backgroundColor: colors.headerFooterBg }}>
        <div className="nav-left" onClick={() => navigate("/home")}>
          <span className="logo">ApnaBlog</span>
        </div>

        <div className="nav-right">
          <FaCog
            className="settings-icon"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            ref={dropdownRef}
          />
          {dropdownOpen && (
            <div
              className="dropdown"
              style={{
                backgroundColor: colors.cardBg,
                color: colors.text,
                border: `1px solid ${colors.buttonBg}`,
              }}
            >
              <div onClick={() => navigate("/profile")}>Profile</div>
              <div onClick={() => setMode(mode === "light" ? "dark" : "light")}>Toggle Mode</div>
            </div>
          )}
        </div>

        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {menuOpen && (
          <div className="mobile-menu" style={{ backgroundColor: colors.cardBg, color: colors.text }}>
            <div onClick={() => navigate("/profile")}>Profile</div>
            <div onClick={() => setMode(mode === "light" ? "dark" : "light")}>Toggle Mode</div>
          </div>
        )}
      </nav>

      {/* MAIN CONTENT */}
      <main className="main">
        <div className="post-card" style={{ backgroundColor: colors.cardBg, color: colors.text }}>
          <h2>Edit Post</h2>

          <div className="title-row">
            <input
              type="text"
              placeholder="Post Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                backgroundColor: colors.inputBg,
                color: colors.text,
                border: `1px solid ${colors.buttonBg}`,
              }}
            />
          </div>

          {blocks.map((block, idx) => (
            <div
              className="block"
              key={idx}
              style={{ border: `1px solid ${colors.buttonBg}`, backgroundColor: colors.inputBg }}
            >
              <ErrorBoundary>
                {block.blockType === "text" && (
                  <ReactQuill
                    value={block.textContent}
                    onChange={(value) => handleTextChange(value, idx)}
                    placeholder="Write your content here..."
                  />
                )}
              </ErrorBoundary>

              {block.blockType === "image" && block.imageUrlOrBase64 && (
                <img src={block.imageUrlOrBase64} alt="preview" />
              )}

              <div className="block-actions">
                <input type="file" accept="image/*" onChange={(e) => handleAddImage(e, idx)} />
                <button
                  type="button"
                  onClick={() => handleDeleteBlock(idx)}
                  style={{ backgroundColor: "red", color: "#fff", marginLeft: "8px", border: "none", padding: "6px", borderRadius: "4px" }}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}

          <div className="button-row">
            <button
              onClick={handleAddBlock}
              style={{ backgroundColor: colors.buttonBg, color: colors.buttonText }}
            >
              + Add Block
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ backgroundColor: colors.buttonBg, color: colors.buttonText }}
            >
              {isSubmitting ? "Updating..." : "Update Post"}
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="footer" style={{ backgroundColor: colors.headerFooterBg }}>
        © 2025 ApnaBlog
      </footer>

      {/* STYLES */}
      <style>{`
        /* Copy the styles from CreatePost.js */
      `}</style>
    </div>
  );
}
