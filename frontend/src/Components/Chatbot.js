import React, { useState } from "react";
import api from "../api"; // import the axios instance

const Chatbot = ({ blogContent }) => {
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState([]);

  const askQuestion = async () => {
    if (!question.trim()) return;

    const userMsg = { sender: "user", text: question };
    setChat([...chat, userMsg]);

    try {
      const res = await api.post("/chat/ask", {
        blogContent,
        question,
      });

      const botMsg = { sender: "bot", text: res.data.response };
      setChat((prev) => [...prev, botMsg]);
    } catch (err) {
      const botMsg = { sender: "bot", text: "⚠️ Something went wrong." };
      setChat((prev) => [...prev, botMsg]);
      console.error(err); // log error for debugging
    }

    setQuestion("");
  };

  return (
    <div className="chatbot">
      <div className="chat-window">
        {chat.map((msg, i) => (
          <div key={i} className={msg.sender}>
            <b>{msg.sender}:</b> {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about this blog..."
        />
        <button onClick={askQuestion}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;
