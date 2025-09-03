import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { FaUserCircle } from "react-icons/fa";
import "./UserProfile.css";

export default function UserProfile() {
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [about, setAbout] = useState("");
  const [preferences, setPreferences] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    mostViewed: { id: null, title: "N/A" },
    mostCommented: { id: null, title: "N/A" },
    mostLiked: { id: null, title: "N/A" },
  });
  const [tips, setTips] = useState([]);
  const [loadingTips, setLoadingTips] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Fetch profile and stats
  const fetchProfile = async () => {
    try {
      const res = await api.get("/UserProfile/me");
      setDisplayName(res.data.displayName || "");
      setEmail(res.data.email || "");
      setAbout(res.data.about || "");
      setPreferences(res.data.preferences ? JSON.parse(res.data.preferences) : []);
      setProfileImage(res.data.profileImageUrl || null);

      const statsRes = await api.get("/UserStats/me");
      const data = statsRes.data;
      setStats({
        totalPosts: data.totalPosts,
        mostViewed: { id: data.mostViewedPost?.id || null, title: data.mostViewedPost?.title || "N/A" },
        mostCommented: { id: data.mostCommentedPost?.id || null, title: data.mostCommentedPost?.title || "N/A" },
        mostLiked: { id: data.mostLikedPost?.id || null, title: data.mostLikedPost?.title || "N/A" },
      });
    } catch (err) {
      console.error("Failed to fetch profile or stats:", err);
      navigate("/login");
    }
  };

  // Fetch tips from Cohere
  const fetchTips = async () => {
    setLoadingTips(true);
    try {
      const res = await api.get("/BlogInsights/tips", { withCredentials: true });
      setTips(res.data.tips.split("\n").filter(t => t.trim()));
    } catch (err) {
      console.error("Failed to fetch tips:", err);
      setTips(["Failed to load tips."]);
    } finally {
      setLoadingTips(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchTips();
  }, [navigate]);

  // Preference handlers
  const handlePreferenceChange = (i, value) => {
    const newPrefs = [...preferences];
    newPrefs[i] = value;
    setPreferences(newPrefs);
  };
  const addPreference = () => setPreferences([...preferences, ""]);
  const removePreference = (i) => setPreferences(preferences.filter((_, idx) => idx !== i));

  // Profile image change
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setPreviewImage(URL.createObjectURL(e.target.files[0]));
      setProfileImage(e.target.files[0]);
    }
  };

  // Save profile
  const handleSave = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("AboutMe", about);
      formData.append("Preferences", JSON.stringify(preferences));
      if (previewImage) formData.append("ProfileImage", profileImage);

      await api.put("/UserProfile/me", formData, { headers: { "Content-Type": "multipart/form-data" } });

      setSuccessMsg("✅ Profile updated!");
      setIsEditing(false);
      setPreviewImage(null);

      await fetchProfile();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await api.post("/Auth/logout");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div style={{
      fontFamily: "'Georgia', serif",
      background: "linear-gradient(135deg, #F4F4F9, #E8FFD7)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Header */}
      <header style={{ padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#043D1E", color: "#fff" }}>
        <div style={{ fontWeight: "bold", fontSize: "1.5rem", cursor: "pointer" }} onClick={() => navigate("/home")}>ApnaBlog</div>
        <button onClick={handleLogout} style={{ background: "#5E936C", border: "none", padding: "0.5rem 1rem", borderRadius: "8px", color: "#fff", cursor: "pointer", fontWeight: "500" }}>Logout</button>
      </header>

      {/* Main Content */}
      <main style={{
        flexGrow: 1,
        width: "90%",
        maxWidth: "1000px",
        margin: "2rem auto",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem"
      }}>
        <h2 style={{ textAlign: "center", color: "#3E5F44" }}>Welcome back, {displayName} 👋</h2>

        <div className="profile-grid">
          {/* Avatar */}
          <div className="profile-card center-card">
            {previewImage ? (
              <img src={previewImage} alt="Profile Preview" className="profile-preview" />
            ) : profileImage ? (
              <img src={profileImage.startsWith("http") ? profileImage : `http://localhost:5096${profileImage}`} alt="Profile" className="profile-preview" />
            ) : (
              <FaUserCircle size={120} className="profile-icon" />
            )}
            <h3 className="profile-username">{displayName}</h3>
            <p className="profile-email">{email}</p>
          </div>

          {/* About & Preferences */}
          <div className="profile-card about-card">
            <h3 className="section-title">📝 About Me & 🎯 Preferences</h3>
            {!isEditing ? (
              <div className="display-section">
                <p>💬 <strong>About Me:</strong> {about || "N/A"}</p>
                <p>✨ <strong>Preferences:</strong> {preferences.length > 0 ? preferences.join(", ") : "N/A"}</p>
                <button onClick={() => setIsEditing(true)} className="edit-btn">✎ Edit</button>
              </div>
            ) : (
              <div className="edit-section">
                <div className="profile-row">
                  <div className="cell-label">💬 About Me:</div>
                  <div className="cell-content">
                    <textarea value={about} onChange={(e) => setAbout(e.target.value)} className="textarea" />
                  </div>
                </div>

                <div className="profile-row">
                  <div className="cell-label">✨ Preferences:</div>
                  <div className="cell-content">
                    {preferences.map((p, i) => (
                      <div key={i} className="pref-row">
                        <input value={p} onChange={(e) => handlePreferenceChange(i, e.target.value)} className="input" />
                        <button onClick={() => removePreference(i)} className="remove-btn">✖</button>
                      </div>
                    ))}
                    <button onClick={addPreference} className="add-btn">+ Add Preference</button>
                  </div>
                </div>

                <div className="profile-row">
                  <div className="cell-label">🖼️ Profile Image:</div>
                  <div className="cell-content">
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                  </div>
                </div>

                <button onClick={handleSave} disabled={loading} className="save-btn">{loading ? "Saving..." : "Save Changes"}</button>
              </div>
            )}
            {successMsg && <p className="success-msg">{successMsg}</p>}
          </div>

          {/* Stats */}
          <div className="profile-card stats-card">
            <h3 className="section-title">📊 My Blog Stats</h3>
            <p>📝 Posts Created: {stats.totalPosts}</p>
            <p>👀 Most Viewed: {stats.mostViewed.id ? <Link to={`/posts/${stats.mostViewed.id}`} className="post-link">{stats.mostViewed.title}</Link> : stats.mostViewed.title}</p>
            <p>💬 Most Commented: {stats.mostCommented.id ? <Link to={`/posts/${stats.mostCommented.id}`} className="post-link">{stats.mostCommented.title}</Link> : stats.mostCommented.title}</p>
            <p>👍 Most Liked: {stats.mostLiked.id ? <Link to={`/posts/${stats.mostLiked.id}`} className="post-link">{stats.mostLiked.title}</Link> : stats.mostLiked.title}</p>
          </div>

          {/* Tips */}
          <div className="profile-card insights-card">
            <h3 className="section-title">💡 Blog Growth Tips</h3>
            {loadingTips ? (
              <p>Loading tips...</p>
            ) : (
              <ul style={{ paddingLeft: "1rem" }}>
                {tips.map((tip, idx) => <li key={idx}>{tip}</li>)}
              </ul>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        © 2025 ApnaBlog. All rights reserved.
      </footer>
    </div>
  );
}
