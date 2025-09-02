import React from "react";
import { useNavigate } from "react-router-dom";
import "./HelpPage.css";

export default function HelpPage() {
  const navigate = useNavigate();

  return (
    <div className="help-wrapper">
      {/* Header */}
      <header className="help-header">
        <div className="logo" onClick={() => navigate("/home")}>
          ApnaBlog
        </div>
      </header>

      {/* Content */}
      <main className="help-main">
        <h1>Help Center</h1>
        <p className="intro">
          Need assistance? You're in the right place! Explore our guides to make
          your blogging experience smooth and enjoyable.
        </p>

        <div className="help-grid">
          <div className="help-card">
            <h3>Creating a Post</h3>
            <p>
              Click on the <strong>"Write"</strong> button in the header to start
              your blog. Add text, images, and format your content with ease.
              Once ready, hit <em>Publish</em> to share with the world.
            </p>
          </div>

          <div className="help-card">
            <h3>Managing Your Profile</h3>
            <p>
              Go to your <strong>Profile</strong> page to update details, change
              your password, or manage your posts. You can also track your
              engagement stats here.
            </p>
          </div>

          <div className="help-card">
            <h3>Community Guidelines</h3>
            <p>
              ApnaBlog is built on respect and creativity. Please be kind, avoid
              spam, and contribute meaningful content to keep our space safe and
              inspiring.
            </p>
          </div>

          <div className="help-card">
            <h3>Need More Support?</h3>
            <p>
              Can’t find what you’re looking for? Reach out to our support team
              via <a href="mailto:support@apnablog.com">support@apnablog.com</a>.
              We’re happy to help!
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="help-footer">© 2025 ApnaBlog</footer>
    </div>
  );
}
