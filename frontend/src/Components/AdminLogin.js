import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

export default function AdminLogin() {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5096/api/Auth/login",
        { email, password },
        { withCredentials: true } // send/receive cookie
      );

      // Save user info in context and localStorage
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));

      // Navigate based on role
      if (res.data.role === "Admin") navigate("/admin-dashboard");
      else if (res.data.role === "Editor") navigate("/editor-dashboard");
      else alert("Unauthorized role");

    } catch (err) {
      alert("Login failed: " + (err.response?.data || err.message));
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br/><br/>
        <input
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br/><br/>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
