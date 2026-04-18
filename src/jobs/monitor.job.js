const cron = require("node-cron");
const axios = require("axios");
const db = require("../db");
const { sendDownAlert, sendRecoveryAlert } = require("../services/mailer"); // ← add this

const checkMonitor = async (monitor) => {
  const start = Date.now();
  let is_up = false;
  let status_code = null;
  let response_time_ms = null;

  try {
    const response = await axios.get(monitor.url, { timeout: 10000 });
    status_code = response.status;
    response_time_ms = Date.now() - start;
    is_up = status_code >= 200 && status_code < 400;
  } catch (err) {
    response_time_ms = Date.now() - start;
    status_code = err.response?.status || null;
    is_up = false;
  }

  await db.query(
    `INSERT INTO checks (monitor_id, status_code, response_time_ms, is_up)
     VALUES ($1, $2, $3, $4)`,
    [monitor.id, status_code, response_time_ms, is_up]
  );

  await handleIncident(monitor, is_up);

  console.log(`[${new Date().toISOString()}] ${monitor.name} — ${is_up ? "UP ✅" : "DOWN ❌"} (${response_time_ms}ms)`);
};

const handleIncident = async (monitor, is_up) => {
  // Get user email for alerts
  const userResult = await db.query(
    "SELECT email FROM users WHERE id = $1",
    [monitor.user_id]
  );
  const userEmail = userResult.rows[0]?.email;

  const openIncident = await db.query(
    `SELECT * FROM incidents WHERE monitor_id = $1 AND is_resolved = false`,
    [monitor.id]
  );

  if (!is_up && openIncident.rows.length === 0) {
    // Monitor just went down
    await db.query(
      `INSERT INTO incidents (monitor_id, started_at) VALUES ($1, NOW())`,
      [monitor.id]
    );
    console.log(`🚨 Incident created for ${monitor.name}`);

    // Send down alert email
    if (userEmail) await sendDownAlert(monitor, userEmail);
  }

  if (is_up && openIncident.rows.length > 0) {
    // Monitor recovered
    await db.query(
      `UPDATE incidents SET resolved_at = NOW(), is_resolved = true WHERE id = $1`,
      [openIncident.rows[0].id]
    );
    console.log(`✅ Incident resolved for ${monitor.name}`);

    // Send recovery alert email
    if (userEmail) await sendRecoveryAlert(monitor, userEmail);
  }
};

const startMonitorJob = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const result = await db.query("SELECT * FROM monitors WHERE is_active = true");
      const monitors = result.rows;
      if (monitors.length === 0) return;
      await Promise.all(monitors.map(checkMonitor));
    } catch (err) {
      console.error("Cron job error:", err.message);
    }
  });

  console.log("Monitor cron job started ⏰");
};

module.exports = { startMonitorJob };