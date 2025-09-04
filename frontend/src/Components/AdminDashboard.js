import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch pending users
  const fetchPendingUsers = async () => {
    try {
      const res = await api.get("/Admin/pending-users");
      setPendingUsers(res.data);
    } catch (err) {
      alert("Error fetching users: " + (err.response?.data || err.message));
    }
  };

  // Approve user with role
  const approveUser = async (userId, role) => {
    try {
      await api.post(`/Admin/approve/${userId}?role=${encodeURIComponent(role)}`);
      alert(`User approved as ${role}!`);
      fetchPendingUsers();
    } catch (err) {
      alert("Approve failed: " + (err.response?.data || err.message));
    }
  };

  // Reject user
  const rejectUser = async (userId) => {
    try {
      await api.post(`/Admin/reject/${userId}`);
      alert("User rejected!");
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      alert("Reject failed: " + (err.response?.data || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="header">
        <div className="title">ApnaBlog Admin</div>

        {/* Desktop Menu */}
        <div className="desktop-menu">
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>

        {/* Hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="logout-btn">Logout</button>
        </div>
      )}

      {/* Main Section */}
      <main className="main-section">
        <h2>Pending Users</h2>
        {pendingUsers.length === 0 ? (
          <p className="empty">No pending users 🎉</p>
        ) : (
          <div className="table-wrapper">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Requested Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map((u) => (
                  <tr key={u.id}>
                    <td data-label="Email">{u.email}</td>
                    <td data-label="Name">{u.displayName || "No name"}</td>
                    <td data-label="Requested Role">{u.requestedRole || "user"}</td>
                    <td data-label="Actions" className="actions">
                      <button
                        className="approve-btn"
                        onClick={() => approveUser(u.id, u.requestedRole || "user")}
                      >
                        Approve
                      </button>
                      <button className="reject-btn" onClick={() => rejectUser(u.id)}>Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 ApnaBlog Admin Dashboard</p>
      </footer>

      {/* Styles */}
      <style>{`
        .admin-dashboard { font-family: 'Georgia, serif'; min-height: 100vh; display: flex; flex-direction: column; background: #f7f8fa; color: #333; }
        .header { display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 1.5rem; background: #3E5F44; color: #fff; flex-wrap: wrap; }
        .title { font-size: 1.6rem; font-weight: 700; cursor: pointer; }
        .desktop-menu { display: flex; gap: 0.8rem; }
        .menu-btn, .logout-btn { border: none; border-radius: 8px; padding: 0.4rem 0.8rem; cursor: pointer; font-weight: 600; color: #fff; transition: background 0.2s ease; }
        .menu-btn { background: #5E936C; }
        .menu-btn:hover { background: #497454; }
        .logout-btn { background: #e74c3c; }
        .logout-btn:hover { background: #c0392b; }
        .hamburger { display: none; background: none; border: none; color: #fff; font-size: 1.8rem; cursor: pointer; }
        .mobile-menu { display: flex; flex-direction: column; gap: 0.5rem; padding: 0.8rem 1.5rem; background: #3E5F44; }
        .main-section { flex: 1; padding: 2rem; max-width: 1100px; margin: auto; width: 100%; }
        h2 { margin-bottom: 1.5rem; font-size: 1.6rem; font-weight: 700; color: #3E5F44; }
        .empty { font-size: 1.1rem; color: #5E936C; }
        .table-wrapper { overflow-x: auto; }
        .user-table { width: 100%; border-collapse: separate; border-spacing: 0; border-radius: 12px; overflow: hidden; background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .user-table th, .user-table td { padding: 0.8rem 1rem; text-align: left; font-size: 1rem; }
        .user-table th { background: #93DA97; font-weight: 700; }
        .user-table tr { border-bottom: 1px solid #eee; }
        .user-table tr:hover { background: #f0fff0; }
        .actions { display: flex; gap: 0.5rem; }
        .approve-btn { background: #5E936C; color: #fff; padding: 0.4rem 0.8rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .approve-btn:hover { background: #497454; }
        .reject-btn { background: #e74c3c; color: #fff; padding: 0.4rem 0.8rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .reject-btn:hover { background: #c0392b; }
        .footer { padding: 1rem; text-align: center; font-size: 0.9rem; background: #3E5F44; color: #fff; }

        @media (max-width: 768px) {
          .desktop-menu { display: none; }
          .hamburger { display: block; }
          .user-table thead { display: none; }
          .user-table, .user-table tbody, .user-table tr, .user-table td { display: block; width: 100%; }
          .user-table tr { margin-bottom: 1rem; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border-radius: 12px; padding: 1rem; }
          .user-table td { display: flex; justify-content: space-between; padding: 0.5rem 0; }
          .user-table td::before { content: attr(data-label); font-weight: 700; color: #3E5F44; }
          .actions { justify-content: flex-start; }
        }
      `}</style>
    </div>
  );
}
