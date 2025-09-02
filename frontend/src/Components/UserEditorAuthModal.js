import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../AuthContext";

const UserEditorAuthModal = ({ onClose }) => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [isRegister, setIsRegister] = useState(true);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    requestedRole: "User",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const url = isRegister ? "/Auth/register" : "/Auth/login";
      const payload = isRegister
        ? formData
        : { email: formData.email, password: formData.password };

      const res = await api.post(url, payload, { withCredentials: true });
      const user = res.data;

      if (isRegister) {
        // Registration success
        setIsRegister(false);
        setFormData({
          displayName: "",
          email: "",
          password: "",
          requestedRole: "User",
        });
        setError("✅ Registration successful! Waiting for admin approval.");
      } else {
        // Login logic
       
  // Login logic
  if (user.role?.toLowerCase() !== "admin" && user.isApproved === false) {
    setError("⏳ Waiting for admin approval.");
    return;
  }

  setUser(user);
  localStorage.setItem("user", JSON.stringify(user));
  setSuccess("✅ Logged in successfully!");
  onClose();

  const role = user.role?.toLowerCase();
  switch (role) {
    case "editor":
      navigate("/editor-dashboard", { replace: true });
      break;
    case "user":
    default:
      navigate("/home", { replace: true });
  }
}
onClose();

      }
    catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeBtn}>✕</button>
        <h2>{isRegister ? "Create Account" : "Login"}</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {isRegister && (
            <>
              <input
                type="text"
                name="displayName"
                placeholder="Full Name"
                value={formData.displayName}
                onChange={handleChange}
                required
                style={styles.input}
              />
              <select
                name="requestedRole"
                value={formData.requestedRole}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="User">User</option>
                <option value="Editor">Editor</option>
              </select>
            </>
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
          </button>
        </form>

        <p style={{ marginTop: "1rem", textAlign: "center" }}>
          {isRegister ? "Already have an account?" : "New here?"}{" "}
          <span
            style={{ color: "#5E936C", cursor: "pointer", fontWeight: "bold" }}
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setSuccess("");
              setFormData({ displayName: "", email: "", password: "", requestedRole: "User" });
            }}
          >
            {isRegister ? "Login" : "Register"}
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000,
  },
  modal: {
    background: "#fff", padding: "2rem", borderRadius: "15px", width: "400px",
    maxWidth: "90%", position: "relative", boxShadow: "0 5px 25px rgba(0,0,0,0.35)",
  },
  closeBtn: {
    position: "absolute", top: "10px", right: "10px",
    border: "none", background: "transparent", fontSize: "1.3rem", cursor: "pointer",
  },
  form: { display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" },
  input: { padding: "0.7rem", borderRadius: "10px", border: "1px solid #ccc" },
  submitBtn: { background: "#5E936C", color: "white", padding: "0.8rem", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "1rem" },
};

export default UserEditorAuthModal;
