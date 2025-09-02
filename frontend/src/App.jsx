import React, { useState } from "react";
import AuthModal from "./Components/AuthModal";

export default function App() {
  const [showModal, setShowModal] = useState(false);

  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  return (
    <div>
      <nav>
        <button onClick={handleOpen}>Start Reading</button>
        <button onClick={handleOpen}>Get Started</button>
        <button onClick={handleOpen}>Sign In</button>
        <button onClick={handleOpen}>Write</button>
      </nav>

      <AuthModal show={showModal} onClose={handleClose} />
    </div>
  );
}
