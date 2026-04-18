const db = require("../db");

// GET all monitors for logged in user
const getMonitors = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM monitors WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch monitors", error: err.message });
  }
};

// GET single monitor
const getMonitor = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM monitors WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Monitor not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch monitor", error: err.message });
  }
};

// CREATE monitor
const createMonitor = async (req, res) => {
  const { name, url, interval_minutes } = req.body;

  if (!name || !url) {
    return res.status(400).json({ message: "Name and URL are required" });
  }

  try {
    const result = await db.query(
      `INSERT INTO monitors (user_id, name, url, interval_minutes) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [req.user.id, name, url, interval_minutes || 5]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to create monitor", error: err.message });
  }
};

// UPDATE monitor
const updateMonitor = async (req, res) => {
  const { name, url, interval_minutes, is_active } = req.body;

  try {
    const result = await db.query(
      `UPDATE monitors 
       SET name = COALESCE($1, name),
           url = COALESCE($2, url),
           interval_minutes = COALESCE($3, interval_minutes),
           is_active = COALESCE($4, is_active)
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [name, url, interval_minutes, is_active, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Monitor not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to update monitor", error: err.message });
  }
};

// DELETE monitor
const deleteMonitor = async (req, res) => {
  try {
    const result = await db.query(
      "DELETE FROM monitors WHERE id = $1 AND user_id = $2 RETURNING *",
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Monitor not found" });
    }
    res.json({ message: "Monitor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete monitor", error: err.message });
  }
};

// GET check history for a monitor
const getChecks = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM checks 
       WHERE monitor_id = $1 
       ORDER BY checked_at DESC 
       LIMIT 100`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch checks", error: err.message });
  }
};

// GET incidents for a monitor
const getIncidents = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM incidents 
       WHERE monitor_id = $1 
       ORDER BY started_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch incidents", error: err.message });
  }
};

module.exports = { 
  getMonitors, getMonitor, createMonitor, 
  updateMonitor, deleteMonitor,
  getChecks, getIncidents // ← add these
};

