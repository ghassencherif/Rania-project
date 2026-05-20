import express from "express";
import pool from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth, requireRole("participant"));

async function ensureParticipantTables() {
  await pool.execute(
    `CREATE TABLE IF NOT EXISTS user_profiles (
      user_id INT PRIMARY KEY,
      country VARCHAR(80) NULL,
      preferred_language VARCHAR(20) NOT NULL DEFAULT 'fr',
      traveler_type VARCHAR(80) NULL,
      interests TEXT NULL,
      average_budget DECIMAL(10,2) NULL,
      preferred_pace VARCHAR(30) NULL,
      dietary_restrictions VARCHAR(200) NULL,
      mobility VARCHAR(120) NULL,
      preferred_transport VARCHAR(80) NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  );

  await pool.execute(
    `CREATE TABLE IF NOT EXISTS favorites (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      activity_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_user_activity_favorite (user_id, activity_id),
      CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_favorites_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
    )`
  );

  await pool.execute(
    `CREATE TABLE IF NOT EXISTS activity_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      activity_id INT NOT NULL,
      action ENUM('viewed','saved','completed') NOT NULL DEFAULT 'viewed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_history_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
    )`
  );
}

router.get("/profile", async (req, res) => {
  try {
    await ensureParticipantTables();
    const [rows] = await pool.execute(
      `SELECT
        user_id AS userId,
        country,
        preferred_language AS preferredLanguage,
        traveler_type AS travelerType,
        interests,
        average_budget AS averageBudget,
        preferred_pace AS preferredPace,
        dietary_restrictions AS dietaryRestrictions,
        mobility,
        preferred_transport AS preferredTransport,
        updated_at AS updatedAt
      FROM user_profiles
      WHERE user_id = ?`,
      [req.user.id]
    );

    if (!rows.length) {
      return res.json({
        userId: req.user.id,
        country: "",
        preferredLanguage: "fr",
        travelerType: "",
        interests: "",
        averageBudget: null,
        preferredPace: "",
        dietaryRestrictions: "",
        mobility: "",
        preferredTransport: "",
      });
    }

    return res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Could not load profile", error: error.message });
  }
});

router.put("/profile", async (req, res) => {
  const {
    country,
    preferredLanguage,
    travelerType,
    interests,
    averageBudget,
    preferredPace,
    dietaryRestrictions,
    mobility,
    preferredTransport,
  } = req.body;

  try {
    await ensureParticipantTables();

    await pool.execute(
      `INSERT INTO user_profiles (
        user_id, country, preferred_language, traveler_type, interests,
        average_budget, preferred_pace, dietary_restrictions, mobility, preferred_transport
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        country = VALUES(country),
        preferred_language = VALUES(preferred_language),
        traveler_type = VALUES(traveler_type),
        interests = VALUES(interests),
        average_budget = VALUES(average_budget),
        preferred_pace = VALUES(preferred_pace),
        dietary_restrictions = VALUES(dietary_restrictions),
        mobility = VALUES(mobility),
        preferred_transport = VALUES(preferred_transport)`,
      [
        req.user.id,
        country || null,
        preferredLanguage || "fr",
        travelerType || null,
        interests || null,
        averageBudget ? Number(averageBudget) : null,
        preferredPace || null,
        dietaryRestrictions || null,
        mobility || null,
        preferredTransport || null,
      ]
    );

    return res.json({ message: "Profile updated" });
  } catch (error) {
    return res.status(500).json({ message: "Could not update profile", error: error.message });
  }
});

router.get("/favorites", async (req, res) => {
  try {
    await ensureParticipantTables();
    const [rows] = await pool.execute(
      `SELECT
        f.id,
        f.activity_id AS activityId,
        f.created_at AS favoritedAt,
        a.title,
        a.city,
        a.duration_minutes AS durationMinutes,
        a.category,
        a.summary,
        a.transport_options AS transportOptions,
        a.image_url AS imageUrl
      FROM favorites f
      JOIN activities a ON a.id = f.activity_id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    return res.json({ favorites: rows });
  } catch (error) {
    return res.status(500).json({ message: "Could not load favorites", error: error.message });
  }
});

router.post("/favorites/:activityId", async (req, res) => {
  const activityId = Number(req.params.activityId);

  if (!Number.isInteger(activityId) || activityId <= 0) {
    return res.status(400).json({ message: "Invalid activity id" });
  }

  try {
    await ensureParticipantTables();

    const [activity] = await pool.execute("SELECT id FROM activities WHERE id = ?", [activityId]);
    if (!activity.length) {
      return res.status(404).json({ message: "Activity not found" });
    }

    await pool.execute(
      "INSERT INTO favorites (user_id, activity_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE activity_id = VALUES(activity_id)",
      [req.user.id, activityId]
    );

    await pool.execute(
      "INSERT INTO activity_history (user_id, activity_id, action) VALUES (?, ?, 'saved')",
      [req.user.id, activityId]
    );

    return res.status(201).json({ message: "Added to favorites" });
  } catch (error) {
    return res.status(500).json({ message: "Could not add favorite", error: error.message });
  }
});

router.delete("/favorites/:activityId", async (req, res) => {
  const activityId = Number(req.params.activityId);

  if (!Number.isInteger(activityId) || activityId <= 0) {
    return res.status(400).json({ message: "Invalid activity id" });
  }

  try {
    await ensureParticipantTables();
    const [result] = await pool.execute(
      "DELETE FROM favorites WHERE user_id = ? AND activity_id = ?",
      [req.user.id, activityId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Could not remove favorite", error: error.message });
  }
});

router.get("/history", async (req, res) => {
  try {
    await ensureParticipantTables();
    const [rows] = await pool.execute(
      `SELECT
        h.id,
        h.activity_id AS activityId,
        h.action,
        h.created_at AS createdAt,
        a.title,
        a.city,
        a.duration_minutes AS durationMinutes,
        a.category,
        a.summary,
        a.transport_options AS transportOptions,
        a.image_url AS imageUrl
      FROM activity_history h
      JOIN activities a ON a.id = h.activity_id
      WHERE h.user_id = ?
      ORDER BY h.created_at DESC
      LIMIT 100`,
      [req.user.id]
    );

    return res.json({ history: rows });
  } catch (error) {
    return res.status(500).json({ message: "Could not load history", error: error.message });
  }
});

router.post("/history", async (req, res) => {
  const { activityId, action } = req.body;
  const safeAction = ["viewed", "saved", "completed"].includes(action) ? action : "viewed";

  if (!activityId) {
    return res.status(400).json({ message: "activityId is required" });
  }

  try {
    await ensureParticipantTables();
    await pool.execute(
      "INSERT INTO activity_history (user_id, activity_id, action) VALUES (?, ?, ?)",
      [req.user.id, Number(activityId), safeAction]
    );

    return res.status(201).json({ message: "History saved" });
  } catch (error) {
    return res.status(500).json({ message: "Could not save history", error: error.message });
  }
});

export default router;
