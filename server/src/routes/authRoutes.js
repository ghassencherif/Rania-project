import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { fullName, email, password, role, adminKey } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "fullName, email and password are required" });
  }

  try {
    const [existingUsers] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const canCreateAdmin =
      role === "admin" &&
      process.env.ADMIN_REGISTRATION_KEY &&
      adminKey === process.env.ADMIN_REGISTRATION_KEY;
    const safeRole = canCreateAdmin ? "admin" : "participant";

    const [result] = await pool.execute(
      "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [fullName, email, passwordHash, safeRole]
    );

    return res.status(201).json({
      id: result.insertId,
      fullName,
      email,
      role: safeRole,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register user", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    const [users] = await pool.execute(
      "SELECT id, full_name, email, role, password_hash FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, fullName: user.full_name },
      process.env.JWT_SECRET || "dev_secret_change_me",
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
});

export default router;
