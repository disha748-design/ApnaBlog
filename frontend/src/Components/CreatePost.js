import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import api from "../api";
import ErrorBoundary from "../Components/ErrorBoundary";
import { FaCog, FaBars, FaTimes } from "react-icons/fa";

export default function CreatePost() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const loggedInUser = user?.username || "Anonymous";

  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState([
    { blockType: "text", textContent: "", imageUrlOrBase64: "", displayOrder: 0 },
  ]);
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
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        const file = new Blob([u8arr], { type: mime });
        formData.append("images", file, `image${idx}.png`);
      });

    // Submit post (status pending by default)
    await api.post("/Posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });

    alert("Post submitted successfully! It will be published after editor approval.");

    // Reset form
    setTitle("");
    setBlocks([{ blockType: "text", textContent: "", imageUrlOrBase64: "", displayOrder: 0 }]);

    // Stay on same page or redirect to "My Posts" page
    navigate("/home"); // or navigate("/my-posts") if you have that page

  } catch (err) {
    console.error("Error creating post:", err);
    alert("Error submitting post. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};


  const generateTitle = async () => {
    try {
      const contentText = blocks
        .filter((b) => b.blockType === "text")
        .map((b) => b.textContent)
        .join("\n\n");

      if (!contentText.trim()) {
        alert("Please write some content first to generate a title.");
        return;
      }

      const res = await api.post("/Title/generate", { content: contentText });
      const data = res.data;

      if (data.title) {
        const cleanTitle = data.title.replace(/^["']|["']$/g, "").trim();
        setTitle(cleanTitle);
      } else {
        alert("AI did not return a valid title.");
      }
    } catch (err) {
      console.error("Error generating title:", err);
      alert("Failed to generate title.");
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

        {/* Hamburger */}
        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* Mobile Menu */}
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
          <h2>Create a New Post</h2>

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
            <button
              type="button"
              onClick={generateTitle}
              style={{ backgroundColor: colors.buttonBg, color: colors.buttonText }}
            >
              Generate AI Title
            </button>
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

              <div className="image-upload">
                <input type="file" accept="image/*" onChange={(e) => handleAddImage(e, idx)} />
                {block.imageUrlOrBase64 && block.blockType === "image" && (
                  <img src={block.imageUrlOrBase64} alt="preview" />
                )}
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
              {isSubmitting ? "Publishing..." : "Publish Post"}
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
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    color: #fff;
    position: fixed;        /* ✅ Stick header */
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    box-sizing: border-box; /* ✅ Ensures padding doesn’t overflow */

  }
  .logo {
    font-weight: bold;
    cursor: pointer;
  }
  .nav-right {
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
  }
  .settings-icon { cursor: pointer; font-size: 1.3rem; }
  .dropdown {
    position: absolute;
    right: 0;
    margin-top: 8px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    min-width: 150px;
    z-index: 100;
  }
  .dropdown div, .mobile-menu div {
    padding: 10px 14px;
    cursor: pointer;
    border-bottom: 1px solid rgba(200,200,200,0.3);
  }
  .hamburger {
    display: none;
    font-size: 1.5rem;
    cursor: pointer;
  }
  .mobile-menu {
    display: none;
    flex-direction: column;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    position: absolute;
    top: 60px;
    right: 10px;
    z-index: 200;
  }

  .main {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 1rem;
    margin-top: 70px;   /* ✅ Below header */
    margin-bottom: 60px; /* ✅ Above footer */
  }
  .post-card {
    width: 100%;
    max-width: 900px;
    padding: 1rem;
    border-radius: 12px;
    box-shadow: 0 6px 16px rgba(0,0,0,0.1);
    transition: background 0.3s, color 0.3s;
  }
  .title-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }
  .title-row input {
    flex: 1;
    padding: 10px;
    border-radius: 8px;
    font-size: 1rem;
    min-width: 200px;
    border: 1px solid #ccc;
  }
  .title-row button {
    padding: 10px 14px;
    border-radius: 8px;
    font-weight: bold;
    border: none;
    cursor: pointer;
    flex-shrink: 0;
  }
  .block {
    margin-bottom: 24px;
    padding: 12px;
    border-radius: 10px;
    transition: background 0.3s;
  }
  .block img {
    max-width: 100%;
    margin-top: 8px;
    border-radius: 8px;
  }
  .button-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  .button-row button {
    flex: 1;
    padding: 12px;
    border-radius: 8px;
    border: none;
    font-weight: bold;
    cursor: pointer;
  }

  /* ✅ FIXED FOOTER */
  .footer {
    padding: 1rem;
    text-align: center;
    color: #fff;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    font-size: 0.9rem;
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .nav-right {
      display: none;
    }
    .hamburger {
      display: block;
    }
    .mobile-menu {
      display: flex;
      width: 200px;
    }
    .title-row {
      flex-direction: column;
    }
    .title-row button {
      width: 100%;
    }
    .button-row {
      flex-direction: column;
    }
    .button-row button {
      width: 100%;
    }
  }
`}</style>

    </div>
  );
}
