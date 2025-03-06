import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./css/task-manager.css";

const TaskManager = ({ token, user, setToken }) => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUser, setSelectedUser] = useState(user.tc_no);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [registerUserName, setRegisterUserName] = useState("");
  const [registerTcNo, setRegisterTcNo] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerRole, setRegisterRole] = useState("user");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get("http://localhost:3002/tasks", {
          headers: { Authorization: token },
        });
        setTasks(res.data);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        toast.error("Failed to load tasks", { autoClose: 3000 });
      }
    };
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:3002/users", {
          headers: { Authorization: token },
        });
        setAvailableUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
    fetchTasks();
  }, [token]);

  const handleAddTask = async (e) => {
    e.preventDefault(); // Formun varsayılan submit davranışını engelle
    try {
      const res = await axios.post(
        "http://localhost:3002/tasks",
        { title, description, owner: selectedUser },
        { headers: { Authorization: token } }
      );
      setTasks([...tasks, res.data.task]);
      setTitle("");
      setDescription("");
      setSelectedUser(user.tc_no);
      toast.success("Task added successfully!", { autoClose: 2000 });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add task", {
        autoClose: 3000,
      });
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const res = await axios.put(
        `http://localhost:3002/tasks/${id}`,
        updates,
        { headers: { Authorization: token } }
      );
      setTasks(tasks.map((t) => (t.id === id ? res.data.task : t)));
      toast.success("Task updated successfully!", { autoClose: 2000 });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update task", {
        autoClose: 2000,
      });
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:3002/tasks/${id}`, {
        headers: { Authorization: token },
      });
      setTasks(tasks.filter((t) => t.id !== id));
      toast.success("Task deleted successfully", { autoClose: 2000 });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete task", {
        autoClose: 2000,
      });
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("jwtToken");
    toast.info("Logged out successfully", { autoClose: 2000 });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerTcNo.length !== 11 || !/^\d{11}$/.test(registerTcNo)) {
        toast.error("TC Identity Number must be exactly 11 digits", { autoClose: 2000 });
        return;
      }
    try {
      const res = await axios.post(
        "http://localhost:3002/register",
        {
          user_name: registerUserName,
          tc_no: registerTcNo,
          password: registerPassword,
          role: registerRole,
        },
        { headers: { Authorization: token } }
      );
      setRegisterUserName("");
      setRegisterTcNo("");
      setRegisterPassword("");
      setRegisterRole("user");
      setShowRegisterPopup(false);
      toast.success(res.data.message, { autoClose: 2000 });
      const usersRes = await axios.get("http://localhost:3002/users", {
        headers: { Authorization: token },
      });
      setAvailableUsers(usersRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register user", {
        autoClose: 2000,
      });
    }
  };

  return (
    <div className="task-container">
      <div className="task-card">
        <div className="task-header">
          <div className="header-top">
            <h1 className="task-title">Task Management Application</h1>
            <p className="user-greeting">Merhaba, {user.user_name}</p>
          </div>
          <div className="header-buttons">
            {user.role === 'admin' && (
              <button
                onClick={() => setShowRegisterPopup(true)}
                className="add-user-button"
              >
                Kullanıcı Ekle
              </button>
            )}
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>

        {/* Görev Ekleme Formu */}
        <form onSubmit={handleAddTask} className="task-form">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="task-input"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="task-textarea"
            required
          />
          {user.role === 'admin' ? (
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="task-input"
              required
            >
              <option value="" disabled>
                Select a user
              </option>
              {availableUsers.map((u) => (
                <option key={u.tc_no} value={u.tc_no}>
                  {u.user_name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={
                availableUsers.find((u) => u.tc_no === user.tc_no)?.user_name ||
                user.tc_no
              }
              className="task-input"
              disabled
            />
          )}
          <button type="submit" className="task-button">
            Add Task
          </button>
        </form>

        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className="task-item">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>Status: {task.status}</p>
              <p>
                Assigned to:{' '}
                {availableUsers.find((u) => u.tc_no === task.owner)?.user_name || task.owner}
              </p>
              <div className="task-item-buttons">
                <button
                  onClick={() =>
                    updateTask(task.id, {
                      status: task.status === 'Completed' ? 'Not Completed' : 'Completed',
                    })
                  }
                  className="task-item-button toggle"
                >
                  Toggle Status
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="task-item-button delete"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Kullanıcı Ekleme Popup Formu */}
      {showRegisterPopup && user.role === 'admin' && (
        <div className="popup-overlay" onClick={() => setShowRegisterPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h2>Kullanıcı Ekle</h2>
            <form onSubmit={handleRegister} className="task-form">
              <input
                value={registerUserName}
                onChange={(e) => setRegisterUserName(e.target.value)}
                placeholder="Username"
                className="task-input"
                required
              />
              <input
                value={registerTcNo}
                onChange={(e) => setRegisterTcNo(e.target.value)}
                placeholder="TC Identity Number"
                className="task-input"
                required
              />
              <input
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                placeholder="Password"
                className="task-input"
                required
              />
              <select
                value={registerRole}
                onChange={(e) => setRegisterRole(e.target.value)}
                className="task-input"
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <div className="popup-buttons">
                <button type="submit" className="task-button">
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegisterPopup(false)}
                  className="task-button cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default TaskManager;