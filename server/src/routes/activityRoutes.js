import express from "express";
import pool from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

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

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const r = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return r * c;
}

function mapActivity(activity, userLat, userLng) {
  const latitude = toNumber(activity.latitude);
  const longitude = toNumber(activity.longitude);
  const hasUserLocation = userLat !== null && userLng !== null;
  const hasActivityLocation = latitude !== null && longitude !== null;
  const distanceKm =
    hasUserLocation && hasActivityLocation
      ? haversineKm(userLat, userLng, latitude, longitude)
      : null;

  return {
    ...activity,
    budgetEstimate: activity.budgetEstimate !== null ? Number(activity.budgetEstimate) : null,
    latitude,
    longitude,
    distanceKm,
  };
}

router.get("/", async (_req, res) => {
  try {
    await ensureActivityColumns();
    const [activities] = await pool.execute(
      "SELECT id, title, city, address, latitude, longitude, duration_minutes AS durationMinutes, category, summary, budget_estimate AS budgetEstimate, transport_options AS transportOptions, image_url AS imageUrl FROM activities ORDER BY created_at DESC"
    );

    return res.json(activities);
  } catch (error) {
    return res.status(500).json({ message: "Could not load activities", error: error.message });
  }
});

router.get("/recommendations", requireAuth, requireRole("participant"), async (req, res) => {
  const userCity = (req.query.city || "Tunis").toString();
  const availableMinutes = Number(req.query.availableMinutes || 120);
  const category = req.query.category ? req.query.category.toString() : "";
  const maxBudget = Number(req.query.maxBudget || 0);
  const maxDistanceKm = Number(req.query.maxDistanceKm || 0);
  const sortBy = (req.query.sortBy || "duration").toString();
  const userLat = toNumber(req.query.userLat);
  const userLng = toNumber(req.query.userLng);

  try {
    await ensureActivityColumns();

    const conditions = ["city = ?", "duration_minutes <= ?"];
    const params = [userCity, availableMinutes];

    if (category) {
      conditions.push("category = ?");
      params.push(category);
    }

    if (maxBudget > 0) {
      conditions.push("(budget_estimate IS NULL OR budget_estimate <= ?)");
      params.push(maxBudget);
    }

    const sql = `SELECT id, title, city, address, latitude, longitude, duration_minutes AS durationMinutes, category, summary, budget_estimate AS budgetEstimate, transport_options AS transportOptions, image_url AS imageUrl
      FROM activities
      WHERE ${conditions.join(" AND ")}
      ORDER BY duration_minutes ASC`;

    const [rows] = await pool.execute(
      sql,
      params
    );

    let activities = rows.map((row) => mapActivity(row, userLat, userLng));

    if (maxDistanceKm > 0 && userLat !== null && userLng !== null) {
      activities = activities.filter(
        (activity) => activity.distanceKm === null || activity.distanceKm <= maxDistanceKm
      );
    }

    if (sortBy === "closest" && userLat !== null && userLng !== null) {
      activities.sort((a, b) => {
        if (a.distanceKm === null && b.distanceKm === null) return 0;
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    } else if (sortBy === "budget") {
      activities.sort((a, b) => {
        const ba = a.budgetEstimate ?? Number.POSITIVE_INFINITY;
        const bb = b.budgetEstimate ?? Number.POSITIVE_INFINITY;
        return ba - bb;
      });
    } else {
      activities.sort((a, b) => a.durationMinutes - b.durationMinutes);
    }

    activities = activities.slice(0, 8);

    return res.json({
      city: userCity,
      availableMinutes,
      category,
      maxBudget,
      maxDistanceKm,
      sortBy,
      userLocation: userLat !== null && userLng !== null ? { latitude: userLat, longitude: userLng } : null,
      recommendations: activities,
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not build recommendations", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid activity id" });
  }

  try {
    await ensureActivityColumns();
    const [rows] = await pool.execute(
      "SELECT id, title, city, address, latitude, longitude, duration_minutes AS durationMinutes, category, summary, budget_estimate AS budgetEstimate, transport_options AS transportOptions, image_url AS imageUrl FROM activities WHERE id = ?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Activity not found" });
    }

    return res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Could not load activity", error: error.message });
  }
});

export default router;
