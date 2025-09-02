import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);

  const fetchPendingUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5096/api/Admin/pending-users", { withCredentials: true });
      setPendingUsers(res.data);
    } catch (err) {
      alert("Error fetching users: " + err.message);
    }
  };

  const approveUser = async (userId) => {
    try {
      await axios.post(`http://localhost:5096/api/Admin/approve/${userId}`, {}, { withCredentials: true });
      alert("User approved!");
      fetchPendingUsers(); // refresh list
    } catch (err) {
      alert("Approve failed: " + err.message);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>
      <h3>Pending Users</h3>
      <ul>
        {pendingUsers.length === 0 ? (
          <li>No pending users</li>
        ) : (
          pendingUsers.map((u) => (
            <li key={u.id}>
              {u.email} ({u.displayName}) 
              <button onClick={() => approveUser(u.id)}>Approve</button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
