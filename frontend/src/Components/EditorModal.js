import React, { useState } from "react";

export default function EditorModal({ content, onApprove, onReject }) {
  const [checks, setChecks] = useState({
    noMisunderstanding: false,
    noHarmToSociety: false,
    noOffensiveContent: false
  });

  const [hovered, setHovered] = useState({
    noMisunderstanding: false,
    noHarmToSociety: false,
    noOffensiveContent: false
  });

  const handleCheck = (e) => {
    setChecks({ ...checks, [e.target.name]: e.target.checked });
  };

  const handleHover = (name, isHover) => {
    setHovered({ ...hovered, [name]: isHover });
  };

  const allChecked = Object.values(checks).every(Boolean);

  const getCheckStyle = (name) => {
    const checked = checks[name];
    const isHover = hovered[name];
    return {
      background: isHover ? (checked ? "#c3e6cb" : "#f5c6cb") : (checked ? "#d4edda" : "#f8d7da"),
      border: "1px solid",
      borderColor: checked ? "#28a745" : "#dc3545",
      padding: "10px",
      borderRadius: "6px",
      marginBottom: "8px",
      cursor: "pointer",
      transition: "all 0.2s ease"
    };
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "#fff",
        padding: "20px 30px",
        borderRadius: "10px",
        width: "60%",
        maxHeight: "90%",
        overflowY: "auto",
        boxShadow: "0 5px 15px rgba(0,0,0,0.3)"
      }}>
        {/* HEADER */}
        <div style={{
          textAlign: "center",
          marginBottom: "20px",
          padding: "10px 0",
          borderBottom: "2px solid #007bff"
        }}>
          <h2 style={{ color: "#007bff", margin: 0 }}>📝 Editor Page</h2>
          <p style={{ color: "#555", marginTop: "5px", fontStyle: "italic", fontSize: "14px" }}>
            Please review the content carefully before approving
          </p>
        </div>

        {/* Post Preview */}
        <div style={{
          border: "1px solid #ccc",
          padding: "15px",
          borderRadius: "8px",
          background: "#f9f9f9",
          marginBottom: "20px"
        }}>
          <h4>Post Preview</h4>
          <div style={{ whiteSpace: "pre-wrap" }}>{content}</div>
        </div>

        {/* Checklist */}
        <h4 style={{ marginBottom: "10px" }}>Checklist</h4>

        {Object.keys(checks).map((key) => {
          let labelText = "";
          if (key === "noMisunderstanding") labelText = "Content is clear and does not cause misunderstanding";
          if (key === "noHarmToSociety") labelText = "Content does not create conflicts or harm society";
          if (key === "noOffensiveContent") labelText = "Content is free from offensive or sensitive material";

          return (
            <div
              key={key}
              style={getCheckStyle(key)}
              onMouseEnter={() => handleHover(key, true)}
              onMouseLeave={() => handleHover(key, false)}
            >
              <label>
                <input
                  type="checkbox"
                  name={key}
                  checked={checks[key]}
                  onChange={handleCheck}
                  style={{ marginRight: "10px", cursor: "pointer" }}
                />
                {labelText}
              </label>
            </div>
          );
        })}

        {/* Buttons */}
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            onClick={onApprove}
            disabled={!allChecked}
            style={{
              padding: "10px 20px",
              marginRight: "15px",
              borderRadius: "6px",
              border: "none",
              background: allChecked ? "#28a745" : "#ccc",
              color: "#fff",
              fontWeight: "bold",
              cursor: allChecked ? "pointer" : "not-allowed"
            }}
          >
            Approve & Update
          </button>
          <button
            onClick={onReject}
            style={{
              padding: "10px 20px",
              borderRadius: "6px",
              border: "1px solid #6c757d",
              background: "#fff",
              color: "#6c757d",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Reject / Go Back
          </button>
        </div>

        {!allChecked && <p style={{ color: "#dc3545", textAlign: "center", marginTop: "10px" }}>Check all boxes to enable update</p>}
      </div>
    </div>
  );
}
