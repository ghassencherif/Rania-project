import express from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth, requireRole("admin"));

async function ensureActivityColumns() {
  await pool.execute(
    "ALTER TABLE activities ADD COLUMN IF NOT EXISTS transport_options VARCHAR(255) NULL AFTER summary"
  );
  await pool.execute(
    "ALTER TABLE activities ADD COLUMN IF NOT EXISTS budget_estimate DECIMAL(10,2) NULL AFTER summary"
  );
  await pool.execute(
    "ALTER TABLE activities ADD COLUMN IF NOT EXISTS address VARCHAR(255) NULL AFTER city"
  );
  await pool.execute(
    "ALTER TABLE activities ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7) NULL AFTER address"
  );
  await pool.execute(
    "ALTER TABLE activities ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7) NULL AFTER latitude"
  );
}

router.get("/overview", async (_req, res) => {
  try {
    await ensureActivityColumns();
    const [[usersCount]] = await pool.execute("SELECT COUNT(*) AS totalUsers FROM users");
    const [[participantsCount]] = await pool.execute(
      "SELECT COUNT(*) AS totalParticipants FROM users WHERE role = 'participant'"
    );
    const [[activitiesCount]] = await pool.execute("SELECT COUNT(*) AS totalActivities FROM activities");

    return res.json({
      totalUsers: usersCount.totalUsers,
      totalParticipants: participantsCount.totalParticipants,
      totalActivities: activitiesCount.totalActivities,
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not load admin overview", error: error.message });
  }
});

router.get("/users", async (req, res) => {
  const role = req.query.role?.toString();
  const allowedRoles = ["admin", "participant"];

  try {
    let sql =
      "SELECT id, full_name AS fullName, email, role, created_at AS createdAt FROM users ORDER BY created_at DESC";
    const params = [];

    if (role && allowedRoles.includes(role)) {
      sql =
        "SELECT id, full_name AS fullName, email, role, created_at AS createdAt FROM users WHERE role = ? ORDER BY created_at DESC";
      params.push(role);
    }

    const [users] = await pool.execute(sql, params);
    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Could not load users", error: error.message });
  }
});

router.post("/users", async (req, res) => {
  const { fullName, email, password, role } = req.body;
  const safeRole = role === "admin" ? "admin" : "participant";

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "fullName, email and password are required" });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  try {
    const [existingUsers] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
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
    return res.status(500).json({ message: "Could not create user", error: error.message });
  }
});

router.post("/activities", async (req, res) => {
  const {
    title,
    city,
    address,
    latitude,
    longitude,
    durationMinutes,
    category,
    summary,
    imageUrl,
    transportOptions,
    budgetEstimate,
  } = req.body;

  if (!title || !city || !durationMinutes || !category || !summary) {
    return res.status(400).json({ message: "Missing required activity fields" });
  }

  try {
    await ensureActivityColumns();
    const [result] = await pool.execute(
      "INSERT INTO activities (title, city, address, latitude, longitude, duration_minutes, category, summary, budget_estimate, transport_options, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        title,
        city,
        address || null,
        latitude ? Number(latitude) : null,
        longitude ? Number(longitude) : null,
        Number(durationMinutes),
        category,
        summary,
        budgetEstimate ? Number(budgetEstimate) : null,
        transportOptions || null,
        imageUrl || null,
      ]
    );

    return res.status(201).json({
      id: result.insertId,
      title,
      city,
      address: address || null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      durationMinutes,
      category,
      summary,
      budgetEstimate: budgetEstimate ? Number(budgetEstimate) : null,
      transportOptions: transportOptions || null,
      imageUrl,
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not create activity", error: error.message });
  }
});

router.put("/activities/:id", async (req, res) => {
  const { id } = req.params;
  const {
    title,
    city,
    address,
    latitude,
    longitude,
    durationMinutes,
    category,
    summary,
    imageUrl,
    transportOptions,
    budgetEstimate,
  } = req.body;

  try {
    await ensureActivityColumns();
    const [result] = await pool.execute(
      "UPDATE activities SET title = ?, city = ?, address = ?, latitude = ?, longitude = ?, duration_minutes = ?, category = ?, summary = ?, budget_estimate = ?, transport_options = ?, image_url = ? WHERE id = ?",
      [
        title,
        city,
        address || null,
        latitude ? Number(latitude) : null,
        longitude ? Number(longitude) : null,
        Number(durationMinutes),
        category,
        summary,
        budgetEstimate ? Number(budgetEstimate) : null,
        transportOptions || null,
        imageUrl || null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Activity not found" });
    }

    return res.json({
      id: Number(id),
      title,
      city,
      address: address || null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      durationMinutes,
      category,
      summary,
      budgetEstimate: budgetEstimate ? Number(budgetEstimate) : null,
      transportOptions: transportOptions || null,
      imageUrl,
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not update activity", error: error.message });
  }
});

router.delete("/activities/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute("DELETE FROM activities WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Activity not found" });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Could not delete activity", error: error.message });
  }
});

export default router;
