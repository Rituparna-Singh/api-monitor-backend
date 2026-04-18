require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");

const authRoutes = require("./routes/auth");
const monitorRoutes = require("./routes/monitors");
const { startMonitorJob } = require("./jobs/monitor.job"); // ← add this

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/monitors", monitorRoutes);

app.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "DB connected ✅" });
  } catch (err) {
    res.status(500).json({ status: "DB connection failed ❌", error: err.message });
  }
});

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://api-monitor-frontend-three.vercel.app/" // ← paste your vercel URL here
  ]
}));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);

  startMonitorJob(); // ← start cron job after server starts
});