import React, { useState, useContext, useEffect } from "react";
import { JSEncrypt } from "jsencrypt";
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
  const [publicKey, setPublicKey] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fetch RSA public key once
  useEffect(() => {
    const fetchKey = async () => {
      try {
        const res = await api.get("/Auth/rsa-public");

        // 🔑 Clean the key: replace \r\n or \r with \n
        const cleanedKey = res.data.publicKey.replace(/\r\n|\r/g, '\n').trim();

        setPublicKey(cleanedKey);
      } catch (err) {
        console.error("Failed to fetch RSA public key", err);
        setError("Encryption service unavailable.");
      }
    };
    fetchKey();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!publicKey) {
        setError("Encryption service unavailable. Please try again later.");
        return;
      }

      // 🔐 Encrypt password
      const encryptor = new JSEncrypt();
      encryptor.setPublicKey(publicKey);
      const encryptedPassword = encryptor.encrypt(formData.password);
      console.log("PublicKey:", publicKey);
      console.log("Encrypted Password:", encryptedPassword);

      if (!encryptedPassword) {
        setError("Password encryption failed.");
        return;
      }

      // API endpoint & payload
      const url = isRegister ? "/Auth/register" : "/Auth/login";
      const payload = isRegister
        ? { ...formData, password: encryptedPassword }
        : { email: formData.email, password: encryptedPassword };

      const res = await api.post(url, payload, { withCredentials: true });
      const user = res.data;

      if (isRegister) {
        // ✅ Registration success
        setIsRegister(false);
        setFormData({
          displayName: "",
          email: "",
          password: "",
          requestedRole: "User",
        });
        setSuccess("✅ Registration successful! Waiting for admin approval.");
      } else {
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
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          (typeof err.response?.data === "string"
            ? err.response.data
            : err.message)
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
        <button onClick={onClose} style={styles.closeBtn}>
          ✕
        </button>
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
          <button
            type="submit"
            style={styles.submitBtn}
            disabled={loading || !publicKey}
          >
            {loading
              ? "Please wait..."
              : !publicKey
              ? "Loading encryption..."
              : isRegister
              ? "Register"
              : "Login"}
          </button>
        </form>

        <p style={{ marginTop: "1rem", textAlign: "center" }}>
          {isRegister ? "Already have an account?" : "New here?"}{" "}
          <span
            style={{
              color: "#5E936C",
              cursor: "pointer",
              fontWeight: "bold",
            }}
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setSuccess("");
              setFormData({
                displayName: "",
                email: "",
                password: "",
                requestedRole: "User",
              });
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
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "15px",
    width: "400px",
    maxWidth: "90%",
    position: "relative",
    boxShadow: "0 5px 25px rgba(0,0,0,0.35)",
  },
  closeBtn: {
    position: "absolute",
    top: "10px",
    right: "10px",
    border: "none",
    background: "transparent",
    fontSize: "1.3rem",
    cursor: "pointer",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    marginTop: "1rem",
  },
  input: {
    padding: "0.7rem",
    borderRadius: "10px",
    border: "1px solid #ccc",
  },
  submitBtn: {
    background: "#5E936C",
    color: "white",
    padding: "0.8rem",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1rem",
  },
};

export default UserEditorAuthModal;
