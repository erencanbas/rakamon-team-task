require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs").promises;

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  throw new Error("SECRET_KEY is not defined!");
}

const app = express();
app.use(cors());
app.use(express.json());



const USERS_FILE = "./users.json";
const TASKS_FILE = "./tasks.json";

let users = [];
let tasks = [];

const loadUsers = async () => {
  try {
    const data = await fs.readFile(USERS_FILE, "utf8");
    users = JSON.parse(data);
  } catch (err) {
    console.log("No users file found, initializing with default users");
    users = [
      { user_name: "Eren Admin", tc_no: "43212354366", password: null, role: "admin" },
      { user_name: "Eren Kullanıcı", tc_no: "85423167894", password: null, role: "user" },
    ];
    await initializeDefaultUsers();
  }
};

const loadTasks = async () => {
  try {
    const data = await fs.readFile(TASKS_FILE, "utf8");
    tasks = JSON.parse(data);
  } catch (err) {
    console.log("No tasks file found, starting with empty tasks");
    tasks = [];
  }
};

const saveUsers = async () => {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
};

const saveTasks = async () => {
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
};

const bcryptHashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const initializeDefaultUsers = async () => {
  users[0].password = await bcryptHashPassword("admin123");
  users[1].password = await bcryptHashPassword("user123");
  await saveUsers();
};

(async () => {
  await loadUsers();
  await loadTasks();
  console.log("Users loaded:", users);
})();

const auth = (req, res, next) => {
  const getJwtToken = req.headers["authorization"];
  if (!getJwtToken)
    return res.status(403).json({ message: "Token is required", status: false });

  jwt.verify(getJwtToken, SECRET_KEY, (err, decoded) => {
    if (err)
      return res.status(403).json({ message: "Invalid Token", status: false });
    req.user = decoded;
    next();
  });
};

app.post("/login", async (req, res) => {
  const { tc_no, password } = req.body;
  console.log("Login attempt:", { tc_no, password });
  const user = users.find((usr) => usr.tc_no === tc_no);
  if (!user)
    return res.status(401).json({ message: "No matching users found for the TC number", status: false });

  const checkPassword = await bcrypt.compare(password, user.password);
  if (!checkPassword)
    return res.status(401).json({ message: "The password is not correct", status: false });

  const jwtToken = jwt.sign(
    { tc_no: user.tc_no, role: user.role, user_name: user.user_name },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
  res.json({ jwtToken });
});

app.get("/users", auth, (req, res) => {
  const userList = users.map(({ user_name, tc_no }) => ({ user_name, tc_no }));
  res.json(userList);
});

app.post("/register", auth, async (req, res) => {
  const { user_name, tc_no, password, role } = req.body;
  const { role: requesterRole } = req.user;

  if (requesterRole !== "admin") {
    return res.status(403).json({ message: "Only admins can register new users", status: false });
  }

  if (!user_name || !tc_no || !password) {
    return res.status(400).json({ message: "Username, TC number, and password are required", status: false });
  }

  if(tc_no.length !== 11 || !/^\d{11}$/.test(tc_no)) {
    return res.status(400).json({ message: "TC Identity Number must be exactly 11 digits", status: false });
  }
  
  if (users.some((u) => u.tc_no === tc_no)) {
    return res.status(400).json({ message: "TC number already exists", status: false });
  }

  if (!["admin", "user"].includes(role)) {
    return res.status(400).json({ message: "Role must be either 'admin' or 'user'", status: false });
  }

  const hashedPassword = await bcryptHashPassword(password);
  const newUser = { user_name, tc_no, password: hashedPassword, role };
  users.push(newUser);
  await saveUsers();
  console.log("New user registered:", newUser);
  res.status(201).json({ message: "User registered successfully", status: true });
});

app.get("/tasks", auth, (req, res) => {
  const { tc_no, role } = req.user;
  if (role === "admin") {
    res.json(tasks);
  } else {
    const userTasks = tasks.filter((task) => task.owner === tc_no);
    res.json(userTasks);
  }
});

app.post("/tasks", auth, async (req, res) => {
  const { title, description, status, owner } = req.body;
  const { tc_no, role } = req.user;

  if (role !== "admin" && owner !== tc_no) {
    return res.status(403).json({ message: "You can only assign tasks to yourself", status: false });
  }

  const newTask = {
    id: Date.now(),
    title,
    description,
    status: status || "Not Completed",
    owner,
  };
  tasks.push(newTask);
  await saveTasks();
  res.status(201).json({ message: "Task created successfully", task: newTask });
});

app.put("/tasks/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;
  const { tc_no, role } = req.user;

  const task = tasks.find((t) => t.id === Number(id));
  if (!task) {
    return res.status(404).json({ message: "Task not found", status: false });
  }
  if (task.owner !== tc_no && role !== "admin") {
    return res.status(403).json({ message: "You do not have permission to edit this task", status: false });
  }

  task.title = title || task.title;
  task.description = description || task.description;
  task.status = status || task.status;
  await saveTasks();
  res.json({ message: "Task updated successfully", task });
});

app.delete("/tasks/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { tc_no, role } = req.user;

  const taskIndex = tasks.findIndex((t) => t.id === Number(id));
  if (taskIndex === -1) {
    return res.status(404).json({ message: "Task not found", status: false });
  }

  const task = tasks[taskIndex];
  if (!task) {
    return res.status(404).json({ message: "Task not found", status: false });
  }

  if (task.owner !== tc_no && role !== "admin") {
    return res.status(403).json({ message: "You do not have permission to delete this task", status: false });
  }

  tasks.splice(taskIndex, 1);
  await saveTasks();
  res.json({ message: "Task deleted successfully" });
});

app.listen(3002, () => console.log("Port 3002 is pushing up now"));