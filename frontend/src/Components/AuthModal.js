import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const AuthModal = ({ show, onClose }) => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
    requestedRole: "User", // default
  });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!show) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    try {
      if (isRegister) {
        await api.post("/Auth/register", formData);
        // Show custom success message
        setSuccessMsg(
          "Registration successful! Your account has been sent for admin approval."
        );
        setIsRegister(false); // switch to login mode if desired
      } else {
        const res = await api.post("/Auth/login", {
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem("token", res.data.token);
        navigate("/profile");
        onClose();
      }
    } catch (err) {
      console.error(err);

      let message = "Something went wrong";

      if (Array.isArray(err.response?.data)) {
        message = err.response.data.map((e) => e.description).join(", ");
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (typeof err.response?.data === "string") {
        message = err.response.data;
      } else {
        message = err.message;
      }

      setError(message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          {isRegister ? "Register" : "Login"}
        </h2>

        {error && (
          <p className="text-red-600 text-sm mb-3 whitespace-pre-line">{error}</p>
        )}

        {successMsg && (
          <p className="text-green-600 text-sm mb-3 whitespace-pre-line">{successMsg}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <input
              type="text"
              name="displayName"
              placeholder="Display Name"
              value={formData.displayName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />

          {isRegister && (
            <select
              name="requestedRole"
              value={formData.requestedRole}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="User">User</option>
              <option value="Editor">Editor</option>
            </select>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        <p className="mt-3 text-sm text-gray-600 text-center">
          {isRegister ? "Already have an account?" : "Don’t have an account?"}{" "}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-green-600 underline"
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>

        <button
          onClick={onClose}
          className="mt-4 text-gray-500 hover:text-gray-700 w-full"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
