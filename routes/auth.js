const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authMiddleware = require("../middleware/authMiddleware");

// Mock "database"
let users = [];

// Secret key for JWT
const JWT_SECRET = "your_secret_key";

// Register route
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if user exists
  const userExists = users.find((u) => u.email === email);
  if (userExists)
    return res.status(400).json({ message: "User already exists" });

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save user (mock DB)
  const user = { name, email, password: hashedPassword, role };
  users.push(user);

  res.status(201).json({ message: "User registered successfully" });
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  // Verify role matches
  if (role && role.toLowerCase() !== user.role.toLowerCase()) {
    return res.status(400).json({ message: "Role mismatch" });
  }

  // Generate JWT
  const token = jwt.sign(
    { name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  // Return token + user data
  res.json({
    token,
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// Protected route example
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ message: `Hello ${req.user.name}, you are ${req.user.role}` });
});

module.exports = router;
