import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 👈 for redirect
import api from "../api"; // your axios instance

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const navigate = useNavigate();

  const fetchPendingUsers = async () => {
    try {
      const res = await api.get("/Admin/pending-users");
      setPendingUsers(res.data);
    } catch (err) {
      alert("Error fetching users: " + (err.response?.data || err.message));
    }
  };

  const approveUser = async (userId) => {
    try {
      await api.post(`/Admin/approve/${userId}`);
      alert("User approved!");
      fetchPendingUsers();
    } catch (err) {
      alert("Approve failed: " + (err.response?.data || err.message));
    }
  };

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
    localStorage.removeItem("token"); // 👈 clear token (or sessionStorage)
    navigate("/"); // 👈 redirect to landing page
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="header">
        <h1>Admin Panel</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>{u.displayName || "No name"}</td>
                    <td className="actions">
                      <button
                        className="approve-btn"
                        onClick={() => approveUser(u.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => rejectUser(u.id)}
                      >
                        Reject
                      </button>
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
        <p>© 2025 Admin Dashboard</p>
      </footer>

      {/* Inline CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

        .admin-dashboard {
          font-family: 'Poppins', sans-serif;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: #E8FFD7;
          color: #2E2E2E;
        }

        .header {
          background-color: #3E5F44;
          color: #fff;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logout-btn {
          background-color: #e74c3c;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s ease;
        }
        .logout-btn:hover {
          background-color: #c0392b;
        }

        .main-section {
          flex: 1;
          padding: 2rem;
        }

        h1 {
          margin: 0;
          font-size: 1.8rem;
          font-weight: 700;
        }

        h2 {
          margin-bottom: 1.5rem;
          font-size: 1.4rem;
          font-weight: 600;
          color: #3E5F44;
        }

        .empty {
          font-size: 1rem;
          color: #5E936C;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .user-table {
          width: 100%;
          border-collapse: collapse;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .user-table th, .user-table td {
          padding: 0.75rem 1rem;
          text-align: left;
          font-size: 0.95rem;
          border-bottom: 1px solid #eee;
        }

        .user-table th {
          background-color: #93DA97;
          font-weight: 600;
        }

        .user-table tr:hover {
          background-color: #f5fff5;
        }

        .actions {
          display: flex;
          gap: 0.5rem;
        }

        .approve-btn, .reject-btn {
          padding: 0.4rem 0.9rem;
          border: none;
          border-radius: 6px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: background 0.2s ease;
          font-weight: 600;
        }

        .approve-btn {
          background-color: #5E936C;
          color: #fff;
        }
        .approve-btn:hover {
          background-color: #497454;
        }

        .reject-btn {
          background-color: #e74c3c;
          color: #fff;
        }
        .reject-btn:hover {
          background-color: #c0392b;
        }

        .footer {
          background-color: #3E5F44;
          color: #fff;
          padding: 1rem;
          text-align: center;
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          h1 { font-size: 1.4rem; }
          h2 { font-size: 1.2rem; }
          .user-table th, .user-table td {
            font-size: 0.85rem;
            padding: 0.6rem;
          }
        }
      `}</style>
    </div>
  );
}
