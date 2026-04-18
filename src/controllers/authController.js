const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// SIGNUP
const signup = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    const existing = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash the password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await db.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, password_hash]
    );

    // Generate token
    const token = jwt.sign({ id: result.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.status(201).json({ token, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

// LOGIN
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

module.exports = { signup, login };