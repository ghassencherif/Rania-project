import express from "express";
import pool from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth, requireRole("participant"));

/* ──────────────────────────────────────────
   Helpers
────────────────────────────────────────── */
function toMinutes(timeStr) {
  const [h, m] = timeStr.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

function toTime(minutes) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/* ──────────────────────────────────────────
   GET /api/agenda?date=YYYY-MM-DD
   Returns all events for the user on that day
────────────────────────────────────────── */
router.get("/", async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);

  try {
    const [events] = await pool.execute(
      `SELECT id, title,
              DATE_FORMAT(event_date, '%Y-%m-%d') AS eventDate,
              TIME_FORMAT(start_time, '%H:%i') AS startTime,
              TIME_FORMAT(end_time, '%H:%i') AS endTime
       FROM agenda_events
       WHERE user_id = ? AND event_date = ?
       ORDER BY start_time ASC`,
      [req.user.id, date]
    );

    return res.json({ date, events });
  } catch (err) {
    return res.status(500).json({ message: "Could not load agenda", error: err.message });
  }
});

/* ──────────────────────────────────────────
   GET /api/agenda/free-slots
   ?date=YYYY-MM-DD&workStart=08:00&workEnd=20:00&minSlotMinutes=30
   Computes free windows between events
────────────────────────────────────────── */
router.get("/free-slots", async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const workStart = req.query.workStart || "08:00";
  const workEnd = req.query.workEnd || "20:00";
  const minSlotMinutes = Number(req.query.minSlotMinutes || 30);

  try {
    const [events] = await pool.execute(
      `SELECT TIME_FORMAT(start_time, '%H:%i') AS startTime,
              TIME_FORMAT(end_time, '%H:%i') AS endTime
       FROM agenda_events
       WHERE user_id = ? AND event_date = ?
       ORDER BY start_time ASC`,
      [req.user.id, date]
    );

    let cursor = toMinutes(workStart);
    const end = toMinutes(workEnd);
    const freeSlots = [];

    for (const ev of events) {
      const evStart = toMinutes(ev.startTime);
      const evEnd = toMinutes(ev.endTime);

      if (evStart > cursor) {
        const duration = evStart - cursor;
        if (duration >= minSlotMinutes) {
          freeSlots.push({
            startTime: toTime(cursor),
            endTime: toTime(evStart),
            durationMinutes: duration,
          });
        }
      }

      if (evEnd > cursor) cursor = evEnd;
    }

    if (end > cursor) {
      const duration = end - cursor;
      if (duration >= minSlotMinutes) {
        freeSlots.push({
          startTime: toTime(cursor),
          endTime: toTime(end),
          durationMinutes: duration,
        });
      }
    }

    return res.json({ date, workStart, workEnd, freeSlots });
  } catch (err) {
    return res.status(500).json({ message: "Could not compute free slots", error: err.message });
  }
});

/* ──────────────────────────────────────────
   POST /api/agenda
   Body: { title, eventDate, startTime, endTime }
────────────────────────────────────────── */
router.post("/", async (req, res) => {
  const { title, eventDate, startTime, endTime } = req.body;

  if (!title || !eventDate || !startTime || !endTime) {
    return res
      .status(400)
      .json({ message: "title, eventDate, startTime and endTime are required" });
  }

  if (toMinutes(startTime) >= toMinutes(endTime)) {
    return res.status(400).json({ message: "endTime must be after startTime" });
  }

  try {
    const [result] = await pool.execute(
      "INSERT INTO agenda_events (user_id, title, event_date, start_time, end_time) VALUES (?, ?, ?, ?, ?)",
      [req.user.id, title, eventDate, startTime, endTime]
    );

    return res.status(201).json({
      id: result.insertId,
      title,
      eventDate,
      startTime,
      endTime,
    });
  } catch (err) {
    return res.status(500).json({ message: "Could not add event", error: err.message });
  }
});

/* ──────────────────────────────────────────
   DELETE /api/agenda/:id
────────────────────────────────────────── */
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.execute(
      "DELETE FROM agenda_events WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: "Could not delete event", error: err.message });
  }
});

export default router;
