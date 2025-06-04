// components/AdminDashboard.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
  const { user, getAllUsers, deleteUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy danh sách người dùng
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getAllUsers();
        setUsers(usersData);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải danh sách người dùng");
        setLoading(false);
      }
    };

    if (user && user.isAdmin) {
      fetchUsers();
    }
  }, [user, getAllUsers]);

  // Xử lý xóa người dùng
  const handleDelete = async (userId) => {
    if (window.confirm("Bạn có chắc muốn xóa người dùng này?")) {
      try {
        await deleteUser(userId);
        setUsers(users.filter((u) => u._id !== userId));
        alert("Xóa người dùng thành công!");
      } catch (err) {
        alert("Lỗi khi xóa người dùng: " + err.message);
      }
    }
  };

  if (!user || !user.isAdmin) {
    return <div>Access denied. Admins only.</div>;
  }

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Quản lý người dùng</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Tên</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Email</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Admin</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Hành động
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {u.username}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {u.email}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {u.isAdmin ? "Có" : "Không"}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                <button
                  onClick={() => handleDelete(u._id)}
                  style={{
                    background: "red",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    cursor: "pointer",
                  }}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
