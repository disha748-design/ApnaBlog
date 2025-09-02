import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";
import api from "../../api";
import styles from "./Header.module.css";

export default function Header({ onSearch, onToggleMode, mode }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post("/api/Auth/logout");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>MyBlog</Link>
      <SearchBar onSearch={onSearch} />
      <div className={styles.actions}>
        <button onClick={onToggleMode} className={styles.modeToggle}>
          {mode === "light" ? "🌞" : "🌙"}
        </button>
        <div className={styles.menuWrapper}>
          <button onClick={() => setMenuOpen(!menuOpen)} className={styles.menuBtn}>⚙️</button>
          {menuOpen && (
            <div className={styles.dropdown}>
              <Link to="/profile">Profile</Link>
              <Link to="/create-post">Create Post</Link>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
